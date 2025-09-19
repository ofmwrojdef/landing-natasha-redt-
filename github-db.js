// Sistema de base de datos usando GitHub Pages y localStorage
window.GitHubDB = {
    
    // Configuración para usar un archivo JSON en el mismo repositorio
    config: {
        owner: 'ofmwrojdef',           // Tu nombre de usuario de GitHub
        repo: 'landing-natasha-redt-', // Nombre del repositorio
        dataFile: 'data.json',        // Archivo donde se guardarán los datos
        branch: 'main'                 // Rama principal
    },
    
    // Obtener datos desde el archivo JSON del repositorio
    async getData() {
        try {
            // Intentar obtener desde la URL del archivo raw de GitHub
            const url = `https://raw.githubusercontent.com/${this.config.owner}/${this.config.repo}/${this.config.branch}/${this.config.dataFile}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                // Si no existe el archivo, devolver estructura vacía
                return {
                    visitors: [],
                    blockedCountries: [],
                    lastUpdated: new Date().toISOString()
                };
            }
        } catch (error) {
            console.log('📄 Archivo de datos no encontrado, usando datos locales');
            return this.getLocalData();
        }
    },
    
    // Guardar visitante (solo en localStorage para GitHub Pages)
    saveVisitor(visitorData) {
        try {
            // Obtener datos existentes del localStorage
            const existingData = this.getLocalData();
            
            // Agregar nuevo visitante
            const newVisitor = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                timestamp: new Date().toISOString(),
                ip: visitorData.ipLocation?.ip || 'unknown',
                country: visitorData.ipLocation?.country || 'Sin ubicación',
                countryCode: visitorData.ipLocation?.countryCode || 'XX',
                region: visitorData.ipLocation?.region || 'unknown',
                city: visitorData.ipLocation?.city || 'unknown',
                latitude: visitorData.ipLocation?.latitude,
                longitude: visitorData.ipLocation?.longitude,
                timezone: visitorData.ipLocation?.timezone,
                userAgent: visitorData.userAgent || '',
                language: visitorData.language || '',
                referrer: visitorData.referrer || '',
                url: visitorData.url || ''
            };
            
            existingData.visitors.push(newVisitor);
            
            // Mantener solo los últimos 1000 registros
            if (existingData.visitors.length > 1000) {
                existingData.visitors = existingData.visitors.slice(-1000);
            }
            
            existingData.lastUpdated = new Date().toISOString();
            
            // Guardar en localStorage
            localStorage.setItem('natashasammy_data', JSON.stringify(existingData));
            
            // También guardar en sessionStorage como backup
            sessionStorage.setItem('natashasammy_data', JSON.stringify(existingData));
            
            return true;
        } catch (error) {
            console.error('Error guardando visitante:', error);
            return false;
        }
    },
    
    // Obtener datos del localStorage
    getLocalData() {
        try {
            // Intentar localStorage primero
            let data = localStorage.getItem('natashasammy_data');
            
            // Si no hay, intentar sessionStorage
            if (!data) {
                data = sessionStorage.getItem('natashasammy_data');
            }
            
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error obteniendo datos locales:', error);
        }
        
        // Estructura por defecto
        return {
            visitors: [],
            blockedCountries: [],
            lastUpdated: new Date().toISOString()
        };
    },
    
    // Obtener estadísticas calculadas
    async getStatistics() {
        // Combinar datos del repositorio con datos locales
        const repoData = await this.getData();
        const localData = this.getLocalData();
        
        // Combinar visitantes (evitar duplicados por ID)
        const allVisitors = [...repoData.visitors];
        
        localData.visitors.forEach(localVisitor => {
            const exists = allVisitors.find(v => v.id === localVisitor.id);
            if (!exists) {
                allVisitors.push(localVisitor);
            }
        });
        
        // Calcular estadísticas
        const totalClicks = allVisitors.length;
        const uniqueIPs = new Set(allVisitors.map(v => v.ip)).size;
        const countries = new Set(allVisitors.filter(v => v.country && v.country !== 'Sin ubicación').map(v => v.country));
        const activeCountries = countries.size;
        
        // Calcular visitantes de hoy
        const today = new Date().toISOString().split('T')[0];
        const todayVisitors = allVisitors.filter(v => v.timestamp.split('T')[0] === today);
        const todayClicks = todayVisitors.length;
        
        // Calcular últimos 7 días
        const last7Days = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days[dateStr] = allVisitors.filter(v => v.timestamp.split('T')[0] === dateStr).length;
        }
        
        // Top países
        const countryCounts = {};
        allVisitors.forEach(visitor => {
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
            allVisitors: allVisitors.slice(-100) // Últimos 100 para la tabla
        };
    },
    
    // Obtener países bloqueados
    async getBlockedCountries() {
        const data = await this.getData();
        const localData = this.getLocalData();
        
        // Combinar países bloqueados
        const allBlocked = new Set([...data.blockedCountries, ...localData.blockedCountries]);
        return Array.from(allBlocked);
    },
    
    // Actualizar países bloqueados
    updateBlockedCountries(countries) {
        try {
            const localData = this.getLocalData();
            localData.blockedCountries = countries;
            localData.lastUpdated = new Date().toISOString();
            
            localStorage.setItem('natashasammy_data', JSON.stringify(localData));
            sessionStorage.setItem('natashasammy_data', JSON.stringify(localData));
            
            return true;
        } catch (error) {
            console.error('Error actualizando países bloqueados:', error);
            return false;
        }
    },
    
    // Verificar si un país está bloqueado
    async isCountryBlocked(countryCode) {
        try {
            const blockedCountries = await this.getBlockedCountries();
            return blockedCountries.includes(countryCode);
        } catch (error) {
            console.error('Error verificando país bloqueado:', error);
            return false; // En caso de error, permitir acceso
        }
    },
    
    // Exportar datos para crear el archivo JSON del repositorio
    exportForRepository() {
        const localData = this.getLocalData();
        return {
            visitors: localData.visitors,
            blockedCountries: localData.blockedCountries,
            lastUpdated: localData.lastUpdated,
            totalVisitors: localData.visitors.length,
            exportedAt: new Date().toISOString()
        };
    },
    
    // Generar código para actualizar el repositorio
    generateUpdateInstructions() {
        const data = this.exportForRepository();
        const jsonContent = JSON.stringify(data, null, 2);
        
        return {
            filename: this.config.dataFile,
            content: jsonContent,
            instructions: `
Para actualizar los datos en GitHub:

1. Ve a tu repositorio: https://github.com/${this.config.owner}/${this.config.repo}
2. Edita o crea el archivo: ${this.config.dataFile}
3. Copia y pega este contenido:

${jsonContent}

4. Haz commit de los cambios
5. Los datos se sincronizarán automáticamente
            `
        };
    },
    
    // Limpiar datos antiguos
    cleanupOldData(daysToKeep = 30) {
        try {
            const data = this.getLocalData();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            const filteredVisitors = data.visitors.filter(visitor => {
                const visitorDate = new Date(visitor.timestamp);
                return visitorDate >= cutoffDate;
            });
            
            const removed = data.visitors.length - filteredVisitors.length;
            
            data.visitors = filteredVisitors;
            data.lastUpdated = new Date().toISOString();
            
            localStorage.setItem('natashasammy_data', JSON.stringify(data));
            
            return removed;
        } catch (error) {
            console.error('Error limpiando datos:', error);
            return 0;
        }
    }
};

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema GitHub Pages inicializado');
    
    // Limpiar datos antiguos automáticamente
    const removed = window.GitHubDB.cleanupOldData(30);
    if (removed > 0) {
        console.log(`🧹 Limpieza automática: ${removed} registros antiguos eliminados`);
    }
});
