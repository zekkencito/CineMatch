# CineMatch - Backend Laravel - Rutas API Requeridas

Este documento describe las rutas API que necesitas implementar en Laravel para que la app móvil funcione correctamente.

## 📋 Rutas a Implementar en Laravel

Crea o modifica el archivo `routes/api.php`:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MovieController;
use App\Http\Controllers\API\MatchController;
use App\Http\Controllers\API\PreferenceController;

// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Películas
    Route::prefix('movies')->group(function () {
        Route::get('/recommendations', [MovieController::class, 'recommendations']);
        Route::post('/rate', [MovieController::class, 'rateMovie']);
        Route::post('/watched', [MovieController::class, 'markAsWatched']);
        Route::get('/watched', [MovieController::class, 'getWatchedMovies']);
        Route::get('/{id}', [MovieController::class, 'show']);
    });
    
    // Matches
    Route::prefix('matches')->group(function () {
        Route::get('/suggestions', [MatchController::class, 'suggestions']);
        Route::get('/', [MatchController::class, 'index']);
        Route::post('/like', [MatchController::class, 'likeUser']);
        Route::post('/pass', [MatchController::class, 'passUser']);
        Route::get('/compatibility/{userId}', [MatchController::class, 'compatibility']);
    });
    
    // Preferencias
    Route::get('/genres', [PreferenceController::class, 'getGenres']);
    Route::get('/directors', [PreferenceController::class, 'getDirectors']);
    Route::post('/user/favorite-genres', [PreferenceController::class, 'saveFavoriteGenres']);
    Route::post('/user/favorite-directors', [PreferenceController::class, 'saveFavoriteDirectors']);
    Route::get('/user/preferences', [PreferenceController::class, 'getUserPreferences']);
});
```

## 🎯 Controladores Necesarios

### 1. AuthController

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
```

### 2. MovieController

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    public function recommendations(Request $request)
    {
        $user = $request->user();
        
        // Obtener películas que el usuario no ha calificado
        $movies = Movie::with(['genres', 'directors'])
            ->whereDoesntHave('ratings', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->inRandomOrder()
            ->limit(20)
            ->get();

        return response()->json($movies);
    }

    public function rateMovie(Request $request)
    {
        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $user = $request->user();
        
        $user->movieRatings()->updateOrCreate(
            ['movie_id' => $request->movie_id],
            ['rating' => $request->rating]
        );

        return response()->json([
            'message' => 'Película calificada exitosamente'
        ]);
    }

    public function markAsWatched(Request $request)
    {
        $request->validate([
            'movie_id' => 'required|exists:movies,id',
        ]);

        $user = $request->user();
        
        $user->watchedMovies()->syncWithoutDetaching([$request->movie_id]);

        return response()->json([
            'message' => 'Película marcada como vista'
        ]);
    }

    public function getWatchedMovies(Request $request)
    {
        $user = $request->user();
        $movies = $user->watchedMovies()->with(['genres', 'directors'])->get();

        return response()->json($movies);
    }

    public function show($id)
    {
        $movie = Movie::with(['genres', 'directors', 'gallery'])->findOrFail($id);
        return response()->json($movie);
    }
}
```

### 3. MatchController

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function suggestions(Request $request)
    {
        $currentUser = $request->user()->load([
            'favoriteGenres',
            'favoriteDirectors',
            'movieRatings'
        ]);

        // Buscar usuarios con géneros similares
        $users = User::where('id', '!=', $currentUser->id)
            ->with(['favoriteGenres', 'favoriteDirectors', 'movieRatings'])
            ->get()
            ->map(function($user) use ($currentUser) {
                $user->compatibility_score = $this->calculateCompatibility($currentUser, $user);
                return $user;
            })
            ->sortByDesc('compatibility_score')
            ->take(20)
            ->values();

        return response()->json($users);
    }

    public function likeUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $currentUser = $request->user();
        $targetUserId = $request->user_id;

        // Guardar el like
        $currentUser->likes()->syncWithoutDetaching([$targetUserId]);

        // Verificar si hay match mutuo
        $isMatch = User::find($targetUserId)->likes->contains($currentUser->id);

        return response()->json([
            'matched' => $isMatch,
            'message' => $isMatch ? '¡Es un match!' : 'Like enviado'
        ]);
    }

    public function passUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Opcional: guardar los "pass" para no mostrarlos de nuevo
        return response()->json([
            'message' => 'Usuario pasado'
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        // Obtener matches mutuos
        $matches = $user->likes()
            ->whereHas('likes', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['favoriteGenres', 'favoriteDirectors'])
            ->get();

        return response()->json($matches);
    }

    public function compatibility(Request $request, $userId)
    {
        $currentUser = $request->user()->load([
            'favoriteGenres',
            'favoriteDirectors'
        ]);
        
        $targetUser = User::with([
            'favoriteGenres',
            'favoriteDirectors'
        ])->findOrFail($userId);

        $score = $this->calculateCompatibility($currentUser, $targetUser);

        return response()->json([
            'compatibility_score' => $score,
            'common_genres' => $currentUser->favoriteGenres
                ->intersect($targetUser->favoriteGenres),
            'common_directors' => $currentUser->favoriteDirectors
                ->intersect($targetUser->favoriteDirectors),
        ]);
    }

    private function calculateCompatibility($user1, $user2)
    {
        $genreScore = 0;
        $directorScore = 0;

        // Calcular similitud en géneros
        $commonGenres = $user1->favoriteGenres->pluck('id')
            ->intersect($user2->favoriteGenres->pluck('id'))->count();
        $totalGenres = max($user1->favoriteGenres->count(), $user2->favoriteGenres->count());
        $genreScore = $totalGenres > 0 ? ($commonGenres / $totalGenres) * 60 : 0;

        // Calcular similitud en directores
        $commonDirectors = $user1->favoriteDirectors->pluck('id')
            ->intersect($user2->favoriteDirectors->pluck('id'))->count();
        $totalDirectors = max($user1->favoriteDirectors->count(), $user2->favoriteDirectors->count());
        $directorScore = $totalDirectors > 0 ? ($commonDirectors / $totalDirectors) * 40 : 0;

        return round($genreScore + $directorScore);
    }
}
```

