<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\PreferencesController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\GamificationController;
use App\Http\Controllers\MovieForumController;
use App\Http\Controllers\DailyRecommendationController;
use App\Http\Controllers\MovieRatingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas de limpieza de caché (accesible por URL)
Route::get('/clear-cache', function() {
    try {
        Artisan::call('route:clear');
        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('view:clear');
        
        return response()->json([
            'message' => 'Caché limpiada correctamente',
            'timestamp' => now(),
            'routes_loaded' => count(app('router')->getRoutes())
        ]);
    } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'timestamp' => now()
        ], 500);
    }
});

// Rutas de prueba
Route::get('/test', function() {
    return response()->json([
        'message' => 'API funcionando correctamente',
        'timestamp' => now(),
        'server_info' => [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'routes_count' => count(app('router')->getRoutes())
        ]
    ]);
});

Route::get('/test-rating', function() {
    return response()->json([
        'message' => 'Ruta de calificación funcionando',
        'timestamp' => now(),
        'rating_test' => [
            'movie_id' => 123456,
            'rating' => 8.5,
            'total_ratings' => 42
        ]
    ]);
});

// Rutas de películas y géneros (públicas)
Route::get('/movies', [MovieController::class, 'getMovies']);
Route::get('/movies/{id}', [MovieController::class, 'getMovie'])->where('id', '[0-9]+');
Route::get('/movies/search', [MovieController::class, 'searchMovies']);
Route::get('/genres', [MovieController::class, 'getGenres']);
Route::get('/directors', [MovieController::class, 'getDirectors']);

// Calificaciones de Películas (públicas)
Route::get('/movies/{id}/rating', [MovieRatingController::class, 'getMovieRating'])->where('id', '[0-9]+');
Route::post('/movies/{id}/rate', [MovieRatingController::class, 'rateMovie'])->where('id', '[0-9]+');
Route::post('/movies/ratings', [MovieRatingController::class, 'getMoviesRatings']);

// Rutas de autenticación (públicas)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/social-login', [AuthController::class, 'socialLogin']);

// Rutas de limpieza de caché (accesible por URL) - FUERA del middleware auth
Route::get('/clear-cache', function() {
    try {
        Artisan::call('route:clear');
        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('view:clear');
        
        return response()->json([
            'message' => 'Caché limpiada correctamente',
            'timestamp' => now(),
            'routes_loaded' => count(app('router')->getRoutes())
        ]);
    } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'timestamp' => now()
        ], 500);
    }
});

