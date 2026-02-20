# 🚂 Guía de Migraciones y Seeders para Railway

## ✅ Estado Actual

Tu base de datos en Railway tiene las siguientes tablas:
- ✅ Users, locations, genres, directors, movies, movie_directors
- ✅ Subscriptions, subscription_plans, payments, payment_types
- ✅ Likes, matches, messages
- ✅ Watched_movies, user_favorite_genres, user_favorite_directors
- ✅ Cache, sessions, jobs, migrations, failed_jobs

## 📦 Seeders Consolidados

Ahora solo tienes **4 seeders esenciales**:

1. **SubscriptionPlanSeeder** - Planes de suscripción (Basic, Silver, Gold, Platinum)
2. **PaymentTypeSeeder** - Tipos de pago (Credit Card, PayPal, etc.)
3. **GenreSeeder** - 19 géneros de películas (Action, Drama, Sci-Fi, etc.)
4. **UserSeeder** - 10 usuarios completos con:
   - Información básica (nombre, email, password, edad, bio)
   - Ubicación (CDMX con coordenadas)
   - Géneros favoritos
   - Directores favoritos (con TMDB IDs)
   - Suscripción Basic activa

## 🗑️ Seeders Eliminados/Innecesarios

Los siguientes seeders YA NO son necesarios:
- ❌ DemoUsersSeeder (consolidado en UserSeeder)
- ❌ TestUsersSeeder (consolidado en UserSeeder)
- ❌ NearbyUsersSeeder (consolidado en UserSeeder)
- ❌ LocationSeeder (ahora se crea con cada usuario)
- ❌ UserFavoriteGenreSeeder (ahora se crea con cada usuario)
- ❌ UserFavoriteDirectorSeeder (ahora se crea con cada usuario)
- ❌ DirectorSeeder (usa TMDB, se crea dinámicamente)
- ❌ MovieSeeder (usa TMDB, no necesita seed)
- ❌ LikeSeeder (se genera con uso real)
- ❌ MatchSeeder (se genera con uso real)

## 🚀 Pasos para Aplicar en Railway

### Opción 1: Ejecutar Seeders desde Railway Dashboard

1. **Ve a tu proyecto en Railway**
2. **Abre el servicio de Laravel**
3. **Ve a la pestaña "Settings" o "Variables"**
4. **Encuentra la sección de comandos o terminal**
5. **Ejecuta:**
   ```bash
   php artisan migrate:fresh --seed
   ```
   ⚠️ **ADVERTENCIA:** Esto borrará todos los datos existentes

### Opción 2: Ejecutar Solo Seeders (Sin borrar datos)

Si ya tienes datos que quieres conservar:

```bash
# 1. Llena las tablas esenciales
php artisan db:seed --class=SubscriptionPlanSeeder
php artisan db:seed --class=PaymentTypeSeeder
php artisan db:seed --class=GenreSeeder

# 2. Crea usuarios de prueba
php artisan db:seed --class=UserSeeder
```

### Opción 3: Resetear Todo Limpiamente

```bash
# Borra todo y vuelve a crear
php artisan migrate:fresh --seed
```

## 🔍 Verificar Migraciones Ejecutadas

Para ver qué migraciones ya se ejecutaron en Railway:

```bash
php artisan migrate:status
```

## 📋 Lista de Migraciones (en orden)

```
0001_01_01_000000_create_users_table.php
0001_01_01_000001_create_cache_table.php
0001_01_01_000002_create_jobs_table.php
2026_02_11_033123_locations.php
2026_02_11_033152_genres.php
2026_02_11_033310_watched_movies.php
2026_02_11_033323_user_favorite_genres.php
2026_02_11_033337_user_favorite_directors.php
2026_02_11_033345_likes.php
2026_02_11_033350_matches.php
2026_02_11_033405_subscription_plans.php
2026_02_11_033416_payments_types.php
2026_02_11_033422_payments.php
2026_02_12_000001_modify_favorites_to_use_tmdb_ids.php
2026_02_13_000001_create_directors_table.php
2026_02_13_000002_create_movies_table.php
2026_02_13_000003_create_movie_directors_table.php
2026_02_13_022033_add_search_radius_to_locations_table.php
2026_02_17_000001_create_messages_table.php
2026_02_17_000002_create_subscriptions_table.php
2026_02_19_041104_add_poster_path_to_watched_movies_table.php
2026_02_19_050000_add_profile_path_to_user_favorite_directors.php
```

## 🎯 Usuarios de Prueba Creados

Después de ejecutar los seeders, tendrás 10 usuarios:

| Email | Password | Descripción |
|-------|----------|-------------|
| pamela@gmail.com | 123456 | Usuario principal - Fan de Sci-Fi y Nolan |
| roberto@gmail.com | 123456 | Horror fan |
| ana@gmail.com | 123456 | Romantic movies lover |
| luis@gmail.com | 123456 | Action movies (Marvel/DC) |
| renzo@gmail.com | 123456 | Drama enthusiast |
| carlos@demo.com | 123456 | Alta compatibilidad con Pamela |
| maria@demo.com | 123456 | Sci-Fi fan |
| diego@demo.com | 123456 | Nolan fan |
| sofia@demo.com | 123456 | Comedy/Family |
| miguel@demo.com | 123456 | Documentary/History |

Todos tienen:
- ✅ Ubicación en CDMX
- ✅ 2-3 géneros favoritos
- ✅ 1 director favorito (con TMDB ID)
- ✅ Suscripción Basic activa (30 días)

## 🧹 Limpiar Base de Datos Local

Si quieres sincronizar tu base local con Railway:

```bash
cd laravel
php artisan migrate:fresh --seed
```

## ⚠️ Importante

- Los **directores** y **películas** ahora se obtienen dinámicamente de **TMDB**
- Las tablas `directors`, `movies`, `movie_directors` existen pero **se llenan automáticamente** cuando los usuarios agregan favoritos
- Los **géneros** se obtienen de la tabla `genres` que se llena con el **GenreSeeder**
- Todas las relaciones de `user_favorite_directors` usan **TMDB IDs** en lugar de IDs locales

## 📝 Próximos Pasos

1. ✅ Ejecuta `php artisan migrate:fresh --seed` en Railway
2. ✅ Verifica que hay 10 usuarios en la tabla `users`
3. ✅ Verifica que hay 19 géneros en la tabla `genres`
4. ✅ Verifica que hay 4 planes en la tabla `subscription_plans`
5. ✅ Prueba login con `pamela@gmail.com` / `123456` desde tu app

## 🐛 Solución de Problemas

### Error: "Class UserSeeder does not exist"
```bash
composer dump-autoload
php artisan db:seed --class=UserSeeder
```

### Error: "SQLSTATE[23000]: Integrity constraint violation"
Ya existen datos. Usa:
```bash
php artisan migrate:fresh --seed
```

### Error: "Nothing to migrate"
Las migraciones ya están aplicadas. Solo ejecuta:
```bash
php artisan db:seed
```
