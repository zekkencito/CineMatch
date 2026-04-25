<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\MovieForumReaction;
use App\Models\MovieForumRating;
use App\Models\MovieForumReview;
use App\Models\MovieForumReviewReaction;
use App\Models\MovieForumReviewReply;
use Illuminate\Http\Request;

class MovieForumController extends Controller
{
    public function getMovies(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 20);
            
            // Obtener películas que tienen reseñas en el foro
            $movies = Movie::withCount([
                'movieForumReviews as review_count',
                'movieForumRatings as rating_count'
            ])
            ->withMax('movieForumReviews as latest_review_at', 'created_at')
            ->withMax('movieForumRatings as latest_rating_at', 'updated_at')
            ->whereHas('movieForumReviews')
            ->orderByRaw("GREATEST(COALESCE(latest_review_at, '1970-01-01 00:00:00'), COALESCE(latest_rating_at, '1970-01-01 00:00:00')) DESC")
            ->paginate($perPage);

            // Formatear cada película
            $formattedMovies = $movies->getCollection()->map(function ($movie) {
                $ratingSourceMovie = $movie;

                // Si esta fila no tiene calificación pero comparte tmdb_movie_id con otra fila,
                // usar esa calificación para evitar mostrar N/A por duplicados históricos.
                if (($movie->forum_rating_count ?? 0) == 0 && !empty($movie->tmdb_movie_id)) {
                    $fallbackMovie = Movie::where('tmdb_movie_id', $movie->tmdb_movie_id)
                        ->whereHas('movieForumRatings')
                        ->orderByDesc('id')
                        ->first();

                    if ($fallbackMovie) {
                        $ratingSourceMovie = $fallbackMovie;
                    }
                }

                // Fallback adicional: algunos duplicados antiguos no tienen tmdb_movie_id,
                // pero comparten título/año con otra fila que sí tiene calificaciones.
                if (($ratingSourceMovie->forum_rating_count ?? 0) == 0) {
                    $fallbackByTitle = Movie::where('title', $movie->title)
                        ->where('release_year', $movie->release_year)
                        ->whereHas('movieForumRatings')
                        ->orderByDesc('id')
                        ->first();

                    if ($fallbackByTitle) {
                        $ratingSourceMovie = $fallbackByTitle;
                    }
                }

                // Obtener calificación del usuario actual
                $userRating = null;
                if (auth()->check()) {
                    $userRatingObj = $ratingSourceMovie->getUserForumRating(auth()->id());
                    $userRating = $userRatingObj ? $userRatingObj->rating : null;
                }

                return [
                    'id' => $movie->id,
                    'tmdb_movie_id' => $movie->tmdb_movie_id,
                    'title' => $movie->title,
                    'poster_path' => $movie->poster_url,
                    'backdrop_path' => null,
                    'release_date' => $movie->release_year ? $movie->release_year . '-01-01' : null,
                    'vote_average' => $ratingSourceMovie->forum_average_rating,
                    'review_count' => $movie->review_count,
                    'latest_activity_at' => $movie->latest_review_at > $movie->latest_rating_at
                        ? $movie->latest_review_at
                        : $movie->latest_rating_at,
                    'ratings' => [
                        'average_rating' => $ratingSourceMovie->forum_average_rating,
                        'rating_count' => $ratingSourceMovie->forum_rating_count,
                        'user_rating' => $userRating
                    ]
                ];
            });

