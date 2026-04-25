# Ejemplos de Código Backend - Foro de Películas

## ⚡ Quick Start

### 1️⃣ Crear Modelos (automático)
```bash
php artisan make:model MovieForumMovie -m
php artisan make:model MovieForumReaction -m
php artisan make:model MovieForumReview -m
php artisan make:model MovieForumReviewReaction -m
php artisan make:model MovieForumReviewReply -m
```

### 2️⃣ Crear Controlador
```bash
php artisan make:controller MovieForumController -r
```

### 3️⃣ Ejecutar Seeder (🎬 ESTO AGREGA PELÍCULAS)
```bash
php artisan migrate
php artisan db:seed
# O solo el seeder del foro:
php artisan db:seed --class=MovieForumSeeder
```

**✅ Ahora hay películas en el foro!**

### 4️⃣ Copiar Código
- Modelos: Ver sección "Modelos" abajo
- Controlador: Ver sección "Controlador" abajo
- Rutas: Ver sección "Rutas" abajo

---

## 🌱 Seeder - Películas Populares Iniciales

Crear el seeder:
```bash
php artisan make:seeder MovieForumSeeder
```

### Archivo: `database/seeders/MovieForumSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\MovieForumMovie;
use Illuminate\Database\Seeder;

class MovieForumSeeder extends Seeder
{
    public function run(): void
    {
        $popularMovies = [
            [
                'tmdb_movie_id' => 550,
                'title' => 'Fight Club',
                'poster_path' => '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
                'backdrop_path' => '/fCayJrkfRaCo5dh61q4mh4BO5qQ.jpg',
                'release_date' => '1999-10-15',
            ],
            [
                'tmdb_movie_id' => 278,
                'title' => 'The Shawshank Redemption',
                'poster_path' => '/q6y0aKXi12c9z2DY1NnjVoO82D8.jpg',
                'backdrop_path' => '/iNh3oKbJj8nPcSzIll3dA0hFSFO.jpg',
                'release_date' => '1994-09-23',
            ],
            [
                'tmdb_movie_id' => 238,
                'title' => 'The Godfather',
                'poster_path' => '/3bhkrj58Vtu7enYsRolI1jelerzrB9.jpg',
                'backdrop_path' => '/6xKCYgH16UuwEGAyroLW1DwKALC.jpg',
                'release_date' => '1972-03-14',
            ],
            [
                'tmdb_movie_id' => 240,
                'title' => 'The Godfather Part II',
                'poster_path' => '/hoPArIqC4pknIGV4v1oKSKAJRTW.jpg',
                'backdrop_path' => '/rSPw7tgCH9c5NwLmVI3YEmXK41F.jpg',
                'release_date' => '1974-12-20',
            ],
            [
                'tmdb_movie_id' => 424,
                'title' => 'Schindler\'s List',
                'poster_path' => '/sF1U4EUQS8YHUYjNl3pMGNIQysU.jpg',
                'backdrop_path' => '/yalxcwUnvB4bY4r5Dto3ekZgXUQ.jpg',
                'release_date' => '1993-12-15',
            ],
            [
                'tmdb_movie_id' => 389,
                'title' => '12 Angry Men',
                'poster_path' => '/7sf0ZiRt2c9xu1uV6PRnWPMHqPf.jpg',
                'backdrop_path' => '/o9vMb9gKwhlNxk1Sh1wBGXaEwBB.jpg',
                'release_date' => '1957-04-01',
            ],
            [
                'tmdb_movie_id' => 680,
                'title' => 'Pulp Fiction',
                'poster_path' => '/dM2w4PZqPyH60mkteEvqwRM6GEE.jpg',
                'backdrop_path' => '/7YSaoKzUU2MxPcl5VgKnMxC7yXW.jpg',
                'release_date' => '1994-10-14',
            ],
            [
                'tmdb_movie_id' => 122,
                'title' => 'The Lord of the Rings: The Fellowship of the Ring',
                'poster_path' => '/6oom5QYQ2yQTMJIbnvbkBL9cLkD.jpg',
                'backdrop_path' => '/xIGr4nKNjSJc0-0LW1n_LFJQ4jD.jpg',
                'release_date' => '2001-12-19',
            ],
            [
                'tmdb_movie_id' => 155,
                'title' => 'The Dark Knight',
                'poster_path' => '/1hf5uPk7MEB9vXZ2kMT1iVwwK1H.jpg',
                'backdrop_path' => '/8kOWDBK6XlPfzwXl8f5w93S60U.jpg',
                'release_date' => '2008-07-18',
            ],
            [
                'tmdb_movie_id' => 637,
                'title' => 'Gladiator',
                'poster_path' => '/owEsHnqKnk26UxepQCDMENcj41Q.jpg',
                'backdrop_path' => '/15V19BcXIvnJy4cxF1J2TZnWf8w.jpg',
                'release_date' => '2000-05-05',
            ],
            [
                'tmdb_movie_id' => 769,
                'title' => 'Goodfellas',
                'poster_path' => '/gevIB6L19TkJZCvPm6ZELwdcbFi.jpg',
                'backdrop_path' => '/vSz7c2FWNGwDr2FVb0L7FKJ7Gq4.jpg',
                'release_date' => '1990-09-19',
            ],
            [
                'tmdb_movie_id' => 58,
                'title' => 'Seven Samurai',
                'poster_path' => '/e8EzxUZrfBxcbmGGpbq5J2f1wAi.jpg',
                'backdrop_path' => '/f6KdUCi2P3PsNwvFn0LbKLxXzN.jpg',
                'release_date' => '1954-11-21',
            ],
            [
                'tmdb_movie_id' => 13,
                'title' => 'Forrest Gump',
                'poster_path' => '/h5oR1G5bJ68j1xY17mHRKi6K59.jpg',
                'backdrop_path' => '/xBKGcQsAHT51p0RNcnS0pTAPaBt.jpg',
                'release_date' => '1994-07-06',
            ],
        ];

        foreach ($popularMovies as $movie) {
            MovieForumMovie::firstOrCreate(
                ['tmdb_movie_id' => $movie['tmdb_movie_id']],
                $movie
            );
        }

        echo "✅ 12 películas populares agregadas al foro\n";
    }
}
```

### Registrar en `database/seeders/DatabaseSeeder.php`:

```php
public function run(): void
{
    $this->call([
        MovieForumSeeder::class,
        // otros seeders que tengas...
    ]);
}
```

### Ejecutar:
```bash
php artisan db:seed
```

---

## Modelos

### MovieForumMovie.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MovieForumMovie extends Model
{
    protected $table = 'movie_forum_movies';
    protected $fillable = ['tmdb_movie_id', 'title', 'poster_path', 'backdrop_path', 'release_date'];
    protected $hidden = ['created_at', 'updated_at'];

    public function reactions(): HasMany
    {
        return $this->hasMany(MovieForumReaction::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(MovieForumReview::class);
    }
}
```

