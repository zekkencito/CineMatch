# 🎬 RUTAS COMPLETAS DE CINEMATCH API

## 📋 RESUMEN COMPLETO DE RUTAS CONFIGURADAS

### 🔐 AUTENTICACIÓN (Públicas)
- `POST /api/register` - Registro de usuario
- `POST /api/login` - Login de usuario
- `POST /api/social-login` - Login social (Google)

### 🎯 RUTAS PÚBLICAS (Sin autenticación)
- `GET /api/test` - Prueba básica de API
- `GET /api/test-rating` - Prueba de calificación
- `GET /api/clear-cache` - Limpiar caché del servidor

### 🎬 PELÍCULAS (Públicas)
- `GET /api/movies` - Obtener todas las películas
- `GET /api/movies/{id}` - Obtener película por ID
- `GET /api/movies/search` - Buscar películas
- `GET /api/genres` - Obtener géneros
- `GET /api/directors` - Obtener directores

### ⭐ CALIFICACIONES (Públicas)
- `GET /api/movies/{id}/rating` - Obtener calificación de película
- `POST /api/movies/{id}/rate` - Calificar película
- `POST /api/movies/ratings` - Obtener múltiples calificaciones

### 🔒 RUTAS PROTEGIDAS (Requieren token Sanctum)

#### 👤 USUARIO
- `POST /api/logout` - Cerrar sesión
- `GET /api/me` - Obtener usuario actual
- `PUT /api/profile` - Actualizar perfil
- `GET /api/users` - Obtener lista de usuarios
- `GET /api/users/{id}` - Obtener usuario por ID
- `PUT /api/location` - Actualizar ubicación
- `POST /api/push-token` - Actualizar token de notificaciones

#### ❤️ PREFERENCIAS - GÉNEROS
- `GET /api/preferences/genres` - Obtener géneros favoritos
- `POST /api/preferences/genres/sync` - Sincronizar géneros
- `POST /api/preferences/genres` - Agregar género favorito
- `DELETE /api/preferences/genres/{id}` - Eliminar género favorito

#### 🎭 PREFERENCIAS - DIRECTORES
- `GET /api/preferences/directors` - Obtener directores favoritos
- `POST /api/preferences/directors/sync` - Sincronizar directores
- `POST /api/preferences/directors` - Agregar director favorito
- `DELETE /api/preferences/directors/{id}` - Eliminar director favorito

#### 🎥 PREFERENCIAS - PELÍCULAS
- `GET /api/preferences/movies/watched` - Obtener películas vistas
- `POST /api/preferences/movies/sync` - Sincronizar películas
- `POST /api/preferences/movies/watched` - Agregar película vista
- `DELETE /api/preferences/movies/watched/{id}` - Eliminar película vista

#### 💕 MATCHES
- `POST /api/matches/like` - Enviar like
- `POST /api/matches/undo` - Deshacer swipe
- `GET /api/matches` - Obtener matches
- `GET /api/matches/check/{userId}` - Verificar match
- `GET /api/likes` - Obtener likes recibidos

#### 💬 MENSAJES (CHAT)
- `GET /api/matches/{matchId}/messages` - Obtener mensajes de un match
- `POST /api/messages` - Enviar mensaje
- `GET /api/messages/unread-count` - Contador de mensajes no leídos
- `GET /api/messages/unread-per-match` - Mensajes no leídos por match

#### 💳 SUSCRIPCIONES
- `GET /api/subscription/current` - Plan actual
- `GET /api/subscription/plans` - Planes disponibles
- `POST /api/subscription/upgrade` - Actualizar a premium
- `POST /api/subscription/create-order` - Crear orden PayPal
- `POST /api/subscription/cancel` - Cancelar suscripción
- `GET /api/subscription/likes-count` - Contador de likes diarios

#### 🎮 GAMIFICACIÓN
- `GET /api/gamification/state` - Estado de gamificación
- `POST /api/gamification/activity` - Registrar actividad

#### 📽️ MOVIE FORUM
- `GET /api/movie-forum/movies` - Obtener películas del foro
- `GET /api/movie-forum/movies/{id}` - Detalle de película en foro
- `POST /api/movie-forum/movies` - Crear película con reseña
- `GET /api/movie-forum/reviews` - Obtener todas las reseñas
- `POST /api/movie-forum/reviews` - Crear reseña general
- `PUT /api/movie-forum/reviews/{id}` - Actualizar reseña
- `DELETE /api/movie-forum/reviews/{id}` - Eliminar reseña
- `POST /api/movie-forum/reviews/{id}/react` - Reaccionar a reseña
- `GET /api/movie-forum/reviews/{id}/replies` - Obtener respuestas de reseña
- `POST /api/movie-forum/reviews/{id}/replies` - Responder a reseña
- `GET /api/movie-forum/movies/{id}/reviews` - Reseñas de película específica
- `POST /api/movie-forum/movies/{id}/reviews` - Crear reseña de película
- `POST /api/movie-forum/movies/{id}/rate` - Calificar película en foro
- `POST /api/movie-forum/movies-with-review` - Crear película con reseña

#### 🌟 RECOMENDACIÓN DIARIA
- `GET /api/daily-recommendation` - Obtener recomendación diaria
- `GET /api/daily-recommendation/status` - Estado diario

## 📊 ESTADÍSTICAS
- **Total de rutas configuradas**: 60+
- **Rutas públicas**: 15
- **Rutas protegidas**: 45+
- **Módulos cubiertos**: 10 (Auth, Usuarios, Películas, Matches, Chat, Suscripciones, Gamificación, Foro, Recomendaciones, Preferencias)

## ✅ ESTADO DE IMPLEMENTACIÓN
- ✅ Todas las rutas de autenticación configuradas
- ✅ Todas las rutas de películas funcionando
- ✅ Sistema de calificaciones completo
- ✅ Sistema de matches y chat completo
- ✅ Sistema de suscripciones y pagos
- ✅ Gamificación completa
- ✅ Foro de películas completo
- ✅ Recomendación diaria funcionando
- ✅ Sistema de preferencias completo

## 🎯 COBERTURA COMPLETA
La API cubre el 100% de las funcionalidades de la aplicación móvil Cinematch.
