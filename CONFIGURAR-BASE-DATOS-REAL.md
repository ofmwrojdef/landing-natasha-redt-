# 🗄️ Configurar Base de Datos REAL para Capturar TODOS los Visitantes

## 🎯 El Problema Actual
- GitHub Pages **NO captura** datos de otros visitantes
- Solo ves **TUS propios datos** en localStorage
- Los visitantes **NO envían** datos a ningún servidor

## ✅ Solución REAL
Vamos a usar **Supabase** (base de datos gratuita) para capturar **TODOS** los visitantes reales.

---

## 🚀 Paso 1: Crear Cuenta en Supabase

### 1. Registrarse:
1. Ve a: https://supabase.com
2. Clic en **"Start your project"**
3. Regístrate con GitHub o email
4. **Es 100% GRATUITO**

### 2. Crear Proyecto:
1. Clic en **"New Project"**
2. Nombre: `natasha-analytics`
3. Database Password: `tu_password_seguro`
4. Region: Europe (más cerca)
5. Clic en **"Create new project"**

---

## 🗃️ Paso 2: Crear Tablas en la Base de Datos

### 1. Ir al SQL Editor:
1. En el panel de Supabase → **SQL Editor**
2. Clic en **"New query"**

### 2. Crear Tabla de Visitantes:
```sql
-- Tabla para almacenar TODOS los visitantes
CREATE TABLE visitors (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip TEXT,
    country TEXT,
    country_code TEXT,
    region TEXT,
    city TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    timezone TEXT,
    user_agent TEXT,
    language TEXT,
    referrer TEXT,
    url TEXT,
    device_type TEXT,
    browser TEXT
);

-- Índices para mejor rendimiento
CREATE INDEX idx_visitors_timestamp ON visitors(timestamp);
CREATE INDEX idx_visitors_country ON visitors(country);
CREATE INDEX idx_visitors_ip ON visitors(ip);
```

### 3. Crear Tabla de Países Bloqueados:
```sql
-- Tabla para países bloqueados
CREATE TABLE blocked_countries (
    id SERIAL PRIMARY KEY,
    country_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Ejecutar:
- Clic en **"Run"** para ejecutar las consultas

---

## 🔑 Paso 3: Configurar Acceso Público

### 1. Ir a Authentication → Policies:
1. En el panel → **Authentication** → **Policies**
2. Para tabla `visitors`:
   - Clic en **"New Policy"**
   - Template: **"Enable insert access for all users"**
   - Clic en **"Use this template"**
   - Clic en **"Save policy"**

### 2. Para tabla `blocked_countries`:
- Repetir el proceso para **insert** y **select**

---

## ⚙️ Paso 4: Obtener Credenciales

### 1. Ir a Settings → API:
1. En el panel → **Settings** → **API**
2. Copiar:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **API Key (anon public)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🔧 Paso 5: Configurar el Sistema

### 1. Actualizar `real-database.js`:
```javascript
config: {
    url: 'https://TU_PROJECT_URL.supabase.co',    // ← Pegar tu URL
    key: 'TU_API_KEY_AQUÍ',                       // ← Pegar tu API Key
    table: 'visitors'
}
```

### 2. Actualizar `index.html`:
```html
<!-- Reemplazar github-db.js con real-database.js -->
<script src="real-database.js"></script>
```

### 3. Actualizar las funciones:
```javascript
// Cambiar window.GitHubDB por window.RealDatabase
const success = window.RealDatabase.sendVisitorData(data);
```

---

## 🎉 Resultado Final

### ✅ Lo que Obtienes:
- **Base de datos REAL** en la nube
- **TODOS los visitantes** de cualquier lugar del mundo
- **IP, país, ciudad** de cada visitante
- **Dashboard real** con datos reales
- **100% gratuito** hasta 50,000 visits/mes

### 📊 Datos que Capturará:
```json
{
    "ip": "192.168.1.100",
    "country": "Spain",
    "city": "Madrid",
    "timestamp": "2025-01-19T15:30:00Z",
    "device_type": "Móvil",
    "browser": "Chrome",
    "referrer": "https://google.com"
}
```

---

## 🔧 Implementación Rápida

### Opción A: Manual (15 minutos)
1. Crear cuenta Supabase
2. Ejecutar SQL queries
3. Copiar credenciales
4. Actualizar archivos

### Opción B: Te ayudo
- Dame las credenciales de Supabase
- Actualizo todos los archivos automáticamente
- Sistema funcionando en 5 minutos

---

## 💰 Límites Gratuitos de Supabase

### ✅ Plan Gratuito Incluye:
- **500MB** de base de datos
- **5GB** de transferencia/mes
- **50,000** requests/mes
- **2** proyectos

### 📈 Para tu uso:
- **≈50,000 visitantes/mes** GRATIS
- Suficiente para cualquier página personal
- Si creces, planes desde $25/mes

---

## 🚀 ¿Empezamos?

**¿Quieres que configure esto para que captures TODOS los visitantes reales?**

Solo necesito que:
1. Crees la cuenta en Supabase (2 minutos)
2. Me des las credenciales
3. **¡Listo!** Sistema real funcionando

¿Hacemos esto? **¡Así sí tendrá sentido el sistema de analytics!** 🎯
