# 🎬 Foro de Películas - CineMatch

## ¿Qué es?

El **Foro de Películas** es una nueva pantalla en CineMatch donde los usuarios pueden:

1. **Ver películas populares** con sus calificaciones
2. **Reaccionar** a películas (Like/Dislike) 📌
3. **Escribir reseñas** detalladas sobre películas 📝
4. **Responder a reseñas** (Reddit-style nested replies) 💬
5. **Valorar reseñas** (Like/Dislike a comentarios) 👍

---

## 📸 Features

### Para Usuarios

- ✅ **Infinita Scroll** - Carga más películas al bajar
- ✅ **Modal de Detalles** - Ver todas las reseñas de una película
- ✅ **Reacciones Rápidas** - Like/dislike con un tap
- ✅ **Editor de Reseñas** - Escribir con contador de caracteres
- ✅ **Replies Anidados** - Responder a reseñas como en Reddit
- ✅ **Gestión de Contenido** - Eliminar tus propias reseñas
- ✅ **Animaciones Suaves** - UI/UX responsive y rápida
- ✅ **Dark/Light Theme** - Se adapta al tema de la app

### Estadísticas

- 📊 Ver contador de "likes" y "dislikes" por película
- 📊 Ver número de reseñas
- 📊 Ver qué reacción pusiste tú

---

## 🎯 Flujo de Usuario

```
1. Tap en tab "Foro" 🔽
   ↓
2. Se cargan películas populares 🎬
   ↓
3. Tap en película → abre modal de detalles
   ↓
4. Ver reseñas de otros usuarios 👥
   ↓
5. Opciones:
   ├─ Escribir reseña ✍️
   ├─ Reaccionar a película 👍
   ├─ Reaccionar a reseña 👍
   ├─ Responder a reseña 💬
   └─ Ver más reseñas (scroll) ⬇️
```

---

## 🏗️ Estructura

### Carpetas

```
CineMatchApp/src/
├── services/
│   └── movieForumService.js        ← API calls
├── screens/
│   └── MovieForumScreen.js         ← Pantalla principal
├── components/
│   ├── MovieForumMovieCard.js      ← Card de película
│   └── ReviewCard.js                ← Card de reseña
└── navigation/
    └── MainNavigator.js             ← Tab agregado
```

### Servicios (API)

```javascript
movieForumService.getMovies()              // GET /movies
movieForumService.getMovieDetail()         // GET /movies/:id
movieForumService.getMovieReviews()        // GET /movies/:id/reviews
movieForumService.createReview()           // POST /movies/:id/reviews
movieForumService.deleteReview()           // DELETE /reviews/:id
movieForumService.reactToMovie()           // POST /movies/:id/react
movieForumService.reactToReview()          // POST /reviews/:id/react
movieForumService.getReviewReplies()       // GET /reviews/:id/replies
movieForumService.replyToReview()          // POST /reviews/:id/replies
```

---

## 📱 UI/UX

### MovieForumMovieCard

```
┌────────────────────────────────────┐
│  [POSTER]  │ Title                 │
│            │ 2020                  │
│            │ 💬 12 reseñas        │
│            │                       │
│            │ [👍 45] [👎 3]       │
│            │   [💬 Ver reseñas]   │
└────────────────────────────────────┘
```

### ReviewCard

```
┌──────────────────────────────────┐
│ Juan Pérez  │  20 Apr 2026  │ 🗑️│
├──────────────────────────────────┤
│ Excelente película, muy          │
│ recomendada. Adoro a Brad Pitt!  │
├──────────────────────────────────┤
│ [👍 12] [👎 1] [💬 Responder]   │
│                                  │
│ → María López: Totalmente acuerdo│
│   [👍 3] [👎 0] [💬 Responder]  │
│                                  │
│ → Carlos López: Debería...       │
│   [👍 1] [👎 0] [💬 Responder]  │
└──────────────────────────────────┘
```

---

## 🔌 API Integration

### Endpoints Requeridos

