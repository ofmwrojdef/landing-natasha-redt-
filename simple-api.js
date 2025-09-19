// Sistema simple de API para base de datos propia
window.SimpleAPI = {
    
    // URL base de la API
    baseUrl: 'api.php',
    
    // Enviar datos de visitante
    async sendVisitorData(visitorData) {
        try {
            const response = await fetch(`${this.baseUrl}?action=visitor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
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
                })
            });
            
            const result = await response.json();
            return result.success;
            
        } catch (error) {
            console.error('Error enviando datos del visitante:', error);
            return false;
        }
    },
    
    // Obtener estadísticas completas
    async getStatistics() {
        try {
            const response = await fetch(`${this.baseUrl}?action=stats`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Error obteniendo estadísticas');
            }
            
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
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
            const response = await fetch(`${this.baseUrl}?action=blocked`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Error obteniendo países bloqueados');
            }
            
        } catch (error) {
            console.error('Error obteniendo países bloqueados:', error);
            return [];
        }
    },
    
    // Actualizar países bloqueados
    async updateBlockedCountries(countries) {
        try {
            const response = await fetch(`${this.baseUrl}?action=blocked`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ countries })
            });
            
            const result = await response.json();
            return result.success;
            
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
    
    // Limpiar datos antiguos
    async cleanupOldData() {
        try {
            const response = await fetch(`${this.baseUrl}?action=cleanup`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            return result.success;
            
        } catch (error) {
            console.error('Error limpiando datos antiguos:', error);
            return false;
        }
    }
};

// Inicialización automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de API simple inicializado');
});
