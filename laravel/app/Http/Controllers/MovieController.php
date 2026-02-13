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
        $query = Movie::with(['genres', 'directors']);

        // Filtrar por género si se especifica
        if ($request->has('genre_id')) {
            $query->whereHas('genres', function ($q) use ($request) {
                $q->where('genres.id', $request->genre_id);
            });
        }

        // Filtrar por director si se especifica
        if ($request->has('director_id')) {
            $query->whereHas('directors', function ($q) use ($request) {
                $q->where('directors.id', $request->director_id);
            });
        }

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
     * Obtener película por ID
     */
    public function getMovie($id)
    {
        $movie = Movie::with(['genres', 'directors'])->findOrFail($id);

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

        $movies = Movie::with(['genres', 'directors'])
            ->where('title', 'like', '%' . $request->query . '%')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'movies' => $movies
        ]);
    }
}