```
GET    /api/movie-forum/movies              ← Listar películas
GET    /api/movie-forum/movies/{id}         ← Detalle película
POST   /api/movie-forum/movies/{id}/react   ← Like/dislike película
GET    /api/movie-forum/movies/{id}/reviews ← Reviews de película
POST   /api/movie-forum/movies/{id}/reviews ← Crear reseña
DELETE /api/movie-forum/reviews/{id}        ← Eliminar reseña
POST   /api/movie-forum/reviews/{id}/react  ← Like/dislike reseña
GET    /api/movie-forum/reviews/{id}/replies← Replies
POST   /api/movie-forum/reviews/{id}/replies← Crear reply
```

### Respuesta Esperada

```json
{
  "movies": [
    {
      "id": 1,
      "title": "Fight Club",
      "poster_path": "/path/poster.jpg",
      "release_date": "1999-10-15",
      "review_count": 12,
      "reactions": {
        "like_count": 45,
        "dislike_count": 3,
        "user_reaction": "like"
      }
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 500 }
}
```

---

## 🚀 Cómo Empezar

### Para Desarrolladores Frontend

1. ✅ Ya está implementado, solo necesita backend

### Para Desarrolladores Backend

1. **Crear migraciones y modelos** (ver `MOVIE_FORUM_BACKEND_EXAMPLES.md`)
2. **Implementar controlador** con los 9 métodos
3. **Registrar rutas** en `routes/api.php`
4. **Probar con Postman/Thunder Client**
5. **Hacer seed de películas populares** (opcional)

### Testing Local

```bash
# Frontend
npm start
# Navegar al tab "Foro"

# Backend
php artisan serve
# Verificar endpoints con Postman
```

---

## 📚 Documentación Completa

- 📖 [Implementation Guide](MOVIE_FORUM_IMPLEMENTATION_GUIDE.md) - Cómo funcionan los endpoints
- 💻 [Backend Examples](MOVIE_FORUM_BACKEND_EXAMPLES.md) - Código Laravel completo
- ✅ [Checklist](MOVIE_FORUM_CHECKLIST.md) - Qué está hecho/falta
- 🏗️ [Architecture](MOVIE_FORUM_ARCHITECTURE.md) - Diagrama y diseño

---

## 🎨 Temas y Estilos

- 🎭 Tema oscuro con dorado (primario)
- ✨ Gradientes suave en fondo
- 🔆 Glows animados
- 📱 Responsive en todas las pantallas

---

## 🐛 Debugging

Si las películas no cargan:

1. Abre React Native Debugger
2. Ve a Network
3. Busca GET `/api/movie-forum/movies`
4. Verifica que la respuesta sea correcta

Si falta el tab:

1. Verifica que `MovieForumScreen` se importe en `MainNavigator`
2. Asegúrate que el `Tab.Screen` está agregado

---

## 🎯 Roadmap Futuro

- [ ] Filtros por género
- [ ] Búsqueda de películas
- [ ] Ordenamiento (trending, recent, etc)
- [ ] Notificaciones de replies
- [ ] Perfil de críticos
- [ ] Badges especiales
- [ ] Sincronización con TMDB

---

## 👥 Equipo

- **Frontend:** ✅ Completo (tu)
- **Backend:** ⏳ En proceso (tu compañero)
- **Diseño UI/UX:** ✅ Implementado
- **Testing:** 🔜 Próximo

---

## 📞 Preguntas Frecuentes

**P: ¿Dónde van las películas?**  
R: Vienen de tu backend en `/api/movie-forum/movies`. Puedes seed con TMDB populares.

**P: ¿Puedo eliminar reseñas de otros?**  
R: No, solo puedes eliminar las tuyas propias.

**P: ¿Cuánta profundidad tienen los replies?**  
R: Unlimited, pero el UI está optimizado para 2-3 niveles.

**P: ¿Se ve bien en tablets?**  
R: Sí, es completamente responsive.

---

## 📝 Notes

- Todas las animaciones usan `useNativeDriver: true` (mejor performance)
- El infinita scroll carga 20 películas por página
- Las imágenes vienen de TMDB CDN (https://image.tmdb.org)
- Todos los componentes son Functional Components con Hooks

---

**Creado:** 20 de Abril de 2026  
**Versión:** 1.0  
**Estado:** ✅ Frontend Completo | ⏳ Backend En Progreso
