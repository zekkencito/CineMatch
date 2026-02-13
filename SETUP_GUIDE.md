# CineMatch - Instrucciones de Configuración

## 📋 Resumen del Sistema de Matching

El sistema de matching funciona así:
1. **Usuario A da like a Usuario B** → Se guarda en tabla `likes`
2. **Sistema verifica si Usuario B ya había dado like a Usuario A** → Consulta tabla `likes`
3. **Si ambos se dieron like mutuo** → Se crea un `match` en tabla `matches`
4. **Los usuarios pueden ver sus matches** → Pantalla de Matches

## 🚀 Configuración de Laravel (Backend)

### 1. Instalar Dependencias

```bash
cd laravel
composer install
```

### 2. Configurar .env

Crea o edita el archivo `.env` en la carpeta `laravel`:

```env
APP_NAME=CineMatch
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cinematch
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
```

### 3. Generar App Key

```bash
php artisan key:generate
```

### 4. Crear Base de Datos

Crea la base de datos en MySQL:

```sql
CREATE DATABASE cinematch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Ejecutar Migraciones

```bash
php artisan migrate
```

Esto creará todas las tablas necesarias:
- `users` (con campos de ubicación: latitude, longitude, search_radius)
- `likes` (para likes/dislikes)
- `matches` (para matches confirmados)
- `movies`, `genres`, `directors`
- Tablas pivot: `user_favorite_genres`, `user_favorite_directors`, `watched_movies`, etc.

### 6. Poblar Base de Datos (Opcional)

Puedes crear seeders para agregar datos de prueba:

```bash
php artisan make:seeder GenreSeeder
php artisan make:seeder MovieSeeder
```

#### Ejemplo de GenreSeeder:

```php
<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run()
    {
        $genres = [
            'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
            'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
            'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'Western'
        ];

        foreach ($genres as $genre) {
            Genre::create(['name' => $genre]);
        }
    }
}
```

Luego ejecutar:

```bash
php artisan db:seed --class=GenreSeeder
```

### 7. Iniciar Servidor

```bash
php artisan serve
```

El servidor estará disponible en: `http://localhost:8000`

## 📱 Configuración de React Native (Frontend)

### 1. Actualizar URL de API

Edita el archivo `CineMatchApp/src/config/api.js`:

**Para Android:**
```javascript
const API_URL = 'http://10.0.2.2:8000/api'; // Emulador Android
// O
const API_URL = 'http://TU_IP_LOCAL:8000/api'; // Dispositivo físico (ejemplo: http://192.168.1.100:8000/api)
```

**Para iOS:**
```javascript
const API_URL = 'http://localhost:8000/api'; // Simulador iOS
// O
const API_URL = 'http://TU_IP_LOCAL:8000/api'; // Dispositivo físico
```

### 2. Encontrar tu IP Local (para dispositivo físico)

**Windows:**
```bash
ipconfig
# Busca "Dirección IPv4" en tu conexión activa
```

**Linux/Mac:**
```bash
ifconfig
# O
ip addr show
```

### 3. Configurar Permisos de Ubicación

#### Android (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### iOS (`ios/CineMatchApp/Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>CineMatch needs your location to find matches nearby</string>
```

## 🗺️ Integración con Google Maps (Opcional)

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita "Maps SDK for Android" y "Maps SDK for iOS"
4. Crea credenciales (API Key)

### 2. Instalar Librería

```bash
cd CineMatchApp
npx expo install react-native-maps
```

### 3. Configurar API Key

Crea `CineMatchApp/.env`:

```env
GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

### 4. Crear Pantalla de Ubicación

Crea `CineMatchApp/src/screens/LocationScreen.js` para seleccionar ubicación y radio.

## 🧪 Probar el Sistema de Matching

### 1. Crear Usuarios de Prueba

**Opción A: Desde la app**
- Usa la pantalla de Register para crear 2-3 usuarios

**Opción B: Desde Laravel Tinker**
```bash
php artisan tinker
```

