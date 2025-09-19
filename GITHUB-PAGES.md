# 🚀 Sistema de Analytics para GitHub Pages

## 📋 Descripción
Sistema completo de redirección y analytics diseñado específicamente para **GitHub Pages**. Funciona sin servidor backend usando solo archivos estáticos.

## 📁 Archivos del Sistema
```
/
├── index.html              # Página principal con redirección
├── admin_ofmcarlos/        # Panel de administración
│   └── index.html          # Dashboard completo
├── github-db.js            # Sistema de base de datos para GitHub Pages
├── data.json               # Archivo de datos (se actualiza manualmente)
├── .htaccess              # Configuración del servidor (opcional)
└── GITHUB-PAGES.md        # Este archivo
```

## 🔧 Configuración para GitHub Pages

### 1. Crear el Repositorio
```bash
# Crear nuevo repositorio en GitHub
# Nombre sugerido: natashasammy-analytics
# Habilitar GitHub Pages en Settings
```

### 2. Configurar el Sistema
✅ **Ya configurado** en `github-db.js`:
```javascript
config: {
    owner: 'ofmwrojdef',               // Tu nombre de usuario
    repo: 'landing-natasha-redt-',     // Nombre del repositorio
    dataFile: 'data.json',             // Archivo de datos
    branch: 'main'                     // Rama principal
}
```

### 3. Subir Archivos
✅ **Repositorio ya existe**:
```bash
git clone https://github.com/ofmwrojdef/landing-natasha-redt-.git
cd landing-natasha-redt-
# Actualizar archivos con la nueva versión
git add .
git commit -m "Actualización para GitHub Pages"
git push origin main
```

### 4. Habilitar GitHub Pages
1. Ve a Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / (root)
4. Save

## 🌐 URLs de Acceso
- **Página principal**: `https://ofmwrojdef.github.io/landing-natasha-redt-/`
- **Panel de admin**: `https://ofmwrojdef.github.io/landing-natasha-redt-/admin_ofmcarlos`

## 🔐 Credenciales
- **Usuario**: `admin`
- **Contraseña**: `1234`

## 📊 Cómo Funciona

### Almacenamiento de Datos
1. **localStorage**: Datos almacenados en el navegador del visitante
2. **GitHub Repository**: Archivo `data.json` para sincronización manual
3. **Combinación**: El dashboard combina datos locales + repositorio

### Flujo de Visitantes
1. Visitante entra → Ruedecita de carga
2. Obtiene geolocalización por IP
3. Verifica países bloqueados
4. Guarda datos en localStorage
5. Redirecciona a OnlyFans

### Dashboard de Administración
1. Lee datos del localStorage
2. Combina con datos del repositorio
3. Muestra estadísticas en tiempo real
4. Permite exportar a GitHub

## 🔄 Sincronización de Datos

### Automática (localStorage)
- Los datos se guardan automáticamente en cada visita
- Solo visible desde el dispositivo del administrador

### Manual (GitHub Repository)
1. Entra al panel de administración
2. Clic en "📤 Exportar a GitHub"
3. Copia el JSON generado
4. Edita `data.json` en GitHub
5. Pega el contenido y haz commit

## 📈 Funcionalidades

### ✅ Página Principal
- Redirección automática a OnlyFans
- Tracking de geolocalización por IP
- Sistema de países bloqueados
- Animación de carga

### ✅ Panel de Administración
- Estadísticas en tiempo real
- Gráficas de clics por día
- Top 5 países
- Tabla de visitantes
- Control de países bloqueados
- Exportación a GitHub

### ✅ Métricas Disponibles
- Total de clics
- Visitantes únicos (por IP)
- Países activos
- Clics de hoy
- Gráfica de últimos 7 días
- Distribución por países

## 🛡️ Seguridad y Limitaciones

### GitHub Pages Limitaciones
- ❌ No hay base de datos real
- ❌ No hay backend/servidor
- ❌ Datos limitados a localStorage + archivo JSON
- ❌ Sincronización manual requerida

### Ventajas
- ✅ Completamente gratuito
- ✅ Sin configuración de servidor
- ✅ Funciona inmediatamente
- ✅ Control total de los datos
- ✅ Sin dependencias externas

## 🔧 Personalización

### Cambiar URL de Redirección
Edita `index.html` línea 153:
```javascript
window.location.href = 'https://tu-nueva-url.com';
```

### Cambiar Credenciales de Admin
Edita `admin_ofmcarlos/index.html` línea 447:
```javascript
if (username === 'tu-usuario' && password === 'tu-contraseña') {
```

### Modificar Límites
Edita `github-db.js`:
```javascript
// Línea 50: Límite de visitantes
if (existingData.visitors.length > 1000) {

// Línea 242: Días de retención
cleanupOldData(daysToKeep = 30) {
```

## 🆘 Solución de Problemas

### No aparecen datos en el dashboard
1. Los datos están en localStorage del navegador
2. Solo visible desde el dispositivo donde entran visitantes
3. Usa "Exportar a GitHub" para sincronizar

### La redirección no funciona
1. Verifica que GitHub Pages esté habilitado
2. Comprueba la URL del repositorio
3. Espera unos minutos para propagación

### Error en geolocalización
1. La API `ipapi.co` puede tener límites
2. Se usa una API gratuita con 1000 requests/día
3. En caso de error, continúa sin bloquear

## 📞 Características Técnicas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Gráficas**: Chart.js
- **Geolocalización**: ipapi.co API
- **Almacenamiento**: localStorage + GitHub JSON
- **Hosting**: GitHub Pages (gratis)
- **SSL**: Automático con GitHub Pages

## 🎯 Próximas Mejoras

- [ ] API automática de GitHub (sin edición manual)
- [ ] Webhooks para sincronización automática
- [ ] Sistema de notificaciones
- [ ] Exportación a CSV/Excel
- [ ] Dashboard para múltiples dominios

---

**¡Sistema listo para usar en GitHub Pages!** 🎉

Recuerda configurar las URLs en `github-db.js` antes de usar.
