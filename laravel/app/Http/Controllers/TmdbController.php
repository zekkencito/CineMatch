<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TmdbController extends Controller
{
    private $apiKey;
    private $baseUrl = 'https://api.themoviedb.org/3';

    public function __construct()
    {
        $this->apiKey = '6bbead30a73217ca3cd601c83f85e50b';
    }

    /**
     * Buscar películas por texto
     */
    public function searchMovies(Request $request)
    {
        try {
            $query = $request->get('query');
            $page = $request->get('page', 1);
            $language = $request->get('language', 'es-MX');
            $includeAdult = $request->get('include_adult', false);
            $primaryReleaseYear = $request->get('primary_release_year');
            $withGenres = $request->get('with_genres');
            $minVoteAverage = $request->get('min_vote_average');

            if (empty($query)) {
                return response()->json(['error' => 'Query parameter is required'], 400);
            }

            $params = [
                'api_key' => $this->apiKey,
                'query' => $query,
                'page' => $page,
                'language' => $language,
                'include_adult' => $includeAdult,
            ];

            if ($primaryReleaseYear) {
                $params['primary_release_year'] = $primaryReleaseYear;
            }

            if ($withGenres) {
                $params['with_genres'] = $withGenres;
            }

            if ($minVoteAverage) {
                // Try to apply minimum vote average filter
                // Note: /search/movie may not support this, but /discover/movie does
                $params['vote_average.gte'] = $minVoteAverage;
            }

            $response = Http::get($this->baseUrl . '/search/movie', $params);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'TMDB API Error',
                    'status' => $response->status(),
                    'message' => $response->json()
                ], $response->status());
            }

            $data = $response->json();
            
            // Filter results if minVoteAverage is set
            $results = $data['results'] ?? [];
            if ($minVoteAverage) {
                $results = array_filter($results, function ($movie) use ($minVoteAverage) {
                    return isset($movie['vote_average']) && $movie['vote_average'] >= $minVoteAverage;
                });
                $results = array_values($results); // Re-index array
            }
            
            // Formatear resultados
            $formattedMovies = collect($results)->map(function ($movie) {
                return [
                    'id' => $movie['id'],
                    'title' => $movie['title'],
                    'poster_path' => $movie['poster_path'],
                    'backdrop_path' => $movie['backdrop_path'],
                    'release_date' => $movie['release_date'],
                    'vote_average' => $movie['vote_average'],
                    'vote_count' => $movie['vote_count'],
                    'overview' => $movie['overview'],
                    'genre_ids' => $movie['genre_ids'] ?? [],
                    'popularity' => $movie['popularity'],
                    'original_title' => $movie['original_title'] ?? null,
                    'original_language' => $movie['original_language'] ?? 'en',
                ];
            });

            return response()->json([
                'movies' => $formattedMovies->toArray(),
                'meta' => [
                    'page' => $data['page'],
                    'total_pages' => $data['total_pages'],
                    'total_results' => $data['total_results'],
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener películas populares
     */
    public function getPopularMovies(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $language = $request->get('language', 'es-MX');
            $withGenres = $request->get('with_genres');
            $minVoteAverage = $request->get('min_vote_average');
            $sortBy = $request->get('sort_by', 'popularity.desc');

            // Build params for TMDB
            $params = [
                'api_key' => $this->apiKey,
                'page' => $page,
                'language' => $language,
                'sort_by' => $sortBy,
            ];

            // Add optional filters
            if ($withGenres) {
                $params['with_genres'] = $withGenres;
            }

            // TMDB uses vote_average.gte not min_vote_average
            if ($minVoteAverage) {
                $params['vote_average.gte'] = $minVoteAverage;
                \Log::info('✅ Added filter: vote_average.gte = ' . $minVoteAverage);
            }

            \Log::info('🎬 getPopularMovies sending to TMDB:', $params);

            $response = Http::get($this->baseUrl . '/discover/movie', $params);

            if (!$response->successful()) {
                \Log::error('❌ TMDB Error:', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json([
                    'error' => 'TMDB API Error',
                    'status' => $response->status()
                ], $response->status());
            }

            $data = $response->json();
            
            \Log::info('✅ TMDB Response before filtering:', [
                'num_results' => count($data['results'] ?? []),
                'first_movie' => isset($data['results'][0]) ? [
                    'title' => $data['results'][0]['title'],
                    'rating' => $data['results'][0]['vote_average']
                ] : null
            ]);
            
            // Filter results if minVoteAverage is set
            $results = $data['results'] ?? [];
            if ($minVoteAverage) {
                $results = array_filter($results, function ($movie) use ($minVoteAverage) {
                    return isset($movie['vote_average']) && $movie['vote_average'] >= $minVoteAverage;
                });
                $results = array_values($results); // Re-index array
                \Log::info('✅ After filtering by vote_average >= ' . $minVoteAverage . ':', [
                    'num_results' => count($results),
                    'first_movie' => isset($results[0]) ? [
                        'title' => $results[0]['title'],
                        'rating' => $results[0]['vote_average']
                    ] : null
                ]);
            }
            
            $formattedMovies = collect($results)->map(function ($movie) {
                return [
                    'id' => $movie['id'],
                    'title' => $movie['title'],
                    'poster_path' => $movie['poster_path'],
                    'backdrop_path' => $movie['backdrop_path'],
                    'release_date' => $movie['release_date'],
                    'vote_average' => $movie['vote_average'],
                    'vote_count' => $movie['vote_count'],
                    'overview' => $movie['overview'],
                    'genre_ids' => $movie['genre_ids'] ?? [],
                    'popularity' => $movie['popularity'],
                    'original_title' => $movie['original_title'] ?? null,
                    'original_language' => $movie['original_language'] ?? 'en',
                ];
            });

            return response()->json([
                'movies' => $formattedMovies->toArray(),
                'meta' => [
                    'page' => $data['page'],
                    'total_pages' => $data['total_pages'],
                    'total_results' => $data['total_results'],
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener películas mejor calificadas
     */
    public function getTopRatedMovies(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $language = $request->get('language', 'es-MX');
            $withGenres = $request->get('with_genres');

            $params = [
                'api_key' => $this->apiKey,
                'page' => $page,
                'language' => $language,
            ];

            if ($withGenres) {
                $params['with_genres'] = $withGenres;
            }

            $response = Http::get($this->baseUrl . '/movie/top_rated', $params);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'TMDB API Error',
                    'status' => $response->status()
                ], $response->status());
            }

            $data = $response->json();
            
            $formattedMovies = collect($data['results'])->map(function ($movie) {
                return [
                    'id' => $movie['id'],
                    'title' => $movie['title'],
                    'poster_path' => $movie['poster_path'],
                    'backdrop_path' => $movie['backdrop_path'],
                    'release_date' => $movie['release_date'],
                    'vote_average' => $movie['vote_average'],
                    'vote_count' => $movie['vote_count'],
                    'overview' => $movie['overview'],
                    'genre_ids' => $movie['genre_ids'] ?? [],
                    'popularity' => $movie['popularity'],
                    'original_title' => $movie['original_title'] ?? null,
                    'original_language' => $movie['original_language'] ?? 'en',
                ];
            });

            return response()->json([
                'movies' => $formattedMovies->toArray(),
                'meta' => [
                    'page' => $data['page'],
                    'total_pages' => $data['total_pages'],
                    'total_results' => $data['total_results'],
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalles de una película específica
     */
    public function getMovieDetails($movieId)
    {
        try {
            $response = Http::get($this->baseUrl . "/movie/{$movieId}", [
                'api_key' => $this->apiKey,
                'language' => 'es-MX',
                'append_to_response' => 'credits,videos,reviews'
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'TMDB API Error',
                    'status' => $response->status()
                ], $response->status());
            }

            $movie = $response->json();
            
            return response()->json([
                'id' => $movie['id'],
                'title' => $movie['title'],
                'poster_path' => $movie['poster_path'],
                'backdrop_path' => $movie['backdrop_path'],
                'release_date' => $movie['release_date'],
                'vote_average' => $movie['vote_average'],
                'vote_count' => $movie['vote_count'],
                'overview' => $movie['overview'],
                'genres' => $movie['genres'] ?? [],
                'popularity' => $movie['popularity'],
                'original_title' => $movie['original_title'] ?? null,
                'original_language' => $movie['original_language'] ?? 'en',
                'runtime' => $movie['runtime'] ?? null,
                'budget' => $movie['budget'] ?? null,
                'revenue' => $movie['revenue'] ?? null,
                'credits' => $movie['credits'] ?? [],
                'videos' => $movie['videos'] ?? [],
                'reviews' => $movie['reviews'] ?? [],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener lista de géneros
     */
    public function getGenres()
    {
        try {
            $response = Http::get($this->baseUrl . '/genre/movie/list', [
                'api_key' => $this->apiKey,
                'language' => 'es-MX'
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'TMDB API Error',
                    'status' => $response->status()
                ], $response->status());
            }

            $data = $response->json();
            
            return response()->json([
                'genres' => $data['genres'] ?? []
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server Error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