// Ruta de diagnóstico para el modelo Movie
Route::get('/diagnose-movie/{movieId?}', function($movieId = 42640) {
    try {
        // Probar si el modelo Movie existe
        $movieCount = \App\Models\Movie::count();
        $result = [
            'model_works' => true,
            'total_movies' => $movieCount
        ];
        
        // Probar si hay películas con tmdb_movie_id
        $tmdbMovies = \App\Models\Movie::whereNotNull('tmdb_movie_id')->count();
        $result['tmdb_movies_count'] = $tmdbMovies;
        
        // Probar búsqueda específica
        $movie = \App\Models\Movie::where('tmdb_movie_id', $movieId)->first();
        $result['tmdb_search'] = [
            'search_id' => $movieId,
            'found' => $movie ? true : false,
            'title' => $movie ? $movie->title : null,
            'local_id' => $movie ? $movie->id : null
        ];
        
        // Probar búsqueda por ID normal
        $movieById = \App\Models\Movie::find($movieId);
        $result['id_search'] = [
            'search_id' => $movieId,
            'found' => $movieById ? true : false,
            'title' => $movieById ? $movieById->title : null
        ];
        
        return response()->json($result);
        
    } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Ruta de prueba simple para calificación (FUERA del middleware auth)
Route::post('/test-rating/{movieId}', function(Request $request, $movieId) {
    try {
        return response()->json([
            'message' => 'Ruta de prueba funciona',
            'movieId' => $movieId,
            'rating' => $request->get('rating'),
            'timestamp' => now()
        ]);
    } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

// Ruta de diagnóstico para reseñas
Route::get('/debug-reviews/{movieId}', function($movieId) {
    try {
        // Buscar por ID local
        $reviewsLocal = \App\Models\MovieForumReview::where('movie_id', $movieId)->get();
        
        // Buscar por tmdb_movie_id
        $movie = \App\Models\Movie::where('tmdb_movie_id', $movieId)->first();
        $reviewsTmdb = $movie ? \App\Models\MovieForumReview::where('movie_id', $movie->id)->get() : collect();
        
        return response()->json([
            'movieId' => $movieId,
            'reviews_local' => $reviewsLocal->count(),
            'reviews_tmdb' => $reviewsTmdb->count(),
            'movie_found' => $movie ? [
                'id' => $movie->id,
                'title' => $movie->title,
                'tmdb_movie_id' => $movie->tmdb_movie_id
            ] : null,
            'reviews_local_data' => $reviewsLocal,
            'reviews_tmdb_data' => $reviewsTmdb
        ]);
    } catch (Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Rutas temporales fuera del middleware auth (para pruebas)
Route::post('/test-rate-movie/{movieId}', [MovieForumController::class, 'rateMovie']);
Route::post('/movie-forum/movies/{id}/reviews', [MovieForumController::class, 'createReview']);
Route::delete('/movie-forum/reviews/{id}', [MovieForumController::class, 'deleteReview']);

// Rutas protegidas (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // Usuarios
    Route::get('/users', [UserController::class, 'getUsers']);
    Route::get('/users/{id}', [UserController::class, 'getUser']);
    Route::put('/location', [UserController::class, 'updateLocation']);
    Route::post('/push-token', [UserController::class, 'updatePushToken']);
    
    // Preferencias - Géneros
    Route::get('/preferences/genres', [PreferencesController::class, 'getGenres']);
    Route::post('/preferences/genres/sync', [PreferencesController::class, 'syncGenres']);
    Route::post('/preferences/genres', [UserController::class, 'addFavoriteGenre']); // Mantener por compatibilidad
    Route::delete('/preferences/genres/{id}', [UserController::class, 'removeFavoriteGenre']);
    
    // Preferencias - Directores
    Route::get('/preferences/directors', [PreferencesController::class, 'getDirectors']);
    Route::post('/preferences/directors/sync', [PreferencesController::class, 'syncDirectors']);
    Route::post('/preferences/directors', [PreferencesController::class, 'addDirector']);
    Route::delete('/preferences/directors/{id}', [PreferencesController::class, 'removeDirector']);
    
    // Preferencias - Películas
    Route::get('/preferences/movies/watched', [PreferencesController::class, 'getWatchedMovies']);
    Route::post('/preferences/movies/sync', [PreferencesController::class, 'syncMovies']);
    Route::post('/preferences/movies/watched', [PreferencesController::class, 'addWatchedMovie']);
    Route::delete('/preferences/movies/watched/{id}', [PreferencesController::class, 'removeWatchedMovie']);
    
    // Matches
    Route::post('/matches/like', [MatchController::class, 'sendLike']);
    Route::post('/matches/undo', [MatchController::class, 'undoSwipe']);
    Route::get('/matches', [MatchController::class, 'getMatches']);
    Route::get('/matches/check/{userId}', [MatchController::class, 'checkMatch']);
    Route::get('/likes', [MatchController::class, 'getLikes']);
    
    // Mensajes (Chat)
    Route::get('/matches/{matchId}/messages', [MessageController::class, 'getMessages']);
    Route::post('/messages', [MessageController::class, 'sendMessage']);
    Route::get('/messages/unread-count', [MessageController::class, 'getUnreadCount']);
    Route::get('/messages/unread-per-match', [MessageController::class, 'getUnreadPerMatch']);
    
    // Suscripciones
    Route::get('/subscription/current', [SubscriptionController::class, 'getCurrentPlan']);
    Route::get('/subscription/plans', [SubscriptionController::class, 'getPlans']);
    Route::post('/subscription/upgrade', [SubscriptionController::class, 'upgradeToPremium']);
    Route::post('/subscription/create-order', [SubscriptionController::class, 'createPayPalOrder']);
    Route::post('/subscription/cancel', [SubscriptionController::class, 'cancelSubscription']);
    Route::get('/subscription/likes-count', [SubscriptionController::class, 'getDailyLikesCount']);

    // Gamificación
    Route::get('/gamification/state', [GamificationController::class, 'getState']);
    Route::post('/gamification/activity', [GamificationController::class, 'trackActivity']);
    // Equipar marco en perfil
    Route::post('/gamification/equip-frame', [GamificationController::class, 'equipFrame']);
    
    // Movie Forum
    Route::get('/movie-forum/movies', [MovieForumController::class, 'getMovies']);
    Route::get('/movie-forum/movies/{id}', [MovieForumController::class, 'getMovieDetail']);
    Route::post('/movie-forum/movies', [MovieForumController::class, 'createMovieWithReview']);
    Route::get('/movie-forum/reviews', [MovieForumController::class, 'getReviews']);
    Route::post('/movie-forum/reviews', [MovieForumController::class, 'createReview']);
    Route::put('/movie-forum/reviews/{id}', [MovieForumController::class, 'updateReview']);
    Route::delete('/movie-forum/reviews/{id}', [MovieForumController::class, 'deleteReview']);
    Route::post('/movie-forum/reviews/{id}/react', [MovieForumController::class, 'reactToReview']);
    Route::get('/movie-forum/reviews/{id}/replies', [MovieForumController::class, 'getReviewReplies']);
    Route::post('/movie-forum/reviews/{id}/replies', [MovieForumController::class, 'createReply']);
    Route::get('/movie-forum/movies/{id}/reviews', [MovieForumController::class, 'getMovieReviews']);
    Route::post('/movie-forum/movies/{id}/rate', [MovieForumController::class, 'rateMovie']);
    Route::post('/movie-forum/movies/{id}/reviews', [MovieForumController::class, 'createReview']);
    Route::post('/movie-forum/movies-with-review', [MovieForumController::class, 'createMovieWithReview']);
    
    // Endpoints para películas de TMDB
    Route::get('/movie-forum/check-tmdb-movie/{tmdbId}', [MovieForumController::class, 'checkTmdbMovie']);
    Route::post('/movie-forum/add-tmdb-movie', [MovieForumController::class, 'addTmdbMovie']);

    // Recomendación Diaria
    Route::get('/daily-recommendation', [DailyRecommendationController::class, 'getDailyRecommendation']);
    Route::get('/daily-recommendation/status', [DailyRecommendationController::class, 'getDailyStatus']);
    Route::post('/daily-recommendation/reset', [DailyRecommendationController::class, 'resetDailyRecommendations']);
});
