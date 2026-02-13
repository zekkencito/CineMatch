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
}
