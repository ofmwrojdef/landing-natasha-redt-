# 🚀 Sistema de Redirección y Analytics - Natasha Sammy

## 📋 Descripción
Sistema completo de redirección con analytics avanzados para el dominio `natashasammy.us`. Incluye tracking de visitantes, geolocalización, métricas detalladas y panel de administración.

## 🏗️ Estructura del Proyecto
```
/
├── index.html              # Página principal con redirección automática
├── admin_ofmcarlos/        # Panel de administración
│   └── index.html          # Dashboard con métricas y controles
├── .htaccess              # Configuración del servidor web
└── README.md              # Este archivo
```

## 🔧 Configuración e Instalación

### 1. Subir Archivos al Servidor
- Sube todos los archivos al directorio raíz de tu dominio `natashasammy.us`
- Asegúrate de que el archivo `.htaccess` esté en la raíz

### 2. Verificar Configuración del Servidor
- El servidor debe tener Apache con mod_rewrite habilitado
- Verificar que PHP no sea necesario (todo funciona con HTML/JS puro)

### 3. URLs de Acceso
- **Página principal**: `https://natashasammy.us/`
- **Panel de admin**: `https://natashasammy.us/admin_ofmcarlos`

## 🔐 Credenciales de Acceso

### Panel de Administración
- **Usuario**: `admin`
- **Contraseña**: `1234`

## 📊 Funcionalidades

### Página Principal (`index.html`)
- ✅ Redirección automática a OnlyFans
- ✅ Tracking de visitantes con geolocalización
- ✅ Detección de país por IP
- ✅ Sistema de bloqueo por país
- ✅ Animación de carga profesional
- ✅ Almacenamiento local de datos

### Panel de Administración (`/admin_ofmcarlos`)
- ✅ Login seguro con credenciales
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gráficas interactivas (Chart.js)
- ✅ Métricas principales:
  - Total de clics
  - Visitantes únicos
  - Países activos
  - Tasa de conversión

### 📈 Analytics Avanzados
- ✅ Gráfica de clics por día (últimos 7 días)
- ✅ Top 5 países con gráfica de dona
- ✅ Tabla de visitantes con detalles completos
- ✅ Control de países (bloquear/desbloquear)
- ✅ Actualización automática cada 30 segundos

### 🌍 Tracking de Geolocalización
- ✅ IP del visitante
- ✅ País, región y ciudad
- ✅ Coordenadas (latitud/longitud)
- ✅ Zona horaria
- ✅ Información del dispositivo
- ✅ Referrer y User-Agent

## 🛠️ Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Gráficas**: Chart.js
- **API de Geolocalización**: ipapi.co
- **Iconos**: Font Awesome 6
- **Estilos**: CSS Grid/Flexbox
- **Almacenamiento**: localStorage

## 🔒 Características de Seguridad
- Headers de seguridad configurados
- Protección XSS
- Frame protection
- Content-Type sniffing protection
- Acceso restringido a archivos de configuración

## 📱 Responsive Design
- Totalmente compatible con móviles
- Diseño adaptativo para tablets
- UI moderna y profesional
- Animaciones suaves

## 🚀 Optimizaciones
- Compresión GZIP habilitada
- Caché configurado para archivos estáticos
- Carga asíncrona de recursos
- Código optimizado y minificado

## 📝 Datos Almacenados
Los datos se almacenan localmente en el navegador e incluyen:
- Timestamp de la visita
- Información de geolocalización
- Detalles del dispositivo
- Referrer y URL
- User-Agent completo

## 🔧 Mantenimiento
- Los datos se mantienen automáticamente (últimos 1000 registros)
- Limpieza automática de registros antiguos
- Actualización en tiempo real del dashboard
- Backup automático en localStorage

## 🎯 Próximas Mejoras
- [ ] Exportación de datos a CSV/Excel
- [ ] Filtros avanzados por fecha
- [ ] Notificaciones push para nuevos visitantes
- [ ] API REST para integración externa
- [ ] Dashboard para múltiples dominios

## 🆘 Soporte y Contacto
Para soporte técnico o modificaciones, contacta al desarrollador.

---
**Desarrollado por**: AI Assistant  
**Versión**: 1.0  
**Fecha**: Septiembre 2025