            return response()->json([
                'movies' => $formattedMovies->toArray(),
                'meta' => [
                    'page' => $movies->currentPage(),
                    'per_page' => $movies->perPage(),
                    'total' => $movies->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en getMovies',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function getMovieDetail($id)
    {
        // Primero intentar encontrar por ID local (sin relaciones que no existen)
        $movie = Movie::with(['movieForumReviews', 'movieForumRatings'])->find($id);
        
        // Si no se encuentra por ID local, buscar por tmdb_movie_id
        if (!$movie) {
            $movie = Movie::with(['movieForumReviews', 'movieForumRatings'])->where('tmdb_movie_id', $id)->first();
        }
        
        if (!$movie) {
            return response()->json(['message' => 'Película no encontrada'], 404);
        }
        
        return response()->json(['movie' => $this->formatMovieWithRatings($movie)]);
    }

    public function getMovieReviews(Request $request, $movieId)
    {
        $perPage = $request->get('per_page', 20);
        
        $reviews = MovieForumReview::where('movie_id', $movieId)
            ->with(['user', 'reactions', 'replies'])
            ->latest()
            ->paginate($perPage);

        $reviews->transform(function ($review) {
            return $this->formatReviewWithReactions($review);
        });

        return response()->json(['reviews' => $reviews->items()]);
    }

    public function createReview(Request $request, $movieId)
    {
        $validated = $request->validate([
            'review' => 'required|string|min:10|max:1000'
        ]);

        // Verificar que la película existe
        $movie = Movie::find($movieId);
        
        // Si no se encuentra por ID local, buscar por tmdb_movie_id
        if (!$movie) {
            $movie = Movie::where('tmdb_movie_id', $movieId)->first();
        }
        
        if (!$movie) {
            \Log::error("Movie not found for ID: $movieId, attempting to create from TMDB");
            
            // Intentar crear la película desde TMDB
            try {
                // Usar la API key correcta de TMDB (la misma que usa la app React Native)
                $tmdbApiKey = '6bbead30a73217ca3cd601c83f85e50b';
                $response = file_get_contents("https://api.themoviedb.org/3/movie/$movieId?api_key=$tmdbApiKey");
                $tmdbData = json_decode($response, true);
                
                if ($tmdbData && isset($tmdbData['title'])) {
                    \Log::info("Attempting to create movie with ID: $movieId");
                    
                    // Intentar primero con insert normal
                    $movie = Movie::create([
                        'tmdb_movie_id' => $movieId,
                        'title' => $tmdbData['title'],
                        'poster_url' => $tmdbData['poster_path'] ? 'https://image.tmdb.org/t/p/w500' . $tmdbData['poster_path'] : null,
                        'release_year' => $tmdbData['release_date'] ? substr($tmdbData['release_date'], 0, 4) : null,
                        'overview' => $tmdbData['overview'] ?? null,
                    ]);
                    
                    \Log::info("Created TMDB movie for review: " . $movie->title . " (ID: " . $movie->id . ", tmdb_movie_id: " . $movieId . ")");
                    
                    // Si el ID no es el esperado, actualizarlo
                    if ($movie->id != $movieId) {
                        \Log::info("Updating movie ID from " . $movie->id . " to " . $movieId);
                        \DB::table('movies')->where('id', $movie->id)->update(['id' => $movieId]);
                        $movie->id = $movieId;
                    }
                } else {
                    \Log::error("Failed to fetch TMDB data for movie ID: $movieId");
                    return response()->json(['message' => 'Película no encontrada y no se pudo crear desde TMDB', 'movieId' => $movieId], 404);
                }
            } catch (Exception $e) {
                \Log::error("Error creating TMDB movie for review: " . $e->getMessage());
                return response()->json(['message' => 'Error al crear película desde TMDB', 'movieId' => $movieId], 500);
            }
        }

        // Para pruebas, usar user_id = 1 si no hay autenticación
        $userId = auth()->id() ?: 1;
        
        $review = MovieForumReview::create([
            'movie_id' => $movie->id,
            'user_id' => $userId,
            'review' => $validated['review']
        ]);

        return response()->json($review, 201);
    }

    // 🆕 Crear película y reseña (para cuando el usuario quiere reseñar una película que no existe)
    public function createMovieWithReview(Request $request)
    {
        $validated = $request->validate([
            'tmdb_movie_id' => 'required|integer|unique:movie_forum_movies',
            'title' => 'required|string|max:255',
            'poster_path' => 'nullable|string',
            'backdrop_path' => 'nullable|string',
            'release_date' => 'nullable|date',
            'review' => 'required|string|min:10|max:1000'
        ]);

        // Crear película
        $movie = MovieForumMovie::create([
            'tmdb_movie_id' => $validated['tmdb_movie_id'],
            'title' => $validated['title'],
            'poster_path' => $validated['poster_path'],
            'backdrop_path' => $validated['backdrop_path'],
            'release_date' => $validated['release_date'],
        ]);

        // Crear reseña
        $review = MovieForumReview::create([
            'movie_id' => $movie->id,
            'user_id' => auth()->id(),
            'review' => $validated['review']
        ]);

        return response()->json([
            'movie' => $movie,
            'review' => $review
        ], 201);
    }

    public function deleteReview($id)
    {
        \Log::info("=== deleteReview START ===");
        \Log::info("Review ID to delete: $id");
        
        $review = MovieForumReview::findOrFail($id);
        \Log::info("Review found: " . json_encode($review));

        // Para pruebas, permitir eliminar cualquier reseña (temporalmente)
        // Solo el autor puede eliminar
        $userId = auth()->id() ?: 1;
        \Log::info("User ID: $userId, Review user_id: " . $review->user_id);
        
        if ($review->user_id !== $userId) {
            \Log::error("Unauthorized: User $userId trying to delete review by user " . $review->user_id);
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Eliminar replies asociadas
        MovieForumReviewReply::where('movie_forum_review_id', $id)->delete();
        \Log::info("Deleted replies for review $id");
        
        // Eliminar reacciones
        MovieForumReviewReaction::where('movie_forum_review_id', $id)->delete();
        \Log::info("Deleted reactions for review $id");

        $review->delete();
        \Log::info("Review $id deleted successfully");

        return response()->json(['message' => 'Reseña eliminada']);
    }

    public function rateMovie(Request $request, $movieId)
    {
        // Log para diagnóstico
        \Log::info("=== rateMovie START ===");
        \Log::info("movieId: $movieId");
        \Log::info("Request data: " . json_encode($request->all()));
        \Log::info("User authenticated: " . (auth()->check() ? 'YES' : 'NO'));
        \Log::info("User ID: " . (auth()->id() ?? 'NULL'));
        \Log::info("Token: " . ($request->bearerToken() ?? 'NULL'));
        
        try {
        
        $validated = $request->validate([
            'rating' => 'required|numeric|min:1|max:10'
        ]);

        // Primero intentar encontrar por ID local
        $movie = Movie::find($movieId);
        \Log::info("Search by ID " . ($movie ? "found: " . $movie->title : "not found"));
        
        // Si no se encuentra por ID local, buscar por tmdb_movie_id
        if (!$movie) {
            $movie = Movie::where('tmdb_movie_id', $movieId)->first();
            \Log::info("Search by tmdb_movie_id " . ($movie ? "found: " . $movie->title : "not found"));
        }
        
        if (!$movie) {
            \Log::error("Movie not found for ID: $movieId, attempting to create from TMDB");
            
            // Intentar crear la película desde TMDB
            try {
                // Usar la API key correcta de TMDB (la misma que usa la app React Native)
                $tmdbApiKey = '6bbead30a73217ca3cd601c83f85e50b';
                $response = file_get_contents("https://api.themoviedb.org/3/movie/$movieId?api_key=$tmdbApiKey");
                $tmdbData = json_decode($response, true);
                
                if ($tmdbData && isset($tmdbData['title'])) {
                    $movie = Movie::create([
                        'id' => $movieId, // Usar el mismo ID que TMDB
                        'tmdb_movie_id' => $movieId,
                        'title' => $tmdbData['title'],
                        'poster_url' => $tmdbData['poster_path'] ? 'https://image.tmdb.org/t/p/w500' . $tmdbData['poster_path'] : null,
                        'release_year' => $tmdbData['release_date'] ? substr($tmdbData['release_date'], 0, 4) : null,
                        'overview' => $tmdbData['overview'] ?? null,
                    ]);
                    
                    \Log::info("Created TMDB movie: " . $movie->title . " (ID: " . $movie->id . ", tmdb_movie_id: " . $movieId . ")");
                } else {
                    \Log::error("Failed to fetch TMDB data for movie ID: $movieId");
                    return response()->json(['message' => 'Película no encontrada y no se pudo crear desde TMDB', 'movieId' => $movieId], 404);
                }
            } catch (Exception $e) {
                \Log::error("Error creating TMDB movie: " . $e->getMessage());
                return response()->json(['message' => 'Error al crear película desde TMDB', 'movieId' => $movieId], 500);
            }
        }
        
        \Log::info("Movie found: " . $movie->title . " (ID: " . $movie->id . ")");
        
        // Para pruebas, usar user_id = 1 si no hay autenticación
        $userId = auth()->id() ?: 1;
        
        $existing = MovieForumRating::where('movie_id', $movie->id)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            // Actualizar calificación existente
            $existing->update(['rating' => $validated['rating']]);
        } else {
            // Nueva calificación
            MovieForumRating::create([
                'movie_id' => $movie->id,
                'user_id' => $userId,
                'rating' => $validated['rating']
            ]);
        }

        // Retornar estadísticas actualizadas
        return response()->json([
            'message' => 'Calificación guardada',
            'ratings' => [
                'average_rating' => $movie->forum_average_rating,
                'rating_count' => $movie->forum_rating_count,
                'user_rating' => $validated['rating']
            ]
        ]);
        
        } catch (Exception $e) {
            \Log::error("Error in rateMovie: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al guardar calificación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reactToReview(Request $request, $reviewId)
    {
        $validated = $request->validate([
            'reaction_type' => 'required|in:like,dislike'
        ]);

        $existing = MovieForumReviewReaction::where('movie_forum_review_id', $reviewId)
            ->where('user_id', auth()->id())
            ->first();

        if ($existing) {
            if ($existing->reaction_type === $validated['reaction_type']) {
                $existing->delete();
                return response()->json(['message' => 'Reacción removida']);
            } else {
                $existing->update(['reaction_type' => $validated['reaction_type']]);
            }
        } else {
            MovieForumReviewReaction::create([
                'movie_forum_review_id' => $reviewId,
                'user_id' => auth()->id(),
                'reaction_type' => $validated['reaction_type']
            ]);
        }

        return response()->json(['message' => 'Reacción guardada']);
    }

    public function getReviewReplies(Request $request, $reviewId)
    {
        $perPage = $request->get('per_page', 20);

        $replies = MovieForumReviewReply::where('movie_forum_review_id', $reviewId)
            ->whereNull('parent_reply_id') // Solo replies principales
            ->with(['user', 'childReplies.user'])
            ->latest()
            ->paginate($perPage);

        $replies->transform(function ($reply) {
            return $this->formatReplyWithReactions($reply);
        });

        return response()->json(['replies' => $replies->items()]);
    }

    public function createReply(Request $request, $reviewId)
    {
        $validated = $request->validate([
            'reply' => 'required|string|min:5|max:1000',
            'parent_reply_id' => 'nullable|exists:movie_forum_review_replies,id'
        ]);

        $reply = MovieForumReviewReply::create([
            'movie_forum_review_id' => $reviewId,
            'user_id' => auth()->id(),
            'parent_reply_id' => $validated['parent_reply_id'] ?? null,
            'reply' => $validated['reply']
        ]);

        $reply->load(['user', 'childReplies']);

        return response()->json($reply, 201);
    }

    public function checkTmdbMovie($tmdbId)
    {
        try {
            // Buscar película por tmdb_movie_id
            $movie = Movie::where('tmdb_movie_id', $tmdbId)->first();
            
            if (!$movie) {
                return response()->json([
                    'exists' => false
                ]);
            }
            
            // Obtener calificaciones del usuario
            $userRating = null;
            if (auth()->check()) {
                $userRatingObj = $movie->getUserForumRating(auth()->id());
                $userRating = $userRatingObj ? $userRatingObj->rating : null;
            }
            
            return response()->json([
                'exists' => true,
                'movie_id' => $movie->id,
                'ratings' => [
                    'user_rating' => $userRating,
                    'average_rating' => $movie->forum_average_rating,
                    'rating_count' => $movie->forum_rating_count
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en checkTmdbMovie',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function addTmdbMovie(Request $request)
    {
        $validated = $request->validate([
            'tmdb_movie_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'poster_path' => 'nullable|string',
            'release_date' => 'nullable|date',
            'overview' => 'nullable|string'
        ]);

        try {
            // Verificar si ya existe
            $existingMovie = Movie::where('tmdb_movie_id', $validated['tmdb_movie_id'])->first();
            if ($existingMovie) {
                return response()->json([
                    'message' => 'La película ya existe',
                    'movie_id' => $existingMovie->id
                ]);
            }

            // Crear nueva película
            $movie = Movie::create([
                'tmdb_movie_id' => $validated['tmdb_movie_id'],
                'title' => $validated['title'],
                'poster_url' => $validated['poster_path'],
                'release_year' => $validated['release_date'] ? date('Y', strtotime($validated['release_date'])) : null,
                'description' => $validated['overview']
            ]);

            return response()->json([
                'message' => 'Película agregada correctamente',
                'movie_id' => $movie->id
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en addTmdbMovie',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    
    // Métodos helper

    private function formatMovieWithRatings($movie)
    {
        // Obtener calificación del usuario actual
        $userRating = null;
        if (auth()->check()) {
            $userRatingObj = $movie->getUserForumRating(auth()->id());
            $userRating = $userRatingObj ? $userRatingObj->rating : null;
        }

        return [
            'id' => $movie->id,
            'title' => $movie->title,
            'poster_path' => $movie->poster_url,
            'backdrop_path' => null,
            'release_date' => $movie->release_year ? $movie->release_year . '-01-01' : null,
            'vote_average' => $movie->forum_average_rating,
            'review_count' => $movie->movieForumReviews->count(),
            'ratings' => [
                'average_rating' => $movie->forum_average_rating,
                'rating_count' => $movie->forum_rating_count,
                'user_rating' => $userRating
            ]
        ];
    }

    private function formatReviewWithReactions($review)
    {
        $likeCount = $review->reactions->where('reaction_type', 'like')->count();
        $dislikeCount = $review->reactions->where('reaction_type', 'dislike')->count();
        
        $userReaction = $review->reactions
            ->where('user_id', auth()->id())
            ->first()?->reaction_type;

        return [
            'id' => $review->id,
            'review' => $review->review,
            'created_at' => $review->created_at,
            'user_id' => $review->user_id,
            'user' => [
                'id' => $review->user->id,
                'name' => $review->user->name
            ],
            'reply_count' => $review->replies->count(),
            'reactions' => [
                'like_count' => $likeCount,
                'dislike_count' => $dislikeCount,
                'user_reaction' => $userReaction
            ],
            'replies' => $review->replies->map(fn($r) => $this->formatReplyWithReactions($r))
        ];
    }

    private function formatReplyWithReactions($reply)
    {
        return [
            'id' => $reply->id,
            'review' => $reply->reply,
            'created_at' => $reply->created_at,
            'user_id' => $reply->user_id,
            'user' => [
                'id' => $reply->user->id,
                'name' => $reply->user->name
            ],
            'reply_count' => 0,
            'reactions' => [
                'like_count' => 0,
                'dislike_count' => 0,
                'user_reaction' => null
            ]
        ];
    }
}
