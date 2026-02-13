<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Obtener usuarios para el swipe
     * Excluye usuarios ya vistos (likes/dislikes) y con los que ya hay match
     * Filtra por: distancia, géneros comunes, y calcula match %
     */
    public function getUsers(Request $request)
    {
        $currentUser = $request->user();
        $userId = $currentUser->id;

        // Cargar todas las preferencias del usuario actual
        $currentUser->load(['location', 'favoriteGenres']);

        // Obtener géneros, directores y películas del usuario actual
        $currentGenreIds = $currentUser->favoriteGenres->pluck('id')->toArray();
        
        $currentDirectorIds = DB::table('user_favorite_directors')
            ->where('user_id', $userId)
            ->pluck('tmdb_director_id')
            ->toArray();
            
        $currentMovieIds = DB::table('watched_movies')
            ->where('user_id', $userId)
            ->pluck('tmdb_movie_id')
            ->toArray();

        // IDs de usuarios ya vistos (likes o dislikes)
        $seenUserIds = Like::where('from_user_id', $userId)
            ->pluck('to_user_id')
            ->toArray();

        // Query base - obtener usuarios potenciales
        $query = User::where('id', '!=', $userId)
            ->whereNotIn('id', $seenUserIds)
            ->with(['favoriteGenres', 'location']);

        // Obtener usuarios candidatos
        $users = $query->get();

        // Cargar películas vistas de cada usuario
        foreach ($users as $user) {
            $user->watched_movies_list = DB::table('watched_movies')
                ->where('user_id', $user->id)
                ->select('tmdb_movie_id as id', 'title', 'rating')
                ->limit(10)
                ->get();
        }

        // Filtrar por distancia si el usuario tiene ubicación
        if ($currentUser->location && $currentUser->location->latitude && $currentUser->location->longitude) {
            $lat = $currentUser->location->latitude;
            $lon = $currentUser->location->longitude;
            $radius = $currentUser->location->search_radius ?? 50;

            $users = $users->filter(function($user) use ($lat, $lon, $radius) {
                if (!$user->location || !$user->location->latitude || !$user->location->longitude) {
                    return false; // Excluir usuarios sin ubicación
                }

                // Calcular distancia usando fórmula de Haversine
                $targetLat = $user->location->latitude;
                $targetLon = $user->location->longitude;

                $earthRadius = 6371; // en km
                $dLat = deg2rad($targetLat - $lat);
                $dLon = deg2rad($targetLon - $lon);
                
                $a = sin($dLat/2) * sin($dLat/2) +
                     cos(deg2rad($lat)) * cos(deg2rad($targetLat)) *
                     sin($dLon/2) * sin($dLon/2);
                
                $c = 2 * atan2(sqrt($a), sqrt(1-$a));
                $distance = $earthRadius * $c;

                $user->distance = round($distance, 1); // Guardar distancia
                return $distance <= $radius;
            });
        }

        // Filtrar por géneros comunes y calcular match %
        $usersWithMatch = $users->map(function($user) use ($currentGenreIds, $currentDirectorIds, $currentMovieIds, $currentUser) {
            // Obtener géneros del usuario objetivo
            $targetGenreIds = $user->favoriteGenres->pluck('id')->toArray();
            
            // Obtener directores del usuario objetivo
            $targetDirectorIds = DB::table('user_favorite_directors')
                ->where('user_id', $user->id)
                ->pluck('tmdb_director_id')
                ->toArray();
                
            // Obtener películas del usuario objetivo
            $targetMovieIds = DB::table('watched_movies')
                ->where('user_id', $user->id)
                ->pluck('tmdb_movie_id')
                ->toArray();

            // Calcular intersecciones
            $commonGenres = array_intersect($currentGenreIds, $targetGenreIds);
            $commonDirectors = array_intersect($currentDirectorIds, $targetDirectorIds);
            $commonMovies = array_intersect($currentMovieIds, $targetMovieIds);

            // Si no tiene al menos 1 género en común, excluir
            if (empty($commonGenres)) {
                return null;
            }

            // Calcular porcentajes de match por categoría
            $genreMatch = 0;
            $directorMatch = 0;
            $movieMatch = 0;
            $distanceMatch = 0;

            // Géneros (40% del total)
            if (!empty($currentGenreIds) && !empty($targetGenreIds)) {
                $genreMatch = (count($commonGenres) / max(count($currentGenreIds), count($targetGenreIds))) * 40;
            }

            // Directores (30% del total)
            if (!empty($currentDirectorIds) && !empty($targetDirectorIds)) {
                $directorMatch = (count($commonDirectors) / max(count($currentDirectorIds), count($targetDirectorIds))) * 30;
            }

            // Películas (20% del total)
            if (!empty($currentMovieIds) && !empty($targetMovieIds)) {
                $movieMatch = (count($commonMovies) / max(count($currentMovieIds), count($targetMovieIds))) * 20;
            }

            // Distancia (10% del total - mientras más cerca, mejor)
            if (isset($user->distance)) {
                $maxRadius = $currentUser->location->search_radius ?? 50;
                $distanceMatch = ((($maxRadius - $user->distance) / $maxRadius) * 10);
                $distanceMatch = max(0, $distanceMatch); // No negativo
            }

            // Match total
            $matchPercentage = round($genreMatch + $directorMatch + $movieMatch + $distanceMatch);

            // Agregar información de match al usuario
            $user->match_percentage = $matchPercentage;
            $user->common_genres_count = count($commonGenres);
            $user->common_directors_count = count($commonDirectors);
            $user->common_movies_count = count($commonMovies);

            return $user;
        })->filter(); // Eliminar nulls

        // Ordenar por match % (mejor match primero)
        $usersWithMatch = $usersWithMatch->sortByDesc('match_percentage')->values();

        // Limitar a 20 usuarios
        $usersWithMatch = $usersWithMatch->take(20);

        return response()->json([
            'success' => true,
            'users' => $usersWithMatch
        ]);
    }

    /**
     * Obtener perfil de usuario por ID
     */
    public function getUser($id)
    {
        $user = User::with(['favoriteGenres', 'favoriteDirectors', 'watchedMovies'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    /**
     * Actualizar ubicación del usuario
     */
    public function updateLocation(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'search_radius' => 'nullable|integer|min:5|max:500',
            'searchRadius' => 'nullable|integer|min:5|max:500', // Alias para camelCase
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        
        // Usar searchRadius si search_radius no está presente
        $radius = $request->search_radius ?? $request->searchRadius ?? 50;
        
        $locationData = [
            'search_radius' => $radius,
        ];

        // Solo actualizar lat/lon si se envían
        if ($request->has('latitude')) {
            $locationData['latitude'] = $request->latitude;
        }
        if ($request->has('longitude')) {
            $locationData['longitude'] = $request->longitude;
        }
        if ($request->has('city')) {
            $locationData['city'] = $request->city;
        }
        if ($request->has('country')) {
            $locationData['country'] = $request->country;
        }

        // Actualizar o crear ubicación
        if ($user->location) {
            $user->location->update($locationData);
        } else {
            // Si no tiene ubicación y se requieren lat/lon, validar
            if (!isset($locationData['latitude']) || !isset($locationData['longitude'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Latitude and longitude are required for new locations'
                ], 400);
            }
            $user->location()->create($locationData);
        }

        // Cargar la relación actualizada
        $user->load('location');

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully',
            'location' => $user->location
        ]);
    }

    /**
     * Agregar género favorito
     */
    public function addFavoriteGenre(Request $request)
    {
        $request->validate([
            'genre_id' => 'required|exists:genres,id',
        ]);

        $user = $request->user();
        
        // Agregar si no existe
        if (!$user->favoriteGenres()->where('genre_id', $request->genre_id)->exists()) {
            $user->favoriteGenres()->attach($request->genre_id);
        }

        return response()->json([
            'success' => true,
            'genres' => $user->favoriteGenres
        ]);
    }

    /**
     * Remover género favorito
     */
    public function removeFavoriteGenre(Request $request, $genreId)
    {
        $user = $request->user();
        $user->favoriteGenres()->detach($genreId);

        return response()->json([
            'success' => true,
            'genres' => $user->favoriteGenres
        ]);
    }

    /**
     * Obtener géneros favoritos del usuario
     */
    public function getFavoriteGenres(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'genres' => $user->favoriteGenres
        ]);
    }

    /**
     * Agregar película vista
     */
    public function addWatchedMovie(Request $request)
    {
        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        $user = $request->user();
        
        // Agregar o actualizar película vista
        $user->watchedMovies()->syncWithoutDetaching([
            $request->movie_id => ['rating' => $request->rating]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Movie added to watched list'
        ]);
    }
}
