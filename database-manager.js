// Sistema de base de datos centralizada usando JSONBin.io
window.DatabaseManager = {
    
    // Configuración de JSONBin.io (servicio gratuito de base de datos JSON)
    config: {
        apiUrl: 'https://api.jsonbin.io/v3/b',
        binId: '675c8f8dacd3cb34a8b47e2a', // ID del bin creado para este proyecto
        apiKey: '$2a$10$8vY3q6yI5F9K4mN2pL7eO.1xZ8wV4t6R9eS2dF5gH7jM3nK8qP9o', // API key para JSONBin
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': '$2a$10$8vY3q6yI5F9K4mN2pL7eO.1xZ8wV4t6R9eS2dF5gH7jM3nK8qP9o'
        }
    },
    
    // Enviar datos de visitante a la base de datos centralizada
    async sendVisitorData(visitorData) {
        try {
            console.log('📤 Enviando datos del visitante a la base de datos...');
            
            // Primero obtener los datos existentes
            const existingData = await this.getAllVisitorData();
            
            // Agregar el nuevo visitante
            existingData.push({
                ...visitorData,
                id: this.generateId(),
                serverTimestamp: new Date().toISOString()
            });
            
            // Mantener solo los últimos 5000 registros para no exceder límites
            if (existingData.length > 5000) {
                existingData.splice(0, existingData.length - 5000);
            }
            
            // Enviar datos actualizados
            const response = await fetch(`${this.config.apiUrl}/${this.config.binId}`, {
                method: 'PUT',
                headers: this.config.headers,
                body: JSON.stringify({
                    visitors: existingData,
                    lastUpdated: new Date().toISOString(),
                    totalVisitors: existingData.length
                })
            });
            
            if (response.ok) {
                console.log('✅ Datos enviados correctamente a la base de datos');
                return true;
            } else {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error enviando datos a la base de datos:', error);
            // Guardar en localStorage como backup
            this.saveToLocalStorage(visitorData);
            return false;
        }
    },
    
    // Obtener todos los datos de visitantes desde la base de datos
    async getAllVisitorData() {
        try {
            const response = await fetch(`${this.config.apiUrl}/${this.config.binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.config.headers['X-Master-Key']
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.record?.visitors || [];
            } else {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo datos de la base de datos:', error);
            // Fallback a localStorage
            return this.getFromLocalStorage();
        }
    },
    
    // Obtener estadísticas desde la base de datos
    async getStatistics() {
        try {
            const visitors = await this.getAllVisitorData();
            
            const totalClicks = visitors.length;
            const uniqueIPs = new Set(visitors.map(v => v.ipLocation?.ip)).size;
            const uniqueCountries = new Set(visitors.map(v => v.ipLocation?.country)).size;
            
            // Calcular visitantes de hoy
            const today = new Date().toISOString().split('T')[0];
            const todayVisitors = visitors.filter(v => 
                v.timestamp.split('T')[0] === today || 
                v.serverTimestamp?.split('T')[0] === today
            ).length;
            
            // Calcular visitantes por día (últimos 7 días)
            const last7Days = {};
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                last7Days[dateStr] = 0;
            }
            
            visitors.forEach(visitor => {
                const date = (visitor.serverTimestamp || visitor.timestamp).split('T')[0];
                if (last7Days.hasOwnProperty(date)) {
                    last7Days[date]++;
                }
            });
            
            // Top países
            const countryCounts = {};
            visitors.forEach(visitor => {
                const country = visitor.ipLocation?.country || 'Sin ubicación';
                countryCounts[country] = (countryCounts[country] || 0) + 1;
            });
            
            const topCountries = Object.entries(countryCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
            
            return {
                totalClicks,
                uniqueVisitors: uniqueIPs,
                activeCountries: uniqueCountries,
                todayClicks: todayVisitors,
                clicksByDay: last7Days,
                topCountries,
                allVisitors: visitors
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return {
                totalClicks: 0,
                uniqueVisitors: 0,
                activeCountries: 0,
                todayClicks: 0,
                clicksByDay: {},
                topCountries: [],
                allVisitors: []
            };
        }
    },
    
    // Backup en localStorage
    saveToLocalStorage(visitorData) {
        try {
            const existing = JSON.parse(localStorage.getItem('backup_visitor_data') || '[]');
            existing.push(visitorData);
            
            if (existing.length > 100) {
                existing.splice(0, existing.length - 100);
            }
            
            localStorage.setItem('backup_visitor_data', JSON.stringify(existing));
        } catch (error) {
            console.error('Error guardando backup en localStorage:', error);
        }
    },
    
    // Obtener datos del localStorage como fallback
    getFromLocalStorage() {
        try {
            return JSON.parse(localStorage.getItem('backup_visitor_data') || '[]');
        } catch (error) {
            console.error('Error obteniendo datos del localStorage:', error);
            return [];
        }
    },
    
    // Obtener países bloqueados desde la base de datos
    async getBlockedCountries() {
        try {
            const response = await fetch(`${this.config.apiUrl}/${this.config.binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.config.headers['X-Master-Key']
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.record?.blockedCountries || [];
            }
            
        } catch (error) {
            console.error('Error obteniendo países bloqueados:', error);
        }
        
        // Fallback a localStorage
        return JSON.parse(localStorage.getItem('blocked_countries') || '[]');
    },
    
    // Actualizar países bloqueados en la base de datos
    async updateBlockedCountries(blockedCountries) {
        try {
            // Obtener datos actuales
            const currentData = await fetch(`${this.config.apiUrl}/${this.config.binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.config.headers['X-Master-Key']
                }
            });
            
            if (currentData.ok) {
                const data = await currentData.json();
                const record = data.record || {};
                
                // Actualizar solo los países bloqueados
                record.blockedCountries = blockedCountries;
                record.lastUpdated = new Date().toISOString();
                
                const response = await fetch(`${this.config.apiUrl}/${this.config.binId}`, {
                    method: 'PUT',
                    headers: this.config.headers,
                    body: JSON.stringify(record)
                });
                
                if (response.ok) {
                    // También guardar en localStorage como backup
                    localStorage.setItem('blocked_countries', JSON.stringify(blockedCountries));
                    return true;
                }
            }
            
        } catch (error) {
            console.error('Error actualizando países bloqueados:', error);
        }
        
        // Fallback a localStorage
        localStorage.setItem('blocked_countries', JSON.stringify(blockedCountries));
        return false;
    },
    
    // Verificar si un país está bloqueado
    async isCountryBlocked(countryCode) {
        const blockedCountries = await this.getBlockedCountries();
        return blockedCountries.includes(countryCode);
    },
    
    // Generar ID único para visitantes
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Limpiar datos antiguos (solo últimos 30 días)
    async cleanOldData() {
        try {
            const visitors = await this.getAllVisitorData();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            
            const filteredVisitors = visitors.filter(visitor => {
                const visitorDate = new Date(visitor.serverTimestamp || visitor.timestamp);
                return visitorDate >= cutoffDate;
            });
            
            if (filteredVisitors.length !== visitors.length) {
                // Actualizar la base de datos con datos limpios
                const response = await fetch(`${this.config.apiUrl}/${this.config.binId}`, {
                    method: 'PUT',
                    headers: this.config.headers,
                    body: JSON.stringify({
                        visitors: filteredVisitors,
                        lastUpdated: new Date().toISOString(),
                        totalVisitors: filteredVisitors.length
                    })
                });
                
                if (response.ok) {
                    console.log(`🧹 Limpieza completada: ${visitors.length - filteredVisitors.length} registros eliminados`);
                }
            }
            
        } catch (error) {
            console.error('Error limpiando datos antiguos:', error);
        }
    },
    
    // Función de prueba para verificar conectividad
    async testConnection() {
        try {
            const response = await fetch(`${this.config.apiUrl}/${this.config.binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.config.headers['X-Master-Key']
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error de conectividad:', error);
            return false;
        }
    }
};

// Inicializar el sistema
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 Sistema de base de datos centralizada inicializado');
    
    // Limpiar datos antiguos automáticamente
    setTimeout(() => {
        window.DatabaseManager.cleanOldData();
    }, 5000);
});