### MovieForumReview.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovieForumReview extends Model
{
    protected $table = 'movie_forum_reviews';
    protected $fillable = ['movie_forum_movie_id', 'user_id', 'review'];
    protected $hidden = ['updated_at'];

    public function movie(): BelongsTo
    {
        return $this->belongsTo(MovieForumMovie::class, 'movie_forum_movie_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(MovieForumReviewReaction::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(MovieForumReviewReply::class);
    }
}
```

### MovieForumReviewReply.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MovieForumReviewReply extends Model
{
    protected $table = 'movie_forum_review_replies';
    protected $fillable = ['movie_forum_review_id', 'user_id', 'parent_reply_id', 'reply'];
    protected $hidden = ['updated_at'];

    public function review(): BelongsTo
    {
        return $this->belongsTo(MovieForumReview::class, 'movie_forum_review_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parentReply(): BelongsTo
    {
        return $this->belongsTo(MovieForumReviewReply::class, 'parent_reply_id');
    }

    public function childReplies(): HasMany
    {
        return $this->hasMany(MovieForumReviewReply::class, 'parent_reply_id');
    }
}
```

## Controlador

### MovieForumController.php
```php
<?php

namespace App\Http\Controllers;

use App\Models\MovieForumMovie;
use App\Models\MovieForumReaction;
use App\Models\MovieForumReview;
use App\Models\MovieForumReviewReaction;
use App\Models\MovieForumReviewReply;
use Illuminate\Http\Request;

class MovieForumController extends Controller
{
    public function getMovies(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        
        $movies = MovieForumMovie::with([
            'reviews',
            'reactions'
        ])->paginate($perPage);

        $movies->transform(function ($movie) {
            return $this->formatMovieWithReactions($movie);
        });

        return response()->json([
            'movies' => $movies->items(),
            'meta' => [
                'page' => $movies->currentPage(),
                'per_page' => $movies->perPage(),
                'total' => $movies->total(),
            ]
        ]);
    }

    public function getMovieDetail($id)
    {
        $movie = MovieForumMovie::with('reviews')->findOrFail($id);
        return response()->json(['user' => $this->formatMovieWithReactions($movie)]);
    }

    public function getMovieReviews(Request $request, $movieId)
    {
        $perPage = $request->get('per_page', 20);
        
        $reviews = MovieForumReview::where('movie_forum_movie_id', $movieId)
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
        $movie = MovieForumMovie::find($movieId);
        if (!$movie) {
            return response()->json(['message' => 'Película no encontrada'], 404);
        }

        $review = MovieForumReview::create([
            'movie_forum_movie_id' => $movieId,
            'user_id' => auth()->id(),
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
            'movie_forum_movie_id' => $movie->id,
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
        $review = MovieForumReview::findOrFail($id);

        // Solo el autor puede eliminar
        if ($review->user_id !== auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Eliminar replies asociadas
        MovieForumReviewReply::where('movie_forum_review_id', $id)->delete();
        
        // Eliminar reacciones
        MovieForumReviewReaction::where('movie_forum_review_id', $id)->delete();

        $review->delete();

        return response()->json(['message' => 'Reseña eliminada']);
    }

    public function reactToMovie(Request $request, $movieId)
    {
        $validated = $request->validate([
            'reaction_type' => 'required|in:like,dislike'
        ]);

        $existing = MovieForumReaction::where('movie_forum_movie_id', $movieId)
            ->where('user_id', auth()->id())
            ->first();

        if ($existing) {
            if ($existing->reaction_type === $validated['reaction_type']) {
                // Misma reacción: eliminar
                $existing->delete();
                return response()->json(['message' => 'Reacción removida']);
            } else {
                // Cambiar reacción
                $existing->update(['reaction_type' => $validated['reaction_type']]);
            }
        } else {
            // Nueva reacción
            MovieForumReaction::create([
                'movie_forum_movie_id' => $movieId,
                'user_id' => auth()->id(),
                'reaction_type' => $validated['reaction_type']
            ]);
        }

        return response()->json(['message' => 'Reacción guardada']);
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

    // Métodos helper

    private function formatMovieWithReactions($movie)
    {
        $likeCount = $movie->reactions->where('reaction_type', 'like')->count();
        $dislikeCount = $movie->reactions->where('reaction_type', 'dislike')->count();
        
        $userReaction = $movie->reactions
            ->where('user_id', auth()->id())
            ->first()?->reaction_type;

        return [
            'id' => $movie->id,
            'title' => $movie->title,
            'poster_path' => $movie->poster_path,
            'backdrop_path' => $movie->backdrop_path,
            'release_date' => $movie->release_date,
            'review_count' => $movie->reviews->count(),
            'reactions' => [
                'like_count' => $likeCount,
                'dislike_count' => $dislikeCount,
                'user_reaction' => $userReaction
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
        // Similar a formatReviewWithReactions pero para replies
        return [
            'id' => $reply->id,
            'review' => $reply->reply, // Frontend espera "review" en el campo de texto
            'created_at' => $reply->created_at,
            'user_id' => $reply->user_id,
            'user' => [
                'id' => $reply->user->id,
                'name' => $reply->user->name
            ],
            'reply_count' => 0, // Las replies no tienen sub-replies en el frontend
            'reactions' => [
                'like_count' => 0,
                'dislike_count' => 0,
                'user_reaction' => null
            ]
        ];
    }
}
```

## Rutas (routes/api.php)

```php
Route::middleware(['auth:sanctum'])->group(function () {
    // Movies
    Route::get('/movie-forum/movies', [MovieForumController::class, 'getMovies']);
    Route::get('/movie-forum/movies/{id}', [MovieForumController::class, 'getMovieDetail']);
    
    // Reactions to movies
    Route::post('/movie-forum/movies/{id}/react', [MovieForumController::class, 'reactToMovie']);
    
    // Reviews
    Route::get('/movie-forum/movies/{id}/reviews', [MovieForumController::class, 'getMovieReviews']);
    Route::post('/movie-forum/movies/{id}/reviews', [MovieForumController::class, 'createReview']);
    Route::post('/movie-forum/movies-with-review', [MovieForumController::class, 'createMovieWithReview']); // 🆕
    Route::delete('/movie-forum/reviews/{id}', [MovieForumController::class, 'deleteReview']);
    
    // Reactions to reviews
    Route::post('/movie-forum/reviews/{id}/react', [MovieForumController::class, 'reactToReview']);
    
    // Replies
    Route::get('/movie-forum/reviews/{id}/replies', [MovieForumController::class, 'getReviewReplies']);
    Route::post('/movie-forum/reviews/{id}/replies', [MovieForumController::class, 'createReply']);
});
```

## Migrations

### Crear las migraciones si no existen:

```bash
php artisan make:migration create_movie_forum_tables
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movie_forum_movies', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('tmdb_movie_id')->unique('uk_tmdb_movie_id');
            $table->string('title');
            $table->string('poster_path')->nullable();
            $table->string('backdrop_path')->nullable();
            $table->date('release_date')->nullable();
            $table->timestamps();
        });

        Schema::create('movie_forum_reactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('movie_forum_movie_id');
            $table->bigInteger('user_id');
            $table->enum('reaction_type', ['like', 'dislike']);
            $table->timestamps();
            $table->unique(['movie_forum_movie_id', 'user_id']);
            $table->foreign('movie_forum_movie_id')->references('id')->on('movie_forum_movies')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('movie_forum_reviews', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('movie_forum_movie_id');
            $table->bigInteger('user_id');
            $table->text('review');
            $table->timestamps();
            $table->foreign('movie_forum_movie_id')->references('id')->on('movie_forum_movies')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('movie_forum_review_reactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('movie_forum_review_id');
            $table->bigInteger('user_id');
            $table->enum('reaction_type', ['like', 'dislike']);
            $table->timestamps();
            $table->unique(['movie_forum_review_id', 'user_id']);
            $table->foreign('movie_forum_review_id')->references('id')->on('movie_forum_reviews')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('movie_forum_review_replies', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('movie_forum_review_id');
            $table->bigInteger('user_id');
            $table->bigInteger('parent_reply_id')->nullable();
            $table->text('reply');
            $table->timestamps();
            $table->foreign('movie_forum_review_id')->references('id')->on('movie_forum_reviews')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('parent_reply_id')->references('id')->on('movie_forum_review_replies')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movie_forum_review_replies');
        Schema::dropIfExists('movie_forum_review_reactions');
        Schema::dropIfExists('movie_forum_reviews');
        Schema::dropIfExists('movie_forum_reactions');
        Schema::dropIfExists('movie_forum_movies');
    }
};
```

---

## Testing Manual

```bash
# Crear película de prueba
POST /api/movie-forum/movies
{
  "tmdb_movie_id": 550,
  "title": "Fight Club",
  "poster_path": "/path/to/poster.jpg",
  "release_date": "1999-10-15"
}

# Listar películas
GET /api/movie-forum/movies?page=1&per_page=20

# Reaccionar a película
POST /api/movie-forum/movies/1/react
{
  "reaction_type": "like"
}

# Crear reseña
POST /api/movie-forum/movies/1/reviews
{
  "review": "Excelente película, recomendada 100%"
}
```

---

## Notas

- Todos los endpoints requieren autenticación `auth:sanctum`
- Las reacciones son toggle (si ya existe con el mismo tipo, se elimina)
- Los replies no tienen reacciones ni replies de replies (simplificar)
- Validar que el usuario exista antes de crear reviews
