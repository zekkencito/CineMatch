<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'release_year',
        'poster_url',
        'description',
        'tmdb_movie_id',
    ];

    protected $casts = [
        'release_year' => 'integer',
    ];

    // Géneros de la película
    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'movie_genres');
    }

    // Directores de la película
    public function directors()
    {
        return $this->belongsToMany(Director::class, 'movie_directors');
    }

    // Usuarios que han visto esta película
    public function watchers()
    {
        return $this->belongsToMany(User::class, 'watched_movies')
            ->withPivot('rating')
            ->withTimestamps();
    }

    // Relaciones del foro de películas
    public function movieForumReviews()
    {
        return $this->hasMany(MovieForumReview::class);
    }

    public function movieForumReactions()
    {
        return $this->hasMany(MovieForumReaction::class);
    }

    public function movieForumRatings()
    {
        return $this->hasMany(MovieForumRating::class);
    }

    /**
     * Obtener el promedio de calificaciones del foro
     */
    public function getForumAverageRatingAttribute()
    {
        return $this->movieForumRatings()
            ->valid()
            ->avg('rating');
    }

    /**
     * Obtener el número total de calificaciones del foro
     */
    public function getForumRatingCountAttribute()
    {
        return $this->movieForumRatings()
            ->valid()
            ->count();
    }

    /**
     * Obtener la calificación de un usuario específico
     */
    public function getUserForumRating($userId)
    {
        return $this->movieForumRatings()
            ->where('user_id', $userId)
            ->first();
    }
}
