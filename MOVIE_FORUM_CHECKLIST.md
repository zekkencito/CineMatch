# Checklist de Implementación - Foro de Películas

## ✅ Frontend (YA COMPLETADO)

### Servicios
- ✅ `src/services/movieForumService.js` creado
  - 10 métodos para interact con la API
  - Manejo de errores
  - Paginación integrada

### Componentes
- ✅ `src/components/MovieForumMovieCard.js`
  - Card con poster y detalles
  - Reacciones (like/dislike)
  - Contador de reseñas

- ✅ `src/components/ReviewCard.js`
  - Card de reseña con usuario/fecha
  - Reacciones a reseñas
  - Replies anidados (estilo Reddit)
  - Botón de eliminar (solo autor)

### Pantallas
- ✅ `src/screens/MovieForumScreen.js`
  - Lista de películas (infinita scroll)
  - Modal de detalles de película
  - Modal para escribir reseña
  - Sistema completo de estados
  - Animaciones suaves

### Navegación
- ✅ `src/navigation/MainNavigator.js` actualizado
  - Nuevo tab "Foro de Películas"
  - Icono "movie"
  - Label "Foro"

### Temas y Estilos
- ✅ Gradientes y animaciones consistentes con la app
- ✅ Colores del tema aplicados
- ✅ Iconos FontAwesome integrados
- ✅ Responsive en iOS y Android

---

## 📋 Backend (A HACER POR TU COMPAÑERO)

### Base de Datos
- [ ] Tablas creadas por tu compañero:
  - [ ] `movie_forum_movies`
  - [ ] `movie_forum_reactions`
  - [ ] `movie_forum_reviews`
  - [ ] `movie_forum_review_reactions`
  - [ ] `movie_forum_review_replies`

### Modelos Laravel
- [ ] `MovieForumMovie.php` - modelo con relaciones
- [ ] `MovieForumReview.php` - reseñas con relaciones
- [ ] `MovieForumReviewReply.php` - replies anidados
- [ ] `MovieForumReaction.php` - reacciones a películas
- [ ] `MovieForumReviewReaction.php` - reacciones a reseñas

### 🌱 Seeder (IMPORTANTE - AGREGA PELÍCULAS)
- [ ] `MovieForumSeeder.php` - Agregará 12 películas populares
- [ ] Registrado en `DatabaseSeeder.php`
- [ ] Ejecutar: `php artisan db:seed`

### Controlador
- [ ] `MovieForumController.php` con métodos:
  - [ ] `getMovies()` - listado con paginación
  - [ ] `getMovieDetail()` - detalles
  - [ ] `getMovieReviews()` - reseñas de película
  - [ ] `createReview()` - crear reseña
  - [ ] `createMovieWithReview()` - 🆕 crear película + reseña
  - [ ] `deleteReview()` - eliminar reseña (validar autor)
  - [ ] `reactToMovie()` - like/dislike película
  - [ ] `reactToReview()` - like/dislike reseña
  - [ ] `getReviewReplies()` - listado de replies
  - [ ] `createReply()` - crear reply

### Rutas API
- [ ] En `routes/api.php`, agregar grupo autenticado:
  ```
  GET    /api/movie-forum/movies
  GET    /api/movie-forum/movies/{id}
  POST   /api/movie-forum/movies/{id}/react
  GET    /api/movie-forum/movies/{id}/reviews
  POST   /api/movie-forum/movies/{id}/reviews
  POST   /api/movie-forum/movies-with-review           ⭐ 🆕
  DELETE /api/movie-forum/reviews/{id}
  POST   /api/movie-forum/reviews/{id}/react
  GET    /api/movie-forum/reviews/{id}/replies
  POST   /api/movie-forum/reviews/{id}/replies
  ```

### Validaciones
- [ ] Review: min:10, max:1000
- [ ] Reply: min:5, max:1000
- [ ] Reaction type: in:like,dislike
- [ ] tmdb_movie_id: unique

### Data Inicial
- [ ] ✅ Seeder con 12 películas populares (YA IMPLEMENTADO)
- [ ] Ejecutar seed para agregar películas

### Testing
- [ ] Probar cada endpoint con Postman/Thunder Client
- [ ] Validar autenticación
- [ ] Verificar formato de respuestas
- [ ] GET `/movies` retorna 12 películas
- [ ] POST `/movies-with-review` crea película + reseña

---

## 🔧 Configuración Frontend

