// Sistema REAL de base de datos para capturar TODOS los visitantes
window.RealDatabase = {
    
    // Configuración de Supabase (base de datos gratuita)
    config: {
        url: 'https://yilnerarjbfnafegzwir.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpbG5lcmFyamJmbmFmZWd6d2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODM3MTIsImV4cCI6MjA3Mzg1OTcxMn0.D7Zo3V8YWypssMvrYlEk6A0Uvn9S33X8FHhWOPcpLKI',
        table: 'visitors'
    },
    
    // Inicializar cliente de Supabase
    initClient() {
        if (typeof supabase === 'undefined') {
            console.error('Supabase no está cargado');
            return null;
        }
        return supabase.createClient(this.config.url, this.config.key);
    },
    
    // Enviar datos de visitante a la base de datos REAL
    async sendVisitorData(visitorData) {
        try {
            // Preparar datos para enviar
            const dataToSend = {
                timestamp: new Date().toISOString(),
                ip: visitorData.ipLocation?.ip || 'unknown',
                country: visitorData.ipLocation?.country || 'Sin ubicación',
                country_code: visitorData.ipLocation?.countryCode || 'XX',
                region: visitorData.ipLocation?.region || 'unknown',
                city: visitorData.ipLocation?.city || 'unknown',
                latitude: visitorData.ipLocation?.latitude,
                longitude: visitorData.ipLocation?.longitude,
                timezone: visitorData.ipLocation?.timezone,
                user_agent: visitorData.userAgent || '',
                language: visitorData.language || '',
                referrer: visitorData.referrer || '',
                url: visitorData.url || '',
                device_type: this.getDeviceType(visitorData.userAgent),
                browser: this.getBrowser(visitorData.userAgent)
            };
            
            console.log('📤 Enviando a base de datos real:', dataToSend);
            
            // Enviar usando fetch directo (sin Supabase client para simplicidad)
            const response = await fetch(`${this.config.url}/rest/v1/${this.config.table}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.config.key,
                    'Authorization': `Bearer ${this.config.key}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(dataToSend)
            });
            
            if (response.ok) {
                console.log('✅ Datos enviados a base de datos real');
                return true;
            } else {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error enviando a base de datos:', error);
            
            // Guardar en localStorage como backup
            this.saveToLocalStorage(visitorData);
            return false;
        }
    },
    
    // Obtener TODOS los visitantes desde la base de datos real
    async getAllVisitors() {
        try {
            const response = await fetch(`${this.config.url}/rest/v1/${this.config.table}?select=*&order=timestamp.desc&limit=1000`, {
                headers: {
                    'apikey': this.config.key,
                    'Authorization': `Bearer ${this.config.key}`
                }
            });
            
            if (response.ok) {
                const visitors = await response.json();
                console.log('📊 Visitantes obtenidos desde DB real:', visitors.length);
                return visitors;
            } else {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo visitantes:', error);
            return this.getFromLocalStorage();
        }
    },
    
    // Obtener estadísticas desde la base de datos real
    async getStatistics() {
        try {
            const visitors = await this.getAllVisitors();
            
            if (!visitors || visitors.length === 0) {
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
            
            const totalClicks = visitors.length;
            const uniqueIPs = new Set(visitors.map(v => v.ip)).size;
            const countries = new Set(visitors.filter(v => v.country && v.country !== 'Sin ubicación').map(v => v.country));
            const activeCountries = countries.size;
            
            // Clics de hoy
            const today = new Date().toISOString().split('T')[0];
            const todayClicks = visitors.filter(v => v.timestamp.split('T')[0] === today).length;
            
            // Últimos 7 días
            const last7Days = {};
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                last7Days[dateStr] = visitors.filter(v => v.timestamp.split('T')[0] === dateStr).length;
            }
            
            // Top países
            const countryCounts = {};
            visitors.forEach(visitor => {
                const country = visitor.country || 'Sin ubicación';
                countryCounts[country] = (countryCounts[country] || 0) + 1;
            });
            
            const topCountries = Object.entries(countryCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
            
            return {
                totalClicks,
                uniqueVisitors: uniqueIPs,
                activeCountries,
                todayClicks,
                clicksByDay: last7Days,
                topCountries,
                allVisitors: visitors.slice(0, 100) // Últimos 100 para la tabla
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
    
    // Obtener países bloqueados
    async getBlockedCountries() {
        try {
            const response = await fetch(`${this.config.url}/rest/v1/blocked_countries?select=*`, {
                headers: {
                    'apikey': this.config.key,
                    'Authorization': `Bearer ${this.config.key}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.map(item => item.country_code);
            }
            
        } catch (error) {
            console.error('Error obteniendo países bloqueados:', error);
        }
        
        // Fallback a localStorage
        return JSON.parse(localStorage.getItem('blocked_countries') || '[]');
    },
    
    // Actualizar países bloqueados
    async updateBlockedCountries(countries) {
        try {
            // Primero eliminar todos los países bloqueados existentes
            await fetch(`${this.config.url}/rest/v1/blocked_countries`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.config.key,
                    'Authorization': `Bearer ${this.config.key}`
                }
            });
            
            // Insertar los nuevos países bloqueados
            if (countries.length > 0) {
                const data = countries.map(code => ({ country_code: code }));
                
                const response = await fetch(`${this.config.url}/rest/v1/blocked_countries`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': this.config.key,
                        'Authorization': `Bearer ${this.config.key}`
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    localStorage.setItem('blocked_countries', JSON.stringify(countries));
                    return true;
                }
            }
            
        } catch (error) {
            console.error('Error actualizando países bloqueados:', error);
        }
        
        // Fallback a localStorage
        localStorage.setItem('blocked_countries', JSON.stringify(countries));
        return false;
    },
    
    // Verificar si un país está bloqueado
    async isCountryBlocked(countryCode) {
        try {
            const blockedCountries = await this.getBlockedCountries();
            return blockedCountries.includes(countryCode);
        } catch (error) {
            console.error('Error verificando país bloqueado:', error);
            return false;
        }
    },
    
    // Funciones auxiliares
    getDeviceType(userAgent) {
        if (!userAgent) return 'Desktop';
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) return 'Móvil';
        if (/Tablet/.test(userAgent)) return 'Tablet';
        return 'Desktop';
    },
    
    getBrowser(userAgent) {
        if (!userAgent) return 'Unknown';
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Other';
    },
    
    // Backup en localStorage
    saveToLocalStorage(visitorData) {
        try {
            const existing = JSON.parse(localStorage.getItem('backup_visitors') || '[]');
            existing.push({
                timestamp: new Date().toISOString(),
                ip: visitorData.ipLocation?.ip || 'unknown',
                country: visitorData.ipLocation?.country || 'Sin ubicación',
                city: visitorData.ipLocation?.city || 'unknown'
            });
            
            if (existing.length > 100) {
                existing.splice(0, existing.length - 100);
            }
            
            localStorage.setItem('backup_visitors', JSON.stringify(existing));
        } catch (error) {
            console.error('Error guardando backup:', error);
        }
    },
    
    // Obtener datos del localStorage como fallback
    getFromLocalStorage() {
        try {
            return JSON.parse(localStorage.getItem('backup_visitors') || '[]');
        } catch (error) {
            console.error('Error obteniendo backup:', error);
            return [];
        }
    }
};

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 Sistema de base de datos REAL inicializado');
});
