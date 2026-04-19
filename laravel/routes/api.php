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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Rutas públicas (sin autenticación)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/social-login', [AuthController::class, 'socialLogin']);

Route::get('/limpiar-cache', function() {
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    return 'Caché borrada con éxito';
});

// Rutas de películas y géneros (públicas)
Route::get('/movies', [MovieController::class, 'getMovies']);
Route::get('/movies/{id}', [MovieController::class, 'getMovie']);
Route::get('/movies/search', [MovieController::class, 'searchMovies']);
Route::get('/genres', [MovieController::class, 'getGenres']);
Route::get('/directors', [MovieController::class, 'getDirectors']);

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
    Route::post('/gamification/equip-frame', [GamificationController::class, 'equipFrame']);

    // DEBUG: Verificar pipeline de notificaciones
    Route::get('/debug/push-status', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $token = $user->expo_push_token;

        // Intentar enviar notificación de prueba si hay token
        $pushResult = null;
        if ($token) {
            try {
                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])->post('https://exp.host/--/api/v2/push/send', [
                    'to' => $token,
                    'sound' => 'default',
                    'title' => '🔔 Test CineMatch',
                    'body' => 'Pipeline de notificaciones funcionando correctamente',
                    'data' => ['type' => 'test'],
                ]);
                $pushResult = $response->json();
            } catch (\Exception $e) {
                $pushResult = ['error' => $e->getMessage()];
            }
        }

        return response()->json([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'has_token' => !empty($token),
            'token_preview' => $token ? substr($token, 0, 30) . '...' : null,
            'expo_api_response' => $pushResult,
        ]);
    });

}); 

// Rutas de Admin (sin middleware de autenticación para evitar redirecciones)
Route::post('/admin/login', [AdminController::class, 'login']);

// Admin - Rutas protegidas (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/dashboard/stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/admin/dashboard/charts', [AdminController::class, 'getDashboardCharts']);

    // Admin - Usuarios
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::get('/admin/users/{id}', [AdminController::class, 'getUser']);
    Route::post('/admin/users', [AdminController::class, 'createUser']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/admin/users/statistics/summary', [AdminController::class, 'getUserStatistics']);

    // Admin - Planes de Suscripción
    Route::get('/admin/subscription-plans', [AdminController::class, 'getSubscriptionPlans']);
    Route::get('/admin/subscription-plans/{id}', [AdminController::class, 'getSubscriptionPlan']);
    Route::post('/admin/subscription-plans', [AdminController::class, 'createSubscriptionPlan']);
    Route::put('/admin/subscription-plans/{id}', [AdminController::class, 'updateSubscriptionPlan']);
    Route::delete('/admin/subscription-plans/{id}', [AdminController::class, 'deleteSubscriptionPlan']);
    Route::get('/admin/subscriptions/statistics', [AdminController::class, 'getSubscriptionStatistics']);
    Route::get('/admin/users/{userId}/subscriptions', [AdminController::class, 'getUserSubscriptions']);

    // Admin logout
    Route::post('/admin/logout', [AdminController::class, 'logout']);

    
});
