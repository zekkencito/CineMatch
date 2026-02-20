# 🚂 Comandos para Railway - Orden Correcto

## ✅ Paso 1: Ejecutar Migraciones (si faltan)

Abre la terminal de Railway y ejecuta:

```bash
php artisan migrate
```

Esto ejecutará todas las migraciones que falten, incluyendo:
- ✅ `2026_02_19_041104_add_poster_path_to_watched_movies_table.php`
- ✅ `2026_02_19_050000_add_profile_path_to_user_favorite_directors.php`

## ✅ Paso 2: Ejecutar Seeders

### Opción A: Resetear TODO (recomendado)

⚠️ **ADVERTENCIA:** Esto borrará todos los datos existentes

```bash
php artisan migrate:fresh --seed
```

Esto ejecutará en orden:
1. Borrará todas las tablas
2. Recreará todas las tablas desde cero
3. Ejecutará los seeders:
   - SubscriptionPlanSeeder (4 planes)
   - PaymentTypeSeeder (5 tipos de pago)
   - GenreSeeder (19 géneros)
   - UserSeeder (15 usuarios completos)

### Opción B: Solo Seeders (conserva datos existentes)

Si ya tienes datos que quieres conservar:

```bash
# 1. Tablas básicas
php artisan db:seed --class=SubscriptionPlanSeeder
php artisan db:seed --class=PaymentTypeSeeder
php artisan db:seed --class=GenreSeeder

# 2. Usuarios (15 usuarios completos)
php artisan db:seed --class=UserSeeder
```

## 🎯 Usuarios Creados (15 total)

Todos con **password: 123456**

### Usuario Principal:
- **pamela@gmail.com** - Fan de Nolan y sci-fi (Nuevo Casas Grandes)

### Usuarios de Prueba (8):
1. **maria@test.com** - María García (Janos)
2. **carlos@test.com** - Carlos Méndez (Casas Grandes) 
3. **ana@test.com** - Ana López (Ascensión)
4. **roberto@test.com** - Roberto Silva (Buenaventura)
5. **laura@test.com** - Laura Martínez (Galeana)
6. **diego@test.com** - Diego Ramírez (Madera)
7. **sofia@test.com** - Sofía Torres (Nuevo Casas Grandes)
8. **javier@test.com** - Javier Hernández (Gómez Farías)

### Usuarios Gmail (1):
- **roberto@gmail.com** - Roberto Gomez (Horror fan)

### Usuarios Adicionales (5):
- **valentina@test.com** - Valentina Cruz
- **fernando@test.com** - Fernando Ruiz  
- **isabel@test.com** - Isabel Morales
- **miguel@test.com** - Miguel Ángel
- **patricia@test.com** - Patricia Vega

## 📊 Datos por Usuario

Cada usuario tiene:
- ✅ Información básica (nombre, email, edad, bio)
- ✅ Ubicación (Nuevo Casas Grandes, Chihuahua con 7 km de radio)
- ✅ 3-4 géneros favoritos (IDs de TMDB: 28, 878, 10749, etc.)
- ✅ 1-3 directores favoritos (con TMDB IDs y profile_path)
- ✅ 2-4 películas vistas (con TMDB IDs, ratings y poster_path)
- ✅ Suscripción Basic activa (30 días)

## 🔍 Verificar que Funcionó

```bash
php artisan tinker
```

Luego ejecuta:
```php
User::count()  // Debería mostrar 15
Location::count()  // Debería mostrar 15
Genre::count()  // Debería mostrar 878, 10749, 28, etc. (IDs de TMDB)
DB::table('user_favorite_genres')->count()  // Más de 40
DB::table('user_favorite_directors')->count()  // Más de 20
DB::table('watched_movies')->count()  // Más de 30
Subscription::count()  // Debería mostrar 15
exit
```

## 🐛 Si Hay Errores

### Error: "SQLSTATE[42S22]: Column not found: 'poster_path'"

Falta ejecutar migraciones:
```bash
php artisan migrate
```

### Error: "SQLSTATE[23000]: Integrity constraint violation"

Ya existen usuarios con esos emails. Usa:
```bash
php artisan migrate:fresh --seed
```

### Error: "Class 'App\Models\Subscription' not found"

Verifica que existe el modelo:
```bash
ls app/Models/Subscription.php
```

## 📝 Diferencias con Railway Actual

Según tu screenshot, Railway tiene estas tablas:
- ✅ users, locations, genres, directors, movies
- ✅ subscriptions, subscription_plans, payments, payment_types
- ✅ likes, matches, messages
- ✅ watched_movies, user_favorite_directors, user_favorite_genres

**Migraciones que pueden faltar:**
1. `2026_02_19_041104_add_poster_path_to_watched_movies_table.php`
   - Agrega columna `poster_path` a `watched_movies`

2. `2026_02_19_050000_add_profile_path_to_user_favorite_directors.php`
   - Agrega columna `profile_path` a `user_favorite_directors`

Ejecuta `php artisan migrate` para agregar estas columnas.

## ⚡ Comando Rápido (Un Solo Paso)

Si quieres empezar desde cero:

```bash
php artisan migrate:fresh --seed && echo "✅ Base de datos lista con 15 usuarios"
```

Esto ejecutará todo automáticamente.

## 📱 Probar en la App

1. Abre la app CineMatch
2. Login con: `pamela@gmail.com` / `123456`
3. Verifica que:
   - ✅ Aparece el usuario
   - ✅ Aparecen ubicaciones cercanas (HomeScreen)
   - ✅ Hay géneros y directores favoritos
   - ✅ Hay películas vistas
   - ✅ La suscripción está activa

## 🎉 Resultado Final

Después de ejecutar `php artisan migrate:fresh --seed`:

- **15 usuarios** completos en Nuevo Casas Grandes, Chihuahua
- **4 planes** de suscripción (Basic, Silver, Gold, Platinum)
- **5 tipos** de pago
- **Géneros** usando IDs de TMDB (878, 10749, 28, etc.)
- **Directores** con TMDB IDs y profile_path
- **Películas** con TMDB IDs, ratings y poster_path
- **Suscripciones** Basic activas para todos
