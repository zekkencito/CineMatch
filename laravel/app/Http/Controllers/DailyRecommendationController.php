<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DailyRecommendationController extends Controller
{
    /**
     * Obtiene una recomendación diaria para el usuario
     */
    public function getDailyRecommendation(Request $request)
    {
        $user = $request->user();
        $mood = $request->input('mood'); // filtro: 'comedy', 'horror', 'drama', etc.
        
        // Verificar límite diario
        $dailyCount = $this->getDailyRecommendationCount($user->id);
        
        if ($dailyCount >= 3) { // Límite de 3 recomendaciones diarias
            return response()->json([
                'error' => 'DAILY_LIMIT_EXCEEDED',
                'message' => 'Has alcanzado tu límite de 3 recomendaciones diarias. Vuelve mañana para más.',
                'count' => $dailyCount,
                'limit' => 3
            ], 429); // 429 Too Many Requests
        }
        
        // Obtener película recomendada
        $movie = $this->getRandomMovieByMood($mood, $user->id);
        
        if (!$movie) {
            return response()->json([
                'error' => 'NO_MOVIE_FOUND',
                'message' => 'No se encontraron películas con los filtros seleccionados'
            ], 404);
        }
        
        // Incrementar contador diario
        $this->incrementDailyCount($user->id);
        
        return response()->json([
            'success' => true,
            'movie' => $movie,
            'remaining_recommendations' => 3 - ($dailyCount + 1),
            'daily_count' => $dailyCount + 1,
            'limit' => 3
        ]);
    }
    
    /**
     * Obtiene el conteo de recomendaciones diarias del usuario
     */
    private function getDailyRecommendationCount($userId)
    {
        $cacheKey = "daily_recommendations_{$userId}_" . now()->format('Y-m-d');
        
        return Cache::remember($cacheKey, now()->endOfDay(), function () use ($userId) {
            return 0;
        });
    }
    
    /**
     * Incrementa el contador diario
     */
    private function incrementDailyCount($userId)
    {
        $cacheKey = "daily_recommendations_{$userId}_" . now()->format('Y-m-d');
        
        Cache::increment($cacheKey);
        
        // Asegurar que expire al final del día
        if (!Cache::has($cacheKey . '_expiry')) {
            Cache::put($cacheKey . '_expiry', true, now()->endOfDay());
        }
    }
    
    /**
     * Obtiene una película aleatoria según el mood/filtro
     */
    private function getRandomMovieByMood($mood, $userId)
    {
        $query = DB::table('movies')
            ->select('movies.*')
            ->where('movies.poster_url', '!=', '')
            ->whereNotNull('movies.poster_url');
            
        // Aplicar filtro por mood/género usando keywords en el título o descripción
        if ($mood && $mood !== 'all') {
            $keywords = [
                'comedy' => ['comedy', 'fun', 'laugh', 'humor', 'comedia', 'risa'],
                'horror' => ['horror', 'scary', 'terror', 'fear', 'horror', 'miedo'],
                'drama' => ['drama', 'emotional', 'serious', 'drama', 'emocional'],
                'action' => ['action', 'adventure', 'thrill', 'action', 'aventura'],
                'romance' => ['romance', 'love', 'romantic', 'amor', 'romántico'],
                'thriller' => ['thriller', 'suspense', 'mystery', 'suspenso'],
                'sci-fi' => ['sci-fi', 'science', 'space', 'future', 'ciencia'],
                'animation' => ['animation', 'cartoon', 'animated', 'animación']
            ];
            
            if (isset($keywords[$mood])) {
                $query->where(function($q) use ($keywords, $mood) {
                    foreach ($keywords[$mood] as $keyword) {
                        $q->orWhere('movies.title', 'LIKE', "%{$keyword}%")
                          ->orWhere('movies.description', 'LIKE', "%{$keyword}%");
                    }
                });
            }
        }
        
        // Si no hay películas con el filtro, obtener una aleatoria
        $movie = $query->inRandomOrder()->first();
        
        // Si no se encuentra con el filtro, obtener cualquier película
        if (!$movie && $mood && $mood !== 'all') {
            $movie = DB::table('movies')
                ->select('movies.*')
                ->where('movies.poster_url', '!=', '')
                ->whereNotNull('movies.poster_url')
                ->inRandomOrder()
                ->first();
        }
        
        return $movie ? [
            'id' => $movie->id,
            'title' => $movie->title,
            'poster_path' => $movie->poster_url, // Mapear a poster_url
            'overview' => $movie->description,    // Mapear a description
            'release_date' => $movie->release_year, // Mapear a release_year
            'vote_average' => 7.5, // Valor por defecto ya que no existe esta columna
            'mood' => $mood // Agregar mood para el frontend
        ] : null;
    }
    
    /**
     * Obtiene el estado actual de recomendaciones diarias
     */
    public function getDailyStatus(Request $request)
    {
        $user = $request->user();
        $dailyCount = $this->getDailyRecommendationCount($user->id);
        
        return response()->json([
            'daily_count' => $dailyCount,
            'limit' => 3, // Límite de 3 recomendaciones diarias
            'remaining' => max(0, 3 - $dailyCount),
            'reset_time' => now()->endOfDay()->toISOString()
        ]);
    }

    /**
     * Resetea el contador de recomendaciones diarias (para desarrollo/testing)
     */
    public function resetDailyRecommendations(Request $request)
    {
        $user = $request->user();
        $cacheKey = "daily_recommendations_{$user->id}_" . now()->format('Y-m-d');
        
        Cache::forget($cacheKey);
        Cache::forget($cacheKey . '_expiry');
        
        return response()->json([
            'success' => true,
            'message' => 'Contador de recomendaciones diarias reseteado',
            'daily_count' => 0,
            'remaining' => 3
        ]);
    }
}
