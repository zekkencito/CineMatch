# 🎬 CineMatch - Guía Completa del Proyecto

Aplicación tipo Tinder para encontrar personas con gustos cinematográficos similares.

## 📁 Estructura del Proyecto

```
CineMatch/
├── laravel/                 # Backend API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── API/     # Controladores de API
│   │   └── Models/          # Modelos Eloquent
│   ├── database/
│   │   ├── migrations/      # Migraciones de BD
│   │   └── seeders/         # Seeders
│   └── routes/
│       └── api.php          # Rutas de API
│
└── CineMatchApp/            # App móvil React Native
    ├── src/
    │   ├── components/      # Componentes reutilizables
    │   ├── screens/         # Pantallas de la app
    │   ├── services/        # Servicios de API
    │   └── config/          # Configuración
    └── App.js               # Componente principal
```

## 🚀 Inicio Rápido

### Backend (Laravel)

1. **Navegar al directorio Laravel:**
   ```bash
   cd laravel
   ```

2. **Instalar dependencias:**
   ```bash
   composer install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configurar la base de datos en `.env`:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=cinematch
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. **Instalar Sanctum:**
   ```bash
   composer require laravel/sanctum
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

6. **Ejecutar migraciones:**
   ```bash
   php artisan migrate
   ```

7. **Ejecutar seeders:**
   ```bash
   php artisan db:seed
   ```

8. **Iniciar servidor:**
   ```bash
   php artisan serve
   ```

### Frontend (React Native)

1. **Navegar al directorio de la app:**
   ```bash
   cd CineMatchApp
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar la URL de la API en `src/config/api.js`:**
   ```javascript
   // Para emulador Android
   const API_BASE_URL = 'http://10.0.2.2:8000/api';
   
   // Para simulador iOS
   const API_BASE_URL = 'http://localhost:8000/api';
   
   // Para dispositivo físico (usa tu IP local)
   const API_BASE_URL = 'http://192.168.1.X:8000/api';
   ```

4. **Iniciar la aplicación:**
   ```bash
   npm start
   ```

5. **Ejecutar en plataforma específica:**
   ```bash
   npm run android  # Para Android
   npm run ios      # Para iOS (solo en Mac)
   ```

## 📱 Funcionalidades Principales

### 1. Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Tokens JWT con Laravel Sanctum

### 2. Descubrimiento de Películas
- Sistema de swipe (like/dislike)
- Recomendaciones personalizadas
- Información detallada de películas
- Géneros y directores

### 3. Match con Usuarios
- Algoritmo de compatibilidad basado en gustos
- Swipe de usuarios
- Matches mutuos
- Porcentaje de compatibilidad

### 4. Preferencias
- Selección de géneros favoritos
- Selección de directores favoritos
- Configuración personalizada

### 5. Chat
- Chat con matches
- Interfaz intuitiva
- (WebSockets para tiempo real - pendiente)

## 🔧 Tareas Pendientes para Implementar

### Backend Laravel

- [ ] Crear controladores API (ver LARAVEL_API_GUIDE.md)
- [ ] Implementar modelos con relaciones (ver LARAVEL_MODELS_GUIDE.md)
- [ ] Crear migración para user_likes
- [ ] Agregar campos a users (profile_photo_url, bio)
- [ ] Agregar campos a movies (poster_url, description)
- [ ] Configurar CORS correctamente
- [ ] Crear seeders para géneros y directores
- [ ] Implementar algoritmo de recomendación
- [ ] Agregar validaciones en requests
- [ ] Implementar logging

### Frontend React Native

- [ ] Probar en dispositivos reales
- [ ] Implementar caché de imágenes
- [ ] Agregar pantalla de detalles de película
- [ ] Implementar WebSockets para chat en tiempo real
- [ ] Agregar notificaciones push
- [ ] Implementar filtros de búsqueda
- [ ] Agregar splash screen personalizada
- [ ] Crear iconos de la app
- [ ] Implementar manejo de errores global
- [ ] Agregar tests

## 📊 Estructura de la Base de Datos

### Tablas Principales

1. **users** - Usuarios de la aplicación
2. **movies** - Catálogo de películas
3. **genres** - Géneros cinematográficos
4. **directors** - Directores
5. **user_movie_ratings** - Calificaciones de usuarios a películas
6. **watched_movies** - Películas vistas por usuarios
7. **user_favorite_genres** - Géneros favoritos de usuarios
8. **user_favorite_directors** - Directores favoritos de usuarios
9. **user_likes** - Likes entre usuarios (para matches)
10. **genre_movie** - Relación películas-géneros
11. **director_movie** - Relación películas-directores

## 🎨 Paleta de Colores

- **Primary Red**: `#E50914` (Netflix-style red)
- **Background**: `#000000` (Black)
- **Cards**: `#1a1a1a` (Dark gray)
- **Success Green**: `#4DED30`
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#999999`

## 📚 Recursos Adicionales

- [Documentación Laravel](https://laravel.com/docs)
- [Documentación React Native](https://reactnative.dev/docs/getting-started)
- [Documentación Expo](https://docs.expo.dev/)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

## 🐛 Solución de Problemas Comunes

### Error de CORS
Verifica la configuración en `config/cors.php` de Laravel.

### Error 401 Unauthorized
Asegúrate de que Sanctum esté configurado correctamente y que el token se esté enviando en los headers.

### App no conecta con API
- Verifica que Laravel esté corriendo
- Verifica la URL de la API en `src/config/api.js`
- Usa la IP correcta según tu entorno (emulador/dispositivo físico)

### Error al instalar dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas de Desarrollo

1. Usa siempre rutas relativas en la app móvil
2. Maneja errores de red apropiadamente
3. Implementa loading states
4. Valida datos en frontend y backend
5. Usa TypeScript para mayor seguridad (opcional)
6. Documenta cambios importantes
7. Haz commits frecuentes con mensajes descriptivos

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🎯 Roadmap

### Fase 1 (Actual)
- ✅ Estructura básica de la app
- ✅ Sistema de navegación
- ✅ Pantallas principales
- ✅ Integración con API
- ⏳ Implementación del backend

### Fase 2
- [ ] Chat en tiempo real
- [ ] Notificaciones push
- [ ] Algoritmo de ML para recomendaciones
- [ ] Perfil detallado de usuarios

### Fase 3
- [ ] Grupos de discusión de películas
- [ ] Eventos para ver películas juntos
- [ ] Integración con servicios de streaming
- [ ] Ranking y badges

## 📞 Contacto

Para preguntas o soporte, abre un issue en el repositorio.

---

**¡Disfruta desarrollando CineMatch! 🎬🍿**
