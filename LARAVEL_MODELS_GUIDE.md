# Modelos Laravel Necesarios para CineMatch

## 📦 Modelos a Crear/Modificar

### 1. Movie Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    protected $fillable = [
        'title',
        'release_year',
        'poster_url',
        'description',
    ];

    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'genre_movie');
    }

    public function directors()
    {
        return $this->belongsToMany(Director::class, 'director_movie');
    }

    public function gallery()
    {
        return $this->hasMany(Gallery::class);
    }

    public function ratings()
    {
        return $this->hasMany(UserMovieRating::class);
    }

    public function watchedByUsers()
    {
        return $this->belongsToMany(User::class, 'watched_movies');
    }
}
```

### 2. Genre Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    protected $fillable = ['name'];

    public function movies()
    {
        return $this->belongsToMany(Movie::class, 'genre_movie');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_favorite_genres');
    }
}
```

### 3. Director Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Director extends Model
{
    protected $fillable = ['name', 'bio', 'photo_url'];

    public function movies()
    {
        return $this->belongsToMany(Movie::class, 'director_movie');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_favorite_directors');
    }
}
```

### 4. UserMovieRating Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserMovieRating extends Model
{
    public $timestamps = false;
    public $incrementing = false;
    protected $primaryKey = ['user_id', 'movie_id'];

    protected $fillable = [
        'user_id',
        'movie_id',
        'rating',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
}
```

### 5. Gallery Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    protected $fillable = [
        'movie_id',
        'image_url',
        'caption',
    ];

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
}
```

### 6. User Model (Agregar Relaciones)

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_photo_url',
        'bio',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Relación con géneros favoritos
    public function favoriteGenres()
    {
        return $this->belongsToMany(Genre::class, 'user_favorite_genres');
    }

    // Relación con directores favoritos
    public function favoriteDirectors()
    {
        return $this->belongsToMany(Director::class, 'user_favorite_directors');
    }

    // Relación con calificaciones de películas
    public function movieRatings()
    {
        return $this->hasMany(UserMovieRating::class);
    }

    // Relación con películas vistas
    public function watchedMovies()
    {
        return $this->belongsToMany(Movie::class, 'watched_movies')
                    ->withTimestamps();
    }

    // Relación con usuarios que le gustaron (likes dados)
    public function likes()
    {
        return $this->belongsToMany(
            User::class,
            'user_likes',
            'user_id',
            'liked_user_id'
        )->withTimestamps();
    }

    // Relación con usuarios que le dieron like (likes recibidos)
    public function likedBy()
    {
        return $this->belongsToMany(
            User::class,
            'user_likes',
            'liked_user_id',
            'user_id'
        )->withTimestamps();
    }

    // Obtener matches mutuos
    public function matches()
    {
        return $this->likes()->whereHas('likes', function($query) {
            $query->where('user_id', $this->id);
        });
    }
}
```

## 🗄️ Migraciones Adicionales Necesarias

### Migración para user_likes

Crea esta migración: `php artisan make:migration create_user_likes_table`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_likes', function (Blueprint $table) {
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->foreignId('liked_user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->timestamps();
            
            $table->primary(['user_id', 'liked_user_id']);
            
            // Evitar que un usuario se dé like a sí mismo
            $table->check('user_id != liked_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_likes');
    }
};
```

### Actualizar migración de movies (si es necesario)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('movies', function (Blueprint $table) {
            $table->string('poster_url')->nullable()->after('release_year');
            $table->text('description')->nullable()->after('poster_url');
        });
    }

    public function down(): void
    {
        Schema::table('movies', function (Blueprint $table) {
            $table->dropColumn(['poster_url', 'description']);
        });
    }
};
```

### Actualizar migración de users (si es necesario)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_photo_url')->nullable()->after('email');
            $table->text('bio')->nullable()->after('profile_photo_url');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['profile_photo_url', 'bio']);
        });
    }
};
```

## 📝 Comandos Artisan Útiles

```bash
# Crear los controladores
php artisan make:controller API/AuthController
php artisan make:controller API/MovieController
php artisan make:controller API/MatchController
php artisan make:controller API/PreferenceController

# Crear los modelos (si no existen)
php artisan make:model Movie
php artisan make:model Genre
php artisan make:model Director
php artisan make:model UserMovieRating
php artisan make:model Gallery

# Ejecutar migraciones
php artisan migrate

# Crear seeders
php artisan make:seeder GenreSeeder
php artisan make:seeder DirectorSeeder
php artisan make:seeder MovieSeeder

# Ejecutar seeders
php artisan db:seed --class=GenreSeeder
php artisan db:seed --class=DirectorSeeder
php artisan db:seed --class=MovieSeeder
```

## 🌱 Ejemplo de Seeder para Géneros

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Genre;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            'Acción',
            'Aventura',
            'Animación',
            'Ciencia Ficción',
            'Comedia',
            'Drama',
            'Fantasía',
            'Horror',
            'Musical',
            'Misterio',
            'Romance',
            'Suspenso',
            'Western',
            'Documental',
            'Crimen',
            'Biografía',
            'Guerra',
            'Histórico',
        ];

        foreach ($genres as $genre) {
            Genre::create(['name' => $genre]);
        }
    }
}
```

## 🔧 Configuración de Sanctum

1. Instalar Sanctum:
```bash
composer require laravel/sanctum
```

2. Publicar configuración:
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

3. Ejecutar migraciones:
```bash
php artisan migrate
```

4. En `app/Http/Kernel.php`, asegúrate de tener:
```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

## 🚀 Iniciar el Servidor

```bash
php artisan serve
```

Tu API estará disponible en: `http://localhost:8000/api`
