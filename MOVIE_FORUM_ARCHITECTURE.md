# Arquitectura del Foro de Películas

## Diagrama de Flujo - User Interactions

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER STARTS APP                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
           ┌─────────────────────────────────┐
           │   MainNavigator (Tab Bar)       │
           │  ┌─────────────────────────────┐│
           │  │ Palomeros │ Butaca │ Foro │ Perfil
           │  └─────────────────────────────┘│
           └────────────┬────────────────────┘
                        │ Tap "Foro"
                        ▼
         ┌──────────────────────────────────┐
         │  MovieForumScreen                │
         │  - Cargar películas              │
         │  - Infinite scroll               │
         │  - Mostrar MovieForumMovieCard   │
         └────────────┬─────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
   Tap en película          Scroll para cargar
          │                       │
          ▼                       ▼
    ┌──────────────┐      ┌──────────────┐
    │ Modal de     │      │ API GET      │
    │ Detalles     │      │ /movies?pg=2 │
    │ (Reseñas)    │      └──────────────┘
    └──────┬───────┘
           │
    ┌──────┴────────┬──────────────┐
    │               │              │
    ▼               ▼              ▼
 Like/    Escribir Reviews      Responder
Dislike  Reseña   (Scroll)        a Reseña
    │       │         │              │
    │       └────┬────┘              │
    │            │                   │
    ▼            ▼                   ▼
┌─────────────────────────────────────────┐
│        API CALLS (movieForumService)   │
├─────────────────────────────────────────┤
│ POST /movies/{id}/react                 │
│ POST /movies/{id}/reviews               │
│ POST /reviews/{id}/react                │
│ POST /reviews/{id}/replies              │
│ GET  /movies/{id}/reviews               │
│ GET  /reviews/{id}/replies              │
└────────────────┬────────────────────────┘
                 │
                 ▼
          ┌──────────────┐
          │  Laravel API │
          │  Backend     │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │   Database   │
          │   Tables:    │
          │  - movies    │
          │  - reactions │
          │  - reviews   │
          │  - replies   │
          └──────────────┘
```

---

## Estructura de Componentes

```
MovieForumScreen (CONTAINER)
├── Header (Animated)
├── FlatList
│   └── MovieForumMovieCard (PRESENTATIONAL) ×N
│       ├── Poster Image
│       ├── Title + Year
│       ├── Review Count
│       └── Reactions Row
│           ├── Like Button
│           ├── Dislike Button
│           └── View Reviews Button
│
└── Modals
    ├── Modal - Movie Detail
    │   ├── Close Button
    │   ├── Movie Header
    │   │   ├── Poster
    │   │   ├── Title
    │   │   └── Stats
    │   ├── Add Review Button
    │   └── ScrollView - Reviews
    │       └── ReviewCard (PRESENTATIONAL) ×N
    │           ├── User Info
    │           ├── Review Text
    │           ├── Reactions Row
    │           ├── Reply Button
    │           └── Replies (nested)
    │               └── ReviewCard (isReply=true)
    │
    └── Modal - Write Review
        ├── Close Button
        ├── Title (Write / Reply to)
        ├── TextInput
        ├── Character Counter
        └── Submit Button
```

---

## Data Flow (State Management)

```
MovieForumScreen
│
├─ movies: MovieForumMovie[]
│  └─ Loaded from: GET /movies
│     Updated on: Infinite scroll
│
├─ selectedMovie: MovieForumMovie | null
│  └─ Set on: User taps movie card
│
├─ movieReviews: MovieForumReview[]
│  └─ Loaded from: GET /movies/{id}/reviews
│     Updated on: User adds review
│                 User adds reply
│                 Infinite scroll
│
├─ modalVisible: boolean
│  └─ Toggle on: Tap movie, close, animations
│
├─ reviewModalVisible: boolean
│  └─ Toggle on: Tap "Write Review", submit, close
│
└─ replyingTo: MovieForumReview | null
   └─ Set on: User taps "Reply" button
      Clear on: Submit or close modal
```

---

## API Contract

### Request/Response Examples

#### GET /api/movie-forum/movies

**Query:**
```
page=1&per_page=20
```

**Response (200):**
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
        "user_reaction": "like"
      }
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 500
  }
}
```

#### GET /api/movie-forum/movies/1/reviews

**Response (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "review": "Excelente película de acción",
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
            "user_reaction": "like"
          }
        }
      ]
    }
  ]
}
```

#### POST /api/movie-forum/movies/1/reviews

**Request:**
```json
{
  "review": "Excelente película, muy recomendada para todos"
}
```

**Response (201):**
```json
{
  "id": 2,
  "review": "Excelente película, muy recomendada para todos",
  "user_id": 5,
  "movie_forum_movie_id": 1,
  "created_at": "2026-04-20T12:00:00Z"
}
```

#### POST /api/movie-forum/movies/1/react

**Request:**
```json
{
  "reaction_type": "like"
}
```

**Response (200/202):**
```json
{
  "message": "Reacción guardada",
  "reaction": "like"
}
```

Or if toggling off:
```json
{
  "message": "Reacción removida"
}
```

---

## Database Schema

```sql
-- Películas en el foro
CREATE TABLE movie_forum_movies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tmdb_movie_id BIGINT UNIQUE,
  title VARCHAR(255),
  poster_path VARCHAR(255),
  backdrop_path VARCHAR(255),
  release_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Reacciones a películas (like/dislike)
