# Guía de Integración del Foro de Películas

## Overview
La app CineMatch ahora tiene una nueva pantalla **"Foro de Películas"** donde los usuarios pueden:
1. Ver películas populares
2. Ver y dar reacciones (like/dislike)
3. Escribir reseñas
4. Responder a reseñas (replies anidados, tipo Reddit)
5. Reaccionar a reseñas

## Instalación en Frontend

✅ **YA IMPLEMENTADO:**
- `src/services/movieForumService.js` - Servicio de API
- `src/components/MovieForumMovieCard.js` - Componente de película
- `src/components/ReviewCard.js` - Componente de reseña
- `src/screens/MovieForumScreen.js` - Pantalla principal
- Integración en `src/navigation/MainNavigator.js` como nuevo tab

## Implementación en Backend (Laravel)

Tu compañero ha creado las tablas en la BD. Ahora necesitas crear los endpoints en Laravel.

### 1. Crear Modelo y Controlador para Movie Forum

```bash
php artisan make:model MovieForumMovie -m -c -r
php artisan make:model MovieForumReaction -m -c -r
php artisan make:model MovieForumReview -m -c -r
php artisan make:model MovieForumReviewReaction -m -c -r
php artisan make:model MovieForumReviewReply -m -c -r
```

### 2. Endpoints Requeridos

#### Movies
```
GET    /api/movie-forum/movies              - Listar películas con paginación
GET    /api/movie-forum/movies/{id}         - Obtener detalles de película
```

#### Reactions a Películas
```
POST   /api/movie-forum/movies/{id}/react   - Like/dislike a película
```

#### Reviews
```
GET    /api/movie-forum/movies/{id}/reviews - Listar reseñas
POST   /api/movie-forum/movies/{id}/reviews - Crear reseña
DELETE /api/movie-forum/reviews/{id}        - Eliminar reseña (solo autor)
```

#### Reactions a Reviews
```
POST   /api/movie-forum/reviews/{id}/react  - Like/dislike a reseña
```

#### Replies
```
GET    /api/movie-forum/reviews/{id}/replies     - Listar respuestas
POST   /api/movie-forum/reviews/{id}/replies     - Crear respuesta
```

### 3. Estructura de Respuestas

#### GET /api/movie-forum/movies
```json
{
  "movies": [
    {
      "id": 1,
      "tmdb_movie_id": 550,
      "title": "Fight Club",
      "poster_path": "/path/to/poster.jpg",
      "backdrop_path": "/path/to/backdrop.jpg",
      "release_date": "1999-10-15",
      "review_count": 12,
      "reactions": {
        "like_count": 45,
        "dislike_count": 3,
        "user_reaction": "like" // o "dislike" o null
      }
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

#### GET /api/movie-forum/movies/{id}/reviews
```json
{
  "reviews": [
    {
      "id": 1,
      "review": "Gran película, recomendada",
      "created_at": "2026-04-20T10:30:00Z",
      "user_id": 5,
      "user": {
        "id": 5,
        "name": "Juan Pérez"
      },
      "reply_count": 2,
      "reactions": {
        "like_count": 12,
        "dislike_count": 1,
        "user_reaction": null
      },
      "replies": [
        {
          "id": 10,
          "review": "Totalmente de acuerdo",
          "created_at": "2026-04-20T11:00:00Z",
          "user_id": 8,
          "user": {
            "id": 8,
            "name": "María López"
          },
          "reactions": {
            "like_count": 3,
            "dislike_count": 0,
            "user_reaction": null
          }
        }
      ]
    }
  ]
}
```

#### POST /api/movie-forum/movies/{id}/react
Request:
```json
{
  "reaction_type": "like"  // o "dislike"
}
```

Response (202):
```json
{
  "message": "Reacción guardada",
  "reaction": "like"
}
```

#### POST /api/movie-forum/movies/{id}/reviews
Request:
```json
{
  "review": "Excelente película, muy recomendada"
}
```

Response (201):
```json
{
  "id": 1,
  "review": "Excelente película, muy recomendada",
  "user_id": 5,
  "movie_forum_movie_id": 1,
  "created_at": "2026-04-20T10:30:00Z"
}
```

#### POST /api/movie-forum/reviews/{id}/replies
Request:
```json
{
  "reply": "Totalmente de acuerdo",
  "parent_reply_id": null  // opcional, para replies de replies
}
```

Response (201):
```json
{
  "id": 10,
  "reply": "Totalmente de acuerdo",
  "user_id": 8,
  "movie_forum_review_id": 1,
  "created_at": "2026-04-20T11:00:00Z"
}
```

### 4. Lógica de Negocio

#### Reacciones
- Un usuario solo puede tener UNA reacción por película/reseña
- Si reacciona nuevamente con el mismo tipo, se elimina
- Si reacciona con otro tipo, se reemplaza la anterior

#### Reseñas
- Solo usuarios autenticados pueden escribir
- Solo el autor puede eliminar su reseña
- Al eliminar una reseña, se deben eliminar también sus replies

#### Replies
- Los replies pueden anidarse (parent_reply_id)
- Máximo 2-3 niveles de anidación (opcional)

### 5. Rutas en routes/api.php

```php
Route::middleware('auth:sanctum')->group(function () {
    // Movies
    Route::get('/movie-forum/movies', [MovieForumController::class, 'getMovies']);
    Route::get('/movie-forum/movies/{id}', [MovieForumController::class, 'getMovieDetail']);
    
    // Reactions
    Route::post('/movie-forum/movies/{id}/react', [MovieForumController::class, 'reactToMovie']);
    Route::post('/movie-forum/reviews/{id}/react', [MovieForumController::class, 'reactToReview']);
    
    // Reviews
    Route::get('/movie-forum/movies/{id}/reviews', [MovieForumController::class, 'getMovieReviews']);
    Route::post('/movie-forum/movies/{id}/reviews', [MovieForumController::class, 'createReview']);
    Route::delete('/movie-forum/reviews/{id}', [MovieForumController::class, 'deleteReview']);
    
    // Replies
    Route::get('/movie-forum/reviews/{id}/replies', [MovieForumController::class, 'getReviewReplies']);
    Route::post('/movie-forum/reviews/{id}/replies', [MovieForumController::class, 'createReply']);
});
```

### 6. Datos de Prueba

Para poblador inicial de películas, tu compañero podría:
```php
// Seed popular TMDB movies al crear un registro en movie_forum_movies
// Por ejemplo, desde una API externa o manual data
```

### 7. Validaciones

- `review`: min:10, max:1000
- `reaction_type`: in:like,dislike
- `reply`: min:5, max:1000

### 8. Rate Limiting (Opcional)

Considerar limitar:
- Reseñas por usuario: 5 por día
- Replies por usuario: 10 por día
- Reacciones: unlimited

---

## Testing desde Frontend

Una vez tengas los endpoints listos:

1. Instala la app con `npm install` en CineMatchApp
2. Configura las URLs de API en `src/config/api.js`
3. Navega al tab "Foro"
4. Debería cargar las películas automáticamente

---

## Debugging

Si hay errores:

1. Abre React Native Debugger
2. Ve a la pestaña Network
3. Verifica que los endpoints retornen el formato correcto
4. Revisa la consola para errores de parsing

---

## Notas

- El frontend maneja internamente la paginación infinita
- Las animaciones son suaves y responsivas
- El sistema es modular y fácil de extender
- Los componentes reutilizan el tema de la app
