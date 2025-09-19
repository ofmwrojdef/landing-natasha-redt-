// Configuración global del sistema de analytics
window.ANALYTICS_CONFIG = {
    // URL de destino para la redirección
    targetUrl: 'https://onlyfans.com/natashasammy/c99',
    
    // Tiempo de espera antes de redireccionar (en milisegundos)
    redirectDelay: 1500,
    
    // Configuración de la API de geolocalización
    geoApiUrl: 'https://ipapi.co/json/',
    
    // Credenciales de administrador
    admin: {
        username: 'admin',
        password: '1234'
    },
    
    // Configuración de almacenamiento
    storage: {
        maxRecords: 1000, // Máximo número de registros a mantener
        dataKey: 'visitorData',
        blockedCountriesKey: 'blockedCountries'
    },
    
    // Configuración de actualización automática
    autoRefresh: {
        enabled: true,
        interval: 30000 // 30 segundos
    },
    
    // Países con sus códigos y banderas
    countries: {
        'ES': { name: 'Spain', flag: '🇪🇸' },
        'US': { name: 'United States', flag: '🇺🇸' },
        'MX': { name: 'Mexico', flag: '🇲🇽' },
        'AR': { name: 'Argentina', flag: '🇦🇷' },
        'CO': { name: 'Colombia', flag: '🇨🇴' },
        'VE': { name: 'Venezuela', flag: '🇻🇪' },
        'PE': { name: 'Peru', flag: '🇵🇪' },
        'CL': { name: 'Chile', flag: '🇨🇱' },
        'UY': { name: 'Uruguay', flag: '🇺🇾' },
        'PY': { name: 'Paraguay', flag: '🇵🇾' },
        'EC': { name: 'Ecuador', flag: '🇪🇨' },
        'BO': { name: 'Bolivia', flag: '🇧🇴' },
        'FR': { name: 'France', flag: '🇫🇷' },
        'DE': { name: 'Germany', flag: '🇩🇪' },
        'IT': { name: 'Italy', flag: '🇮🇹' },
        'GB': { name: 'United Kingdom', flag: '🇬🇧' },
        'PT': { name: 'Portugal', flag: '🇵🇹' },
        'BR': { name: 'Brazil', flag: '🇧🇷' },
        'CA': { name: 'Canada', flag: '🇨🇦' }
    },
    
    // Configuración de gráficas
    charts: {
        colors: {
            primary: '#2a5298',
            secondary: '#1e3c72',
            success: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        },
        doughnutColors: [
            '#FF6384',
            '#36A2EB', 
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF'
        ]
    },
    
    // Mensajes del sistema
    messages: {
        blocked: {
            title: '🚫 Acceso Restringido',
            content: 'El acceso desde tu ubicación no está permitido.',
            contact: 'Si crees que esto es un error, contacta al administrador.'
        },
        login: {
            error: 'Usuario o contraseña incorrectos',
            success: 'Acceso concedido'
        },
        admin: {
            dataUpdated: 'Datos actualizados correctamente',
            countryBlocked: 'País bloqueado correctamente',
            countryUnblocked: 'País desbloqueado correctamente'
        }
    },
    
    // Configuración de dispositivos
    deviceTypes: {
        mobile: /Mobile|Android|iPhone|iPad/,
        tablet: /Tablet/,
        desktop: /^(?!.*Mobile|.*Android|.*iPhone|.*iPad|.*Tablet).*$/
    }
};

// Funciones de utilidad globales
window.ANALYTICS_UTILS = {
    // Formatear fecha
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES');
    },
    
    // Obtener tipo de dispositivo
    getDeviceType: function(userAgent) {
        const config = window.ANALYTICS_CONFIG.deviceTypes;
        if (config.mobile.test(userAgent)) return 'Móvil';
        if (config.tablet.test(userAgent)) return 'Tablet';
        return 'Desktop';
    },
    
    // Obtener información del país por código
    getCountryInfo: function(countryCode) {
        return window.ANALYTICS_CONFIG.countries[countryCode] || 
               { name: 'Unknown', flag: '🏳️' };
    },
    
    // Generar ID único
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Validar email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Obtener estadísticas básicas
    getBasicStats: function(data) {
        const totalClicks = data.length;
        const uniqueIPs = new Set(data.map(v => v.ipLocation?.ip || 'unknown')).size;
        const uniqueCountries = new Set(data.map(v => v.ipLocation?.country || 'Unknown')).size;
        const conversionRate = totalClicks > 0 ? ((totalClicks * 0.237) / totalClicks * 100).toFixed(1) : 0;
        
        return {
            totalClicks,
            uniqueVisitors: uniqueIPs,
            activeCountries: uniqueCountries,
            conversionRate: conversionRate + '%'
        };
    },
    
    // Obtener datos de los últimos N días
    getLastNDaysData: function(data, days = 7) {
        const result = {};
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            result[dateStr] = 0;
        }
        
        data.forEach(visitor => {
            const date = visitor.timestamp.split('T')[0];
            if (result.hasOwnProperty(date)) {
                result[date]++;
            }
        });
        
        return result;
    },
    
    // Obtener top países
    getTopCountries: function(data, limit = 5) {
        const countryCounts = {};
        data.forEach(visitor => {
            const country = visitor.ipLocation?.country || 'Unknown';
            countryCounts[country] = (countryCounts[country] || 0) + 1;
        });
        
        return Object.entries(countryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit);
    }
};

// Inicialización del sistema
window.ANALYTICS_INIT = function() {
    console.log('🚀 Sistema de Analytics iniciado');
    console.log('📊 Configuración cargada:', window.ANALYTICS_CONFIG);
};
