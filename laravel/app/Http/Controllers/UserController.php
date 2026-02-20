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
        $currentUser->load(['location', 'favoriteGenres', 'subscription']);

        // Determinar si el usuario es premium (esto permitirá relajar filtros)
        $isPremium = false;
        if ($currentUser->subscription && method_exists($currentUser->subscription, 'isPremium')) {
            try {
                $isPremium = (bool) $currentUser->subscription->isPremium();
            } catch (\Exception $e) {
                $isPremium = false;
            }
        }

        // Obtener géneros, directores y películas del usuario actual
        $currentGenreIds = $currentUser->favoriteGenres->pluck('id')->toArray();

        // Mapar géneros locales (inglés) a los IDs de TMDB cuando sea necesario
        $genreNameToTmdb = [
            'Action' => 28,
            'Adventure' => 12,
            'Animation' => 16,
            'Comedy' => 35,
            'Crime' => 80,
            'Documentary' => 99,
            'Drama' => 18,
            'Family' => 10751,
            'Fantasy' => 14,
            'History' => 36,
            'Horror' => 27,
            'Mystery' => 9648,
            'Science Fiction' => 878,
            'Thriller' => 53,
            'Western' => 37,
            'Music' => 10402,
            'Romance' => 10749
        ];

        $mapToTmdb = function($genreCollection) use ($genreNameToTmdb) {
            $tmdbIds = [];
            foreach ($genreCollection as $g) {
                // Primero usar tmdb_id si está disponible (columna directa del modelo Genre)
                if (!empty($g->tmdb_id)) {
                    $tmdbIds[] = intval($g->tmdb_id);
                    continue;
                }

                // Fallback: si el id ya parece un ID TMDB (>= 100) usarlo directamente
                if (intval($g->id) >= 100) {
                    $tmdbIds[] = intval($g->id);
                    continue;
                }

                // Fallback final: mapear por nombre (inglés)
                $name = trim($g->name);
                if (isset($genreNameToTmdb[$name])) {
                    $tmdbIds[] = $genreNameToTmdb[$name];
                }
            }

            // Asegurar valores únicos
            return array_values(array_unique($tmdbIds));
        };

        // IDs TMDB normalizados del usuario actual
        $currentGenreTmdbIds = $mapToTmdb($currentUser->favoriteGenres);
        
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

        // Paginación (page, per_page)
        $page = max(1, (int) $request->get('page', 1));
        $perPage = max(5, min(100, (int) $request->get('per_page', 20))); // límites razonables

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
                ->select('tmdb_movie_id as id', 'title', 'poster_path', 'rating')
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
        $usersWithMatch = $users->map(function($user) use ($currentGenreTmdbIds, $currentDirectorIds, $currentMovieIds, $currentUser, $mapToTmdb, $isPremium) {
            // Obtener géneros del usuario objetivo y normalizarlos a IDs TMDB
            $targetGenreTmdbIds = $mapToTmdb($user->favoriteGenres);
            
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

            // Calcular intersecciones usando IDs TMDB normalizados
            $commonGenres = array_intersect($currentGenreTmdbIds, $targetGenreTmdbIds);
            $commonDirectors = array_intersect($currentDirectorIds, $targetDirectorIds);
            $commonMovies = array_intersect($currentMovieIds, $targetMovieIds);

            // Si no tiene al menos 1 género en común, excluir (salvo si el usuario actual es Premium)
            if (empty($commonGenres) && !$isPremium) {
                return null;
            }

            // Calcular porcentajes de match por categoría
            $genreMatch = 0;
            $directorMatch = 0;
            $movieMatch = 0;
            $distanceMatch = 0;

            // Géneros (40% del total)
            if (!empty($currentGenreTmdbIds) && !empty($targetGenreTmdbIds)) {
                $genreMatch = (count($commonGenres) / max(count($currentGenreTmdbIds), count($targetGenreTmdbIds))) * 40;
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

        // Paginación sobre la colección filtrada + meta
        $total = $usersWithMatch->count();
        $paginated = $usersWithMatch->forPage($page, $perPage)->values();

        return response()->json([
            'success' => true,
            'users' => $paginated,
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
            ],
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
            'search_radius' => 'nullable|integer|min:1',
            'searchRadius' => 'nullable|integer|min:1', // Alias para camelCase
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        // Usar searchRadius si search_radius no está presente
        $desiredRadius = $request->search_radius ?? $request->searchRadius ?? 7;

        // Determinar límite máximo según el plan del usuario
        $maxAllowed = 7; // valor por defecto para usuarios free
        if ($user->subscription && method_exists($user->subscription, 'isPremium') && $user->subscription->isPremium()) {
            $maxAllowed = 20000; // permitir gran cobertura para premium
        }

        // Asegurar que el radio esté dentro de 1..$maxAllowed
        $radius = (int) max(1, min($desiredRadius, $maxAllowed));

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
