# CineMatch - App Móvil

Aplicación móvil tipo Tinder para encontrar personas con gustos cinematográficos similares.

## 🎬 Características

- **Swipe de Películas**: Descubre nuevas películas con un sistema de swipe (like/dislike)
- **Match con Personas**: Encuentra usuarios con gustos similares en cine
- **Sistema de Compatibilidad**: Algoritmo basado en géneros, directores y películas favoritas
- **Chat en Tiempo Real**: Comunícate con tus matches
- **Preferencias Personalizadas**: Configura tus géneros y directores favoritos

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Para iOS: Xcode y CocoaPods
- Para Android: Android Studio

## 🚀 Instalación

1. **Clonar el repositorio** (si aplica)
```bash
cd CineMatchApp
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la API**

Edita el archivo `src/config/api.js` y configura la URL de tu backend Laravel:

```javascript
// Para emulador Android
const API_BASE_URL = 'http://10.0.2.2:8000/api';

// Para simulador iOS
const API_BASE_URL = 'http://localhost:8000/api';

// Para dispositivo físico (usa tu IP local)
const API_BASE_URL = 'http://192.168.1.X:8000/api';

// Para producción
const API_BASE_URL = 'https://tu-servidor.com/api';
```

4. **Iniciar la aplicación**
```bash
npm start
```

O para plataformas específicas:
```bash
npm run android  # Para Android
npm run ios      # Para iOS
npm run web      # Para web
```

## 📱 Ejecutar en Dispositivo

### Android
1. Instala la app Expo Go desde Play Store
2. Escanea el código QR que aparece en la terminal

### iOS
1. Instala la app Expo Go desde App Store
2. Escanea el código QR que aparece en la terminal

## 🔧 Configuración del Backend Laravel

Asegúrate de que tu backend Laravel tenga las siguientes rutas API configuradas:

### Autenticación
- `POST /api/login`
- `POST /api/register`
- `POST /api/logout`

### Películas
- `GET /api/movies/recommendations` - Obtener películas recomendadas
- `POST /api/movies/rate` - Calificar película
- `POST /api/movies/watched` - Marcar como vista
- `GET /api/movies/{id}` - Detalles de película
- `GET /api/movies/watched` - Películas vistas

### Matches
- `GET /api/matches/suggestions` - Usuarios sugeridos
- `GET /api/matches` - Matches confirmados
- `POST /api/matches/like` - Dar like a usuario
- `POST /api/matches/pass` - Pasar usuario
- `GET /api/matches/compatibility/{userId}` - Ver compatibilidad

### Preferencias
- `GET /api/genres` - Listar géneros
- `GET /api/directors` - Listar directores
- `POST /api/user/favorite-genres` - Guardar géneros favoritos
- `POST /api/user/favorite-directors` - Guardar directores favoritos
- `GET /api/user/preferences` - Obtener preferencias del usuario

## 🎨 Estructura del Proyecto

```
CineMatchApp/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── MovieCard.js   # Card de película
│   │   └── UserCard.js    # Card de usuario
│   ├── config/
│   │   └── api.js         # Configuración de Axios
│   ├── screens/           # Pantallas de la app
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── MatchesScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── PreferencesScreen.js
│   │   └── ChatScreen.js
│   └── services/          # Servicios de API
│       ├── authService.js
│       ├── movieService.js
│       ├── matchService.js
│       └── preferenceService.js
├── App.js                 # Componente principal
└── package.json
```

## 🔐 Autenticación

La app usa tokens Bearer para autenticación. El token se almacena en AsyncStorage y se incluye automáticamente en cada petición HTTP.

## 🎯 Próximas Características

- [ ] Chat en tiempo real con WebSockets
- [ ] Filtros avanzados de búsqueda
- [ ] Recomendaciones con ML
- [ ] Sistema de notificaciones push
- [ ] Perfiles más detallados
- [ ] Lista de películas para ver juntos
- [ ] Integración con servicios de streaming

## 🐛 Solución de Problemas

### Error de conexión con la API
- Verifica que el servidor Laravel esté corriendo
- Asegúrate de usar la IP correcta según tu entorno
- Verifica que CORS esté configurado correctamente en Laravel

### Problemas con dependencias
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Limpiar caché de Expo
```bash
expo start -c
```

## 📄 Licencia

MIT

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir los cambios propuestos.

## 📞 Soporte

Para problemas o preguntas, abre un issue en el repositorio.