CREATE TABLE movie_forum_reactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movie_forum_movie_id BIGINT,
  user_id BIGINT,
  reaction_type ENUM('like', 'dislike'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE KEY (movie_forum_movie_id, user_id),
  FOREIGN KEY (movie_forum_movie_id) REFERENCES movie_forum_movies(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reseñas de películas
CREATE TABLE movie_forum_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movie_forum_movie_id BIGINT,
  user_id BIGINT,
  review TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (movie_forum_movie_id) REFERENCES movie_forum_movies(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reacciones a reseñas (like/dislike)
CREATE TABLE movie_forum_review_reactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movie_forum_review_id BIGINT,
  user_id BIGINT,
  reaction_type ENUM('like', 'dislike'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE KEY (movie_forum_review_id, user_id),
  FOREIGN KEY (movie_forum_review_id) REFERENCES movie_forum_reviews(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Respuestas a reseñas (anidadas)
CREATE TABLE movie_forum_review_replies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  movie_forum_review_id BIGINT,
  user_id BIGINT,
  parent_reply_id BIGINT,
  reply TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (movie_forum_review_id) REFERENCES movie_forum_reviews(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_reply_id) REFERENCES movie_forum_review_replies(id)
);
```

---

## Performance Considerations

### Frontend
- ✅ **FlatList** con `onEndReachedThreshold={0.5}` para infinite scroll
- ✅ **useMemo** para optimizar renderizado de estilos
- ✅ **Lazy loading** de imágenes (TMDB CDN)
- ✅ **Paginación** para no cargar todo de una vez

### Backend
- ✅ **Pagination** con `per_page=20`
- ✅ **Query optimization** con `with(['user', 'reactions', 'replies'])`
- ✅ **Eager loading** para evitar N+1 queries
- ✅ **Indexes** en Foreign Keys

### Database
- ✅ **Índices** en movie_forum_movie_id, user_id, reaction_type
- ✅ **UNIQUE constraints** para evitar duplicados
- ✅ **Soft deletes** (opcional) para no perder datos

---

## Error Handling

```
┌─ Network Error
│  └─ Mostrar Alert "Revisa tu conexión"
│
├─ Auth Error (401)
│  └─ Redirigir a Login
│
├─ Validation Error (422)
│  └─ Mostrar mensajes específicos
│
├─ Server Error (500)
│  └─ Mostrar "Error del servidor"
│
└─ Loading States
   ├─ ActivityIndicator en FlatList
   ├─ Disabled buttons mientras cargan
   └─ "Cargando..." messages
```

---

## Security Considerations

### Frontend
- ✅ Validación de entrada (review: 10-1000 caracteres)
- ✅ Sanitizar texto antes de mostrar
- ✅ Usar HTTPS en producción

### Backend
- ✅ Validar `user_id` en servidor (no confiar en cliente)
- ✅ Validar permisos (solo autor puede eliminar)
- ✅ Rate limiting en endpoints
- ✅ CSRF protection en Laravel
- ✅ Input sanitization
- ✅ SQL injection prevention (Eloquent)

---

## Testing Strategy

### Unit Tests
```
✓ movieForumService.js
  - getMovies() returns array
  - createReview() sends correct body
  - reactToMovie() toggles reaction

✓ ReviewCard component
  - Renders review text
  - Shows user name
  - Displays reactions count
```

### Integration Tests
```
✓ MovieForumScreen → API
  - Carga películas al montar
  - Infinita scroll funciona
  - Modal abre/cierra

✓ Crear reseña flujo completo
  - Tap "Write Review"
  - Escribir texto
  - Submit
  - Reseña aparece en lista
```

### E2E Tests
```
✓ User journey completo
  - Login
  - Navegar a Foro
  - Ver películas
  - Escribir reseña
  - Reaccionar
  - Responder
  - Eliminar reseña
```

---

## Deployment Checklist

```
Frontend:
□ Build release APK/IPA
□ Probar en real devices
□ API URLs en producción
□ Crash reporting (Sentry)
□ Analytics enabled

Backend:
□ Database migrada
□ Seed de películas populares
□ Configurar CORS
□ Rate limiting activo
□ Backups configurados
□ Logs monitoreados
□ SSL certificado
```

---

## Timeline

```
Week 1:
- Backend: Crear migraciones, modelos, controlador
- Frontend: Integración, testing básico

Week 2:
- Backend: Validaciones, tests, deployment
- Frontend: Refinamientos, testing exhaustivo

Week 3:
- QA: Testing en múltiples devices
- Release: Deploy a producción
```

---

**Creado:** 20 Abril 2026  
**Versión:** 1.0  
**Estado:** Draft (A ser refinado con equipo)