### 1. Verificar API Config
En `src/config/api.js`, asegurar que apunta a tu backend:
```javascript
const API_URL = 'http://tu-backend.com/api'; // o localhost:8000/api
```

### 2. Instalar Dependencias (si no están)
```bash
cd CineMatchApp
npm install
# Si falta react-native-deck-swiper u otros:
npm install react-native-deck-swiper
```

### 3. Ejecutar la App
```bash
npm start
# En Android:
npm run android
# En iOS:
npm run ios
```

### 4. Verificar Navegación
- [ ] Tab "Foro" aparece en la barra inferior
- [ ] Icono es correcto ("movie")
- [ ] Navegación funciona al tocar el tab

---

## 🧪 Testing en Desarrollo

### Pruebas Manuales
1. [ ] Abrir pantalla "Foro de Películas"
2. [ ] Verificar que carga lista de películas
3. [ ] Tocar en una película → abre modal
4. [ ] Escribir reseña → publica correctamente
5. [ ] Reaccionar a película → like/dislike funciona
6. [ ] Reaccionar a reseña → funciona
7. [ ] Responder a reseña → aparece reply
8. [ ] Eliminar reseña propia → se elimina
9. [ ] Scroll infinito → carga más películas
10. [ ] Animations → suaves y responsive

### Network Inspector
Revisar que las respuestas tengan este formato:
```json
{
  "movies": [...],
  "meta": { "page": 1, "per_page": 20, "total": 150 }
}
```

---

## 📱 Devices Testing

- [ ] iOS (iPhone 12+)
- [ ] Android (API 30+)
- [ ] Tablets
- [ ] En modo oscuro y claro

---

## 🐛 Debugging

Si algo no funciona:

1. **Películas no cargan:**
   - Verificar que la API está respondiendo
   - Check React Native Debugger → Network tab
   - Ver console de logs

2. **Error de autenticación:**
   - Verificar token en AsyncStorage
   - Check header `Authorization: Bearer {token}`

3. **Reseñas no se guardan:**
   - Validar que user_id sea correcto
   - Check validaciones en backend

4. **Animaciones lentas:**
   - Reducir número de películas mostradas
   - Optimizar renderizado con useMemo

---

## 📦 Archivos Creados/Modificados

### Creados (Frontend)
- ✅ `src/services/movieForumService.js`
- ✅ `src/components/MovieForumMovieCard.js`
- ✅ `src/components/ReviewCard.js`
- ✅ `src/screens/MovieForumScreen.js`

### Modificados (Frontend)
- ✅ `src/navigation/MainNavigator.js` (añadido import + tab)

### Documentación
- ✅ `MOVIE_FORUM_IMPLEMENTATION_GUIDE.md`
- ✅ `MOVIE_FORUM_BACKEND_EXAMPLES.md`
- ✅ Este archivo: `MOVIE_FORUM_CHECKLIST.md`

---

## 🚀 Deployment

Una vez todo funcione localmente:

1. [ ] Compilar APK
   ```bash
   eas build --platform android
   ```

2. [ ] Compilar IPA
   ```bash
   eas build --platform ios
   ```

3. [ ] Probar en production
   - [ ] Asegurar URLs de API
   - [ ] Verificar autenticación
   - [ ] Test con múltiples usuarios

---

## 📞 Soporte

Si hay problemas, verifica:

1. **Base de datos:**
   - Tablas existen
   - Campos correctos
   - Foreign keys OK

2. **Código Backend:**
   - Controlador completo
   - Rutas registradas
   - Middleware auth aplicado

3. **Frontend:**
   - Imports correctos
   - Servicio actualizado
   - Temas aplicados

4. **Network:**
   - API accesible desde app
   - CORS configurado (si es necesario)
   - Tokens válidos

---

## ✨ Características Futuras (Opcional)

- [ ] Filtrar películas por género
- [ ] Buscar películas
- [ ] Ordenar por fecha/relevancia
- [ ] Notificaciones de replies
- [ ] Ver perfil de quien reseña
- [ ] Etiquetas (#hashtags)
- [ ] Imágenes en reseñas
- [ ] Reportar contenido inapropiado
- [ ] Moderación de reseñas
- [ ] Badges de "crítico verificado"

---

**Estado:** En desarrollo  
**Última actualización:** 20 de Abril de 2026  
**Responsable Frontend:** ✅ Completo  
**Responsable Backend:** ⏳ En proceso
