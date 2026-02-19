<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PreferencesController extends Controller
{
    // ============================================
    // 🎭 GÉNEROS
    // ============================================

    /**
     * Obtener géneros favoritos del usuario
     * GET /api/preferences/genres
     */
    public function getGenres(Request $request)
    {
        $user = $request->user();
        $genres = $user->favoriteGenres;

        return response()->json([
            'success' => true,
            'genres' => $genres
        ]);
    }

    /**
     * Sincronizar géneros favoritos (reemplaza todos)
     * POST /api/preferences/genres/sync
     * Body: { "genre_ids": [28, 878, 12] }
     */
    public function syncGenres(Request $request)
    {
        $request->validate([
            'genre_ids' => 'required|array',
            'genre_ids.*' => 'integer|exists:genres,id',
        ]);

        $user = $request->user();
        
        // Sincronizar (eliminar viejos, agregar nuevos)
        $user->favoriteGenres()->sync($request->genre_ids);

        // Recargar géneros
        $user->load('favoriteGenres');

        return response()->json([
            'success' => true,
            'message' => 'Genres synced successfully',
            'genres' => $user->favoriteGenres
        ]);
    }

    // ============================================
    // 🎬 DIRECTORES
    // ============================================

    /**
     * Obtener directores favoritos del usuario
     * GET /api/preferences/directors
     */
    public function getDirectors(Request $request)
    {
        $user = $request->user();
        
        // Obtener directores de la tabla user_favorite_directors
        $directors = DB::table('user_favorite_directors')
            ->where('user_id', $user->id)
            ->select('tmdb_director_id as id', 'name', 'profile_path')
            ->get();

        return response()->json([
            'success' => true,
            'directors' => $directors
        ]);
    }

    /**
     * Sincronizar directores favoritos (reemplaza todos)
     * POST /api/preferences/directors/sync
     * Body: { "directors": [{"id": 525, "name": "Christopher Nolan"}, ...] }
     */
    public function syncDirectors(Request $request)
    {
        $request->validate([
            'directors' => 'required|array',
            'directors.*.id' => 'required|integer',
            'directors.*.name' => 'required|string|max:150',
            'directors.*.profile_path' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        
        // Eliminar directores existentes
        DB::table('user_favorite_directors')
            ->where('user_id', $user->id)
            ->delete();

        // Insertar nuevos directores
        $directorsData = collect($request->directors)->map(function($director) use ($user) {
            return [
                'user_id' => $user->id,
                'tmdb_director_id' => $director['id'],
                'name' => $director['name'],
                'profile_path' => $director['profile_path'] ?? null,
            ];
        })->toArray();

        if (!empty($directorsData)) {
            DB::table('user_favorite_directors')->insert($directorsData);
        }

        // Obtener directores actualizados
        $directors = DB::table('user_favorite_directors')
            ->where('user_id', $user->id)
            ->select('tmdb_director_id as id', 'name', 'profile_path')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Directors synced successfully',
            'directors' => $directors
        ]);
    }

    /**
     * Agregar director favorito individual
     * POST /api/preferences/directors
     * Body: { "director_id": 525, "name": "Christopher Nolan" }
     */
    public function addDirector(Request $request)
    {
        $request->validate([
            'director_id' => 'required|integer',
            'name' => 'required|string|max:150',
            'profile_path' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        
        // Verificar si ya existe
        $exists = DB::table('user_favorite_directors')
            ->where('user_id', $user->id)
            ->where('tmdb_director_id', $request->director_id)
            ->exists();

        if (!$exists) {
            DB::table('user_favorite_directors')->insert([
                'user_id' => $user->id,
                'tmdb_director_id' => $request->director_id,
                'name' => $request->name,
                'profile_path' => $request->profile_path ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Director added successfully'
        ]);
    }

    /**
     * Eliminar director favorito
     * DELETE /api/preferences/directors/{tmdb_id}
     */
    public function removeDirector(Request $request, $tmdbId)
    {
        $user = $request->user();
        
        DB::table('user_favorite_directors')
            ->where('user_id', $user->id)
            ->where('tmdb_director_id', $tmdbId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Director removed successfully'
        ]);
    }

    // ============================================
    // 🎥 PELÍCULAS VISTAS
    // ============================================

    /**
     * Obtener películas vistas del usuario
     * GET /api/preferences/movies/watched
     */
    public function getWatchedMovies(Request $request)
    {
        $user = $request->user();
        
        // Obtener películas de la tabla watched_movies
        $movies = DB::table('watched_movies')
            ->where('user_id', $user->id)
            ->select('tmdb_movie_id as id', 'title', 'poster_path', 'watched_date', 'rating')
            ->get();

        return response()->json([
            'success' => true,
            'movies' => $movies
        ]);
    }

    /**
     * Sincronizar películas vistas (reemplaza todas)
     * POST /api/preferences/movies/sync
     * Body: { "movies": [{"id": 550, "title": "Fight Club"}, ...] }
     */
    public function syncMovies(Request $request)
    {
        $request->validate([
            'movies' => 'required|array',
            'movies.*.id' => 'required|integer',
            'movies.*.title' => 'required|string|max:200',
            'movies.*.poster_path' => 'nullable|string|max:255',
            'movies.*.rating' => 'nullable|integer|min:1|max:5',
        ]);

        $user = $request->user();
        
        // Eliminar películas existentes
        DB::table('watched_movies')
            ->where('user_id', $user->id)
            ->delete();

        // Insertar nuevas películas
        $moviesData = collect($request->movies)->map(function($movie) use ($user) {
            return [
                'user_id' => $user->id,
                'tmdb_movie_id' => $movie['id'],
                'title' => $movie['title'],
                'poster_path' => $movie['poster_path'] ?? null,
                'rating' => $movie['rating'] ?? null,
                'watched_date' => now()->toDateString(),
            ];
        })->toArray();

        if (!empty($moviesData)) {
            DB::table('watched_movies')->insert($moviesData);
        }

        // Obtener películas actualizadas
        $movies = DB::table('watched_movies')
            ->where('user_id', $user->id)
            ->select('tmdb_movie_id as id', 'title', 'poster_path', 'watched_date', 'rating')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Movies synced successfully',
            'movies' => $movies
        ]);
    }

    /**
     * Agregar película vista individual
     * POST /api/preferences/movies/watched
     * Body: { "movie_id": 550, "title": "Fight Club", "rating": 5 }
     */
    public function addWatchedMovie(Request $request)
    {
        $request->validate([
            'movie_id' => 'required|integer',
            'title' => 'required|string|max:200',
            'poster_path' => 'nullable|string|max:255',
            'rating' => 'nullable|integer|min:1|max:5',
        ]);

        $user = $request->user();
        
        // Verificar si ya existe
        $exists = DB::table('watched_movies')
            ->where('user_id', $user->id)
            ->where('tmdb_movie_id', $request->movie_id)
            ->exists();

        if (!$exists) {
            DB::table('watched_movies')->insert([
                'user_id' => $user->id,
                'tmdb_movie_id' => $request->movie_id,
                'title' => $request->title,
                'poster_path' => $request->poster_path ?? null,
                'rating' => $request->rating,
                'watched_date' => now()->toDateString(),
            ]);
        } else {
            // Actualizar rating si ya existe
            DB::table('watched_movies')
                ->where('user_id', $user->id)
                ->where('tmdb_movie_id', $request->movie_id)
                ->update([
                    'rating' => $request->rating,
                    'watched_date' => now()->toDateString(),
                ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Movie added to watched list'
        ]);
    }

    /**
     * Eliminar película vista
     * DELETE /api/preferences/movies/watched/{tmdb_id}
     */
    public function removeWatchedMovie(Request $request, $tmdbId)
    {
        $user = $request->user();
        
        DB::table('watched_movies')
            ->where('user_id', $user->id)
            ->where('tmdb_movie_id', $tmdbId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Movie removed from watched list'
        ]);
    }
}
