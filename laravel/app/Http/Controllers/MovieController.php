<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\Genre;
use App\Models\Director;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    /**
     * Obtener todas las películas
     */
    public function getMovies(Request $request)
    {
        // No cargar relaciones que no existen
        $query = Movie::query();

        // Búsqueda por título
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $movies = $query->paginate(20);

        return response()->json([
            'success' => true,
            'movies' => $movies
        ]);
    }

    /**
     * Obtener una película específica
     */
    public function getMovie($id)
    {
        // Primero intentar encontrar por ID local (sin relaciones)
        $movie = Movie::find($id);
        
        // Si no se encuentra por ID local, buscar por tmdb_movie_id
        if (!$movie) {
            $movie = Movie::where('tmdb_movie_id', $id)->first();
        }

        if (!$movie) {
            return response()->json([
                'success' => false,
                'message' => 'Película no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'movie' => $movie
        ]);
    }

    /**
     * Obtener todos los géneros
     */
    public function getGenres()
    {
        $genres = Genre::all();

        return response()->json([
            'success' => true,
            'genres' => $genres
        ]);
    }

    /**
     * Obtener todos los directores
     */
    public function getDirectors(Request $request)
    {
        $query = Director::query();

        // Búsqueda por nombre
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $directors = $query->paginate(20);

        return response()->json([
            'success' => true,
            'directors' => $directors
        ]);
    }

    /**
     * Buscar películas (alias para getMovies con búsqueda)
     */
    public function searchMovies(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $movies = Movie::where('title', 'like', '%' . $request->query . '%')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'movies' => $movies
        ]);
    }
}
