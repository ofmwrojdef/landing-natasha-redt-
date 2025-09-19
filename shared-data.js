// Sistema de almacenamiento compartido para datos de visitantes
window.SharedDataManager = {
    
    // Clave para almacenar datos
    STORAGE_KEY: 'natashasammy_visitor_data',
    BLOCKED_COUNTRIES_KEY: 'natashasammy_blocked_countries',
    
    // Obtener datos de visitantes
    getVisitorData: function() {
        try {
            // Intentar obtener de localStorage primero
            let data = localStorage.getItem(this.STORAGE_KEY);
            
            // Si no hay datos en localStorage, intentar sessionStorage
            if (!data) {
                data = sessionStorage.getItem(this.STORAGE_KEY);
            }
            
            // Si aún no hay datos, intentar obtener del dominio padre
            if (!data && window.parent !== window) {
                // Intentar comunicarse con la ventana padre
                window.parent.postMessage({
                    type: 'requestVisitorData',
                    origin: window.location.origin
                }, '*');
            }
            
            return JSON.parse(data || '[]');
        } catch (e) {
            console.error('Error al obtener datos de visitantes:', e);
            return [];
        }
    },
    
    // Guardar datos de visitantes
    saveVisitorData: function(data) {
        try {
            const jsonData = JSON.stringify(data);
            
            // Guardar en localStorage
            localStorage.setItem(this.STORAGE_KEY, jsonData);
            
            // También guardar en sessionStorage como backup
            sessionStorage.setItem(this.STORAGE_KEY, jsonData);
            
            // Notificar a otras ventanas/tabs abiertas
            this.broadcastUpdate('visitorData', data);
            
            return true;
        } catch (e) {
            console.error('Error al guardar datos de visitantes:', e);
            return false;
        }
    },
    
    // Agregar un nuevo visitante
    addVisitor: function(visitorData) {
        const existingData = this.getVisitorData();
        existingData.push(visitorData);
        
        // Mantener solo los últimos 1000 registros
        if (existingData.length > 1000) {
            existingData.splice(0, existingData.length - 1000);
        }
        
        return this.saveVisitorData(existingData);
    },
    
    // Obtener países bloqueados
    getBlockedCountries: function() {
        try {
            const data = localStorage.getItem(this.BLOCKED_COUNTRIES_KEY) || 
                        sessionStorage.getItem(this.BLOCKED_COUNTRIES_KEY);
            return JSON.parse(data || '[]');
        } catch (e) {
            console.error('Error al obtener países bloqueados:', e);
            return [];
        }
    },
    
    // Guardar países bloqueados
    saveBlockedCountries: function(countries) {
        try {
            const jsonData = JSON.stringify(countries);
            localStorage.setItem(this.BLOCKED_COUNTRIES_KEY, jsonData);
            sessionStorage.setItem(this.BLOCKED_COUNTRIES_KEY, jsonData);
            
            this.broadcastUpdate('blockedCountries', countries);
            return true;
        } catch (e) {
            console.error('Error al guardar países bloqueados:', e);
            return false;
        }
    },
    
    // Verificar si un país está bloqueado
    isCountryBlocked: function(countryCode) {
        const blockedCountries = this.getBlockedCountries();
        return blockedCountries.includes(countryCode);
    },
    
    // Bloquear/desbloquear país
    toggleCountryBlock: function(countryCode) {
        const blockedCountries = this.getBlockedCountries();
        const index = blockedCountries.indexOf(countryCode);
        
        if (index > -1) {
            blockedCountries.splice(index, 1);
            this.saveBlockedCountries(blockedCountries);
            return false; // Desbloqueado
        } else {
            blockedCountries.push(countryCode);
            this.saveBlockedCountries(blockedCountries);
            return true; // Bloqueado
        }
    },
    
    // Difundir actualizaciones a otras ventanas/tabs
    broadcastUpdate: function(type, data) {
        try {
            // Usar BroadcastChannel si está disponible
            if (window.BroadcastChannel) {
                const channel = new BroadcastChannel('natashasammy_updates');
                channel.postMessage({
                    type: type,
                    data: data,
                    timestamp: new Date().toISOString()
                });
            }
            
            // También usar postMessage para ventanas padre/hijo
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'dataUpdate',
                    updateType: type,
                    data: data
                }, '*');
            }
            
            // Notificar a ventanas abiertas
            if (window.opener) {
                window.opener.postMessage({
                    type: 'dataUpdate',
                    updateType: type,
                    data: data
                }, '*');
            }
            
        } catch (e) {
            console.log('No se pudo difundir la actualización:', e);
        }
    },
    
    // Escuchar actualizaciones de otras ventanas
    listenForUpdates: function(callback) {
        try {
            // Escuchar BroadcastChannel
            if (window.BroadcastChannel) {
                const channel = new BroadcastChannel('natashasammy_updates');
                channel.onmessage = function(event) {
                    callback(event.data);
                };
            }
            
            // Escuchar postMessage
            window.addEventListener('message', function(event) {
                if (event.data.type === 'dataUpdate') {
                    callback(event.data);
                }
            });
            
        } catch (e) {
            console.log('No se pudo configurar el listener de actualizaciones:', e);
        }
    },
    
    // Limpiar datos antiguos
    cleanOldData: function(daysToKeep = 30) {
        const data = this.getVisitorData();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const filteredData = data.filter(visitor => {
            const visitorDate = new Date(visitor.timestamp);
            return visitorDate >= cutoffDate;
        });
        
        this.saveVisitorData(filteredData);
        return data.length - filteredData.length; // Retornar número de registros eliminados
    },
    
    // Exportar datos para backup
    exportData: function() {
        return {
            visitorData: this.getVisitorData(),
            blockedCountries: this.getBlockedCountries(),
            exportDate: new Date().toISOString()
        };
    },
    
    // Importar datos desde backup
    importData: function(backupData) {
        try {
            if (backupData.visitorData) {
                this.saveVisitorData(backupData.visitorData);
            }
            if (backupData.blockedCountries) {
                this.saveBlockedCountries(backupData.blockedCountries);
            }
            return true;
        } catch (e) {
            console.error('Error al importar datos:', e);
            return false;
        }
    }
};

// Inicializar el sistema al cargar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Sistema de datos compartido inicializado');
    
    // Limpiar datos antiguos automáticamente
    const removedRecords = window.SharedDataManager.cleanOldData(30);
    if (removedRecords > 0) {
        console.log(`🧹 Se eliminaron ${removedRecords} registros antiguos`);
    }
});
