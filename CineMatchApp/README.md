# CineMatch - React Native App

Aplicación móvil de matching basada en preferencias de películas, similar a Tinder pero para cinéfilos.

## 🚀 Tecnologías

- **React Native** con Expo SDK 54
- **React Navigation** (Stack & Bottom Tabs)
- **React Native Gesture Handler** & **Reanimated** (para swipe)
- **Axios** (llamadas API)
- **AsyncStorage** (almacenamiento local)

## 📁 Estructura del Proyecto

```
CineMatchApp/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── UserCard.js      # Tarjeta de usuario para swipe
│   │   ├── MovieCard.js     # Tarjeta de película
│   │   ├── MatchItem.js     # Item de match en lista
│   │   └── GenreSelector.js # Selector de géneros
│   │
│   ├── screens/            # Pantallas de la app
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js         # Swipe de usuarios
│   │   ├── MatchesScreen.js      # Lista de matches
│   │   ├── ChatScreen.js         # Chat con matches
│   │   ├── ProfileScreen.js      # Perfil de usuario
│   │   └── PreferencesScreen.js  # Preferencias de géneros
│   │
│   ├── navigation/         # Navegación
│   │   ├── AppNavigator.js       # Navegador principal
│   │   ├── AuthNavigator.js      # Stack de autenticación
│   │   └── MainNavigator.js      # Tabs principales
│   │
│   ├── services/          # Servicios API
│   │   ├── authService.js        # Login, registro, perfil
│   │   ├── userService.js        # Usuarios y preferencias
│   │   ├── matchService.js       # Likes y matches
│   │   ├── movieService.js       # Películas y géneros
│   │   └── subscriptionService.js # Planes de suscripción
│   │
│   ├── context/           # Context API
│   │   └── AuthContext.js        # Contexto de autenticación
│   │
│   ├── config/            # Configuración
│   │   └── api.js                # Configuración de Axios
│   │
│   ├── utils/             # Utilidades
│   │   └── storage.js            # Helpers para AsyncStorage
│   │
│   └── constants/         # Constantes
│       └── colors.js             # Paleta de colores
│
├── App.js                 # Punto de entrada
├── package.json
└── babel.config.js

```

## 🎨 Características

### Autenticación
- ✅ Login con email y contraseña
- ✅ Registro de nuevos usuarios
- ✅ Almacenamiento seguro de tokens
- ✅ Persistencia de sesión

### Funcionalidades Principales
- ✅ **Swipe de usuarios** - Desplazamiento tipo Tinder con gestos
- ✅ **Sistema de Likes** - Like/Dislike a otros usuarios
- ✅ **Matches** - Notificación cuando hay match mutuo
- ✅ **Chat** - Mensajería con matches
- ✅ **Preferencias** - Selección de géneros favoritos
- ✅ **Perfil** - Visualización y edición de perfil

### Basado en Laravel API
La app consume endpoints REST de Laravel:
- `/api/auth/*` - Autenticación
- `/api/users` - Gestión de usuarios
- `/api/likes` - Sistema de likes
- `/api/matches` - Matches
- `/api/movies` - Películas
- `/api/genres` - Géneros
- `/api/subscription-plans` - Planes de suscripción

## 🔧 Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar URL del API
Editar `src/config/api.js` y cambiar la URL del API:
```javascript
const API_URL = 'http://tu-servidor-laravel.com/api';
```

### 3. Ejecutar la aplicación
```bash
# Iniciar Expo
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📱 Pantallas

### Auth Stack
- **Login** - Inicio de sesión
- **Register** - Registro de usuario

### Main Tabs
- **Home** - Descubrir usuarios (swipe)
- **Matches** - Ver matches y chats
- **Profile** - Perfil y configuración

### Modales/Stack
- **Chat** - Chat individual con match
- **Preferences** - Configurar géneros favoritos

## 🎨 Diseño

- **Tema oscuro** estilo Netflix
- **Colores principales:**
  - Primary: `#E50914` (Rojo CineMatch)
  - Background: `#141414` (Negro oscuro)
  - Card: `#1F1F1F` (Gris oscuro)
  - Text: `#FFFFFF` (Blanco)

## 🔐 Autenticación

La app usa tokens Bearer para autenticación:
1. Usuario hace login/registro
2. Laravel devuelve token JWT
3. Token se guarda en AsyncStorage
4. Se incluye en todas las peticiones API

## 📝 Notas

- **Swipe**: Usa `react-native-gesture-handler` y `reanimated`
- **Navegación**: React Navigation v6
- **Estado global**: Context API para autenticación
- **Almacenamiento**: AsyncStorage para tokens y datos de usuario
- **API**: Axios con interceptores para tokens

## 🚧 Próximas Funcionalidades

- [ ] Sistema de suscripciones (Premium)
- [ ] Chat en tiempo real (WebSockets)
- [ ] Notificaciones push
- [ ] Galería de fotos de usuario
- [ ] Filtros avanzados
- [ ] Películas vistas y ratings

## 📄 Licencia

Este proyecto es parte de CineMatch - Sistema de matching de cinéfilos.
