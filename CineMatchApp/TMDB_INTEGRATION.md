# 🎬 Integración con The Movie Database (TMDB)

## 📋 Configuración Inicial

### 1. Obtener API Key de TMDB

1. **Regístrate en TMDB**:
   - Ve a: https://www.themoviedb.org/signup
   - Crea tu cuenta gratuita

2. **Solicita tu API Key**:
   - Ve a: https://www.themoviedb.org/settings/api
   - Click en "Request an API Key"
   - Selecciona "Developer"
   - Llena el formulario (puedes usar datos de prueba)
   - Acepta los términos

3. **Copia tu API Key**:
   - En la página de API verás "API Key (v3 auth)"
   - Copia ese código (es un string largo como: `abc123def456...`)

### 2. Configurar la API Key en el Proyecto

Abre el archivo: `src/config/tmdb.js`

```javascript
// ⬇️ PEGA TU API KEY AQUÍ ⬇️
export const TMDB_API_KEY = 'abc123def456...'; // 👈 Pega tu key aquí
```

## 📁 Estructura de Archivos

```
CineMatchApp/src/
├── config/
│   ├── api.js              # Configuración Laravel (ya existe)
│   └── tmdb.js             # ⭐ NUEVA - Config TMDB (AQUÍ VA TU KEY)
│
├── services/
│   ├── authService.js      # Autenticación Laravel
│   ├── userService.js      # Usuarios
│   ├── matchService.js     # Matches
│   ├── movieService.js     # ⭐ Servicio de películas (usa TMDB)
│   └── preferenceService.js # Preferencias de usuario
│
├── screens/
│   ├── PreferencesScreen.js # ⭐ Configurar Géneros/Directores/Películas
│   ├── ProfileScreen.js     # ⭐ Configurar Radio de ubicación
│   └── ...
│
└── components/
    ├── GenreSelector.js     # Selector de géneros
    ├── DirectorSelector.js  # Selector de directores
    ├── MovieSelector.js     # Selector de películas vistas
    └── ...
```

## 🎯 Funcionalidades a Implementar

### 1. Preferencias de Usuario (PreferencesScreen)

**Debe permitir:**
- ✅ Seleccionar géneros favoritos (múltiple selección)
- ✅ Seleccionar directores favoritos (búsqueda + selección)
- ✅ Marcar películas vistas (búsqueda + selección)
- ✅ Guardar preferencias en Laravel

**Endpoints Laravel ya creados:**
```javascript
POST   /api/preferences/genres              // Agregar género favorito
DELETE /api/preferences/genres/{id}         // Eliminar género favorito
GET    /api/preferences/genres              // Ver géneros favoritos
POST   /api/preferences/movies/watched      // Marcar película vista
```

### 2. Configuración de Ubicación (ProfileScreen/SettingsScreen)

**Debe permitir:**
- ✅ Ver ubicación actual (ciudad)
- ✅ Ajustar radio de búsqueda (5km - 500km)
- ✅ Actualizar ubicación

**Endpoint Laravel ya creado:**
```javascript
PUT /api/location  // Actualizar ubicación y radio
```

## 📡 Endpoints de TMDB a Usar

### Géneros
```
GET /genre/movie/list?api_key=xxx&language=es-MX
```

### Buscar Películas
```
GET /search/movie?api_key=xxx&language=es-MX&query=inception
```

### Películas Populares
```
GET /movie/popular?api_key=xxx&language=es-MX&page=1
```

### Directores (búsqueda de personas)
```
GET /search/person?api_key=xxx&language=es-MX&query=nolan
```

### Detalles de Película
```
GET /movie/{movie_id}?api_key=xxx&language=es-MX&append_to_response=credits
```

## 🔄 Flujo Completo

### 1. Usuario configura preferencias:
```
Usuario → PreferencesScreen 
       → Selecciona Géneros (TMDB) 
       → Selecciona Directores (TMDB)
       → Marca Películas Vistas (TMDB)
       → Guarda en Laravel API
```

### 2. Usuario configura ubicación:
```
Usuario → ProfileScreen/Settings
       → Ajusta radio de búsqueda (50km, 100km, etc.)
       → Guarda en Laravel API
```

### 3. Sistema filtra usuarios:
```
Laravel → Filtra usuarios por:
        ├── Géneros en común
        ├── Directores en común
        ├── Películas vistas en común
        └── Radio de ubicación
```

## 🛠️ Archivos Clave para Modificar

### 1. `src/config/tmdb.js`
**QUÉ PONER:**
- ✅ Tu API Key de TMDB
- ✅ Ya tiene funciones helper para URLs de imágenes

### 2. `src/services/movieService.js`
**QUÉ IMPLEMENTAR:**
```javascript
// Obtener géneros desde TMDB
async getGenresFromTMDB()

// Buscar películas desde TMDB
async searchMovies(query)

// Obtener películas populares desde TMDB
async getPopularMovies(page = 1)

// Buscar directores desde TMDB
async searchDirectors(query)

// Obtener detalles de película con créditos
async getMovieDetails(movieId)
```

### 3. `src/screens/PreferencesScreen.js`
**QUÉ AGREGAR:**
- ✅ Vista de tabs: [Géneros] [Directores] [Películas Vistas]
- ✅ Lista de géneros con selección múltiple
- ✅ Búsqueda de directores con TMDB
- ✅ Búsqueda de películas con TMDB
- ✅ Botón "Guardar" que sincroniza con Laravel

### 4. `src/screens/ProfileScreen.js` o nueva `SettingsScreen.js`
**QUÉ AGREGAR:**
- ✅ Slider para ajustar radio de búsqueda
- ✅ Mostrar ubicación actual
- ✅ Botón "Actualizar ubicación"
- ✅ Sincronizar con Laravel API

## 🎨 Componentes Necesarios

### GenreSelector.js
```javascript
// Muestra lista de géneros con checkboxes
// Permite seleccionar múltiples
// Ya existe, solo necesita conectarse a TMDB
```

### DirectorSelector.js (CREAR)
```javascript
// Input de búsqueda
// Lista de resultados desde TMDB
// Selección múltiple de directores favoritos
```

### MovieSelector.js (CREAR)
```javascript
// Input de búsqueda
// Lista de películas desde TMDB con pósters
// Marcar como "vista" con rating opcional
```

### LocationSettings.js (CREAR)
```javascript
// Slider para radio (5km - 500km)
// Mostrar ubicación actual
// Botón para actualizar
```

## 🚀 Pasos Siguientes

1. ✅ **Obtén tu API Key de TMDB**
2. ✅ **Pega tu key en `src/config/tmdb.js`**
3. 🔧 **Implementa funciones en `movieService.js`** (búsqueda, géneros, directores)
4. 🎨 **Actualiza `PreferencesScreen.js`** (tabs, selección múltiple)
5. ⚙️ **Crea/actualiza `SettingsScreen.js`** (radio de ubicación)
6. 🧪 **Prueba el flujo completo**: Configurar preferencias → Ver usuarios filtrados

## 📚 Documentación Útil

- TMDB API Docs: https://developers.themoviedb.org/3
- Ejemplos de endpoints: https://developers.themoviedb.org/3/getting-started/introduction
- Imágenes: https://developers.themoviedb.org/3/getting-started/images