```php
$user1 = User::create([
    'name' => 'Usuario 1',
    'email' => 'user1@test.com',
    'password' => Hash::make('password'),
    'age' => 25,
    'bio' => 'Me encanta el cine',
    'latitude' => 19.4326,
    'longitude' => -99.1332,
    'search_radius' => 50
]);

$user2 = User::create([
    'name' => 'Usuario 2',
    'email' => 'user2@test.com',
    'password' => Hash::make('password'),
    'age' => 27,
    'bio' => 'Fan de películas de acción',
    'latitude' => 19.4330,
    'longitude' => -99.1340,
    'search_radius' => 50
]);
```

### 2. Probar el Flujo de Matching

1. **Login con Usuario 1**
   - Email: `user1@test.com`
   - Password: `password`

2. **En HomeScreen**, dale **like** (corazón ♥) a Usuario 2

3. **Logout** y **Login con Usuario 2**
   - Email: `user2@test.com`
   - Password: `password`

4. **En HomeScreen**, dale **like** (corazón ♥) a Usuario 1

5. **¡MATCH! 🎉** Verás una alerta confirmando el match

6. **Ve a la pestaña "Matches"** - Allí verás a Usuario 1 en tu lista de matches

7. **Puedes chatear** tocando el match

### 3. Verificar en Base de Datos

```sql
-- Ver todos los likes
SELECT * FROM likes;

-- Ver todos los matches
SELECT * FROM matches;

-- Ver matches con información de usuarios
SELECT m.*, 
  u1.name as user1_name, u1.email as user1_email,
  u2.name as user2_name, u2.email as user2_email
FROM matches m
JOIN users u1 ON m.user_one_id = u1.id
JOIN users u2 ON m.user_two_id = u2.id;
```

## 📡 Endpoints API Disponibles

### Auth
- `POST /api/register` - Registro
- `POST /api/login` - Login
- `POST /api/logout` - Logout (auth)
- `GET /api/me` - Obtener usuario autenticado (auth)
- `PUT /api/profile` - Actualizar perfil (auth)

### Usuarios
- `GET /api/users` - Obtener usuarios para swipe (auth, filtrados por ubicación)
- `GET /api/users/{id}` - Obtener usuario específico (auth)
- `PUT /api/location` - Actualizar ubicación y radio de búsqueda (auth)

### Matching
- `POST /api/matches/like` - Enviar like/dislike (auth)
  ```json
  {
    "to_user_id": 2,
    "type": "like" // o "dislike"
  }
  ```
- `GET /api/matches` - Obtener todos los matches (auth)
- `GET /api/matches/check/{userId}` - Verificar si hay match con usuario (auth)
- `GET /api/likes` - Obtener likes recibidos (auth)

### Preferencias
- `GET /api/preferences/genres` - Obtener géneros favoritos (auth)
- `POST /api/preferences/genres` - Agregar género favorito (auth)
- `DELETE /api/preferences/genres/{id}` - Remover género favorito (auth)
- `POST /api/preferences/movies/watched` - Agregar película vista (auth)

### Películas y Géneros
- `GET /api/movies` - Obtener películas (public)
- `GET /api/movies/{id}` - Obtener película específica (public)
- `GET /api/movies/search?query=...` - Buscar películas (public)
- `GET /api/genres` - Obtener todos los géneros (public)
- `GET /api/directors` - Obtener directores (public)

## 🔧 Solución de Problemas

### Error: "Network Error" en la app

1. Verifica que Laravel esté corriendo: `php artisan serve`
2. Verifica la URL en `api.js`
3. Para Android, usa `10.0.2.2` en lugar de `localhost`
4. Para dispositivo físico, usa tu IP local y asegúrate de estar en la misma red WiFi

### Error: "CORS" al hacer peticiones

Edita `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### Error: "Unauthenticated" después de login

Verifica que el token se esté guardando y enviando correctamente en los headers de axios.

## 📝 Próximos Pasos

1. ✅ Implementar sistema de chat en tiempo real (Laravel WebSockets o Pusher)
2. ✅ Agregar subida de fotos de perfil
3. ✅ Implementar sistema de recomendaciones basado en películas
4. ✅ Agregar notificaciones push cuando hay un match
5. ✅ Implementar sistema de suscripciones premium
6. ✅ Agregar filtros avanzados (edad, distancia, géneros favoritos)

## 🎬 ¡Listo para usar!

Ya tienes todo configurado para usar CineMatch. El sistema de matching está listo y funcionando. ¡Disfruta conectando personas a través del cine! 🍿
