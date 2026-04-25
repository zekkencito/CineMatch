<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MovieRatingController extends Controller
{
    /**
     * Obtener calificación promedio de una película
     */
    public function getMovieRating($movieId)
    {
        try {
            // Primero intentar encontrar la película por ID local
            $movie = DB::table('movies')->where('id', $movieId)->first();
            
            // Si no se encuentra por ID local, buscar por tmdb_movie_id
            if (!$movie) {
                $movie = DB::table('movies')->where('tmdb_movie_id', $movieId)->first();
                
                // Si se encuentra por tmdb_movie_id, usar su ID local
                if ($movie) {
                    $movieId = $movie->id;
                }
            }
            
            // Si aún no se encuentra, devolver sin calificaciones
            if (!$movie) {
                return response()->json([
                    'success' => false,
                    'message' => 'Película no encontrada en la base de datos',
                    'average_rating' => null,
                    'total_ratings' => 0
                ]);
            }
            
            // Buscar calificaciones en movie_forum_ratings
            $ratings = DB::table('movie_forum_ratings')
                ->where('movie_id', $movieId)
                ->get();
            
            if ($ratings->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay calificaciones para esta película',
                    'average_rating' => null,
                    'total_ratings' => 0
                ]);
            }
            
            // Calcular promedio
            $averageRating = $ratings->avg('rating');
            $totalRatings = $ratings->count();
            
            return response()->json([
                'success' => true,
                'average_rating' => round($averageRating, 1),
                'total_ratings' => $totalRatings,
                'ratings' => $ratings
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener calificación: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Obtener calificaciones de múltiples películas
     */
    public function getMoviesRatings(Request $request)
    {
        try {
            $movieIds = $request->input('movie_ids', []);
            
            if (empty($movieIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se proporcionaron IDs de películas'
                ]);
            }
            
            $ratings = DB::table('movie_forum_ratings')
                ->whereIn('movie_id', $movieIds)
                ->select('movie_id', DB::raw('AVG(rating) as average_rating'), DB::raw('COUNT(*) as total_ratings'))
                ->groupBy('movie_id')
                ->get();
            
            $ratingsMap = [];
            foreach ($ratings as $rating) {
                $ratingsMap[$rating->movie_id] = [
                    'average_rating' => round($rating->average_rating, 1),
                    'total_ratings' => $rating->total_ratings
                ];
            }
            
            return response()->json([
                'success' => true,
                'ratings' => $ratingsMap
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener calificaciones: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Agregar calificación de usuario a una película
     */
    public function rateMovie(Request $request, $movieId)
    {
        try {
            $user = $request->user();
            $rating = $request->input('rating');
            
            if (!$rating || $rating < 1 || $rating > 10) {
                return response()->json([
                    'success' => false,
                    'message' => 'La calificación debe estar entre 1 y 10'
                ]);
            }
            
            // Primero intentar encontrar la película por ID local
            $movie = DB::table('movies')->where('id', $movieId)->first();
            
            // Si no se encuentra por ID local, buscar por tmdb_movie_id
            if (!$movie) {
                $movie = DB::table('movies')->where('tmdb_movie_id', $movieId)->first();
                
                // Si se encuentra por tmdb_movie_id, usar su ID local
                if ($movie) {
                    $movieId = $movie->id;
                }
            }
            
            // Si aún no se encuentra, no permitir calificar
            if (!$movie) {
                return response()->json([
                    'success' => false,
                    'message' => 'Película no encontrada. No se puede calificar.'
                ]);
            }
            
            // Verificar si el usuario ya calificó esta película
            $existingRating = DB::table('movie_forum_ratings')
                ->where('movie_id', $movieId)
                ->where('user_id', $user->id)
                ->first();
            
            if ($existingRating) {
                // Actualizar calificación existente
                DB::table('movie_forum_ratings')
                    ->where('id', $existingRating->id)
                    ->update([
                        'rating' => $rating,
                        'updated_at' => now()
                    ]);
            } else {
                // Crear nueva calificación
                DB::table('movie_forum_ratings')->insert([
                    'movie_id' => $movieId,
                    'user_id' => $user->id,
                    'rating' => $rating,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
            
            // Obtener nuevo promedio
            $avgRating = DB::table('movie_forum_ratings')
                ->where('movie_id', $movieId)
                ->avg('rating');
            
            return response()->json([
                'success' => true,
                'message' => 'Calificación guardada exitosamente',
                'average_rating' => round($avgRating, 1)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al guardar calificación: ' . $e->getMessage()
            ], 500);
        }
    }
}