### 4. PreferenceController

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use App\Models\Director;
use Illuminate\Http\Request;

class PreferenceController extends Controller
{
    public function getGenres()
    {
        $genres = Genre::orderBy('name')->get();
        return response()->json($genres);
    }

    public function getDirectors()
    {
        $directors = Director::orderBy('name')->get();
        return response()->json($directors);
    }

    public function saveFavoriteGenres(Request $request)
    {
        $request->validate([
            'genre_ids' => 'required|array',
            'genre_ids.*' => 'exists:genres,id',
        ]);

        $user = $request->user();
        $user->favoriteGenres()->sync($request->genre_ids);

        return response()->json([
            'message' => 'Géneros favoritos guardados'
        ]);
    }

    public function saveFavoriteDirectors(Request $request)
    {
        $request->validate([
            'director_ids' => 'required|array',
            'director_ids.*' => 'exists:directors,id',
        ]);

        $user = $request->user();
        $user->favoriteDirectors()->sync($request->director_ids);

        return response()->json([
            'message' => 'Directores favoritos guardados'
        ]);
    }

    public function getUserPreferences(Request $request)
    {
        $user = $request->user()->load([
            'favoriteGenres',
            'favoriteDirectors',
            'movieRatings.movie'
        ]);

        return response()->json([
            'favorite_genres' => $user->favoriteGenres,
            'favorite_directors' => $user->favoriteDirectors,
            'favorite_movies' => $user->movieRatings()
                ->where('rating', '>=', 4)
                ->with('movie')
                ->get()
                ->pluck('movie'),
        ]);
    }
}
```

## 🔗 Relaciones en el Modelo User

Agrega estas relaciones al modelo `User`:

```php
// En app/Models/User.php

public function favoriteGenres()
{
    return $this->belongsToMany(Genre::class, 'user_favorite_genres');
}

public function favoriteDirectors()
{
    return $this->belongsToMany(Director::class, 'user_favorite_directors');
}

public function movieRatings()
{
    return $this->hasMany(UserMovieRating::class);
}

public function watchedMovies()
{
    return $this->belongsToMany(Movie::class, 'watched_movies');
}

public function likes()
{
    return $this->belongsToMany(User::class, 'user_likes', 'user_id', 'liked_user_id');
}
```

## ⚙️ Configuración CORS

En `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['*'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

## 🔐 Sanctum

Asegúrate de tener Laravel Sanctum instalado:

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

En `app/Http/Kernel.php`, verifica que tengas:

```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```
