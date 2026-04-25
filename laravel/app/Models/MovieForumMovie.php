<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MovieForumMovie extends Model
{
    protected $table = 'movie_forum_movies';
    protected $fillable = ['tmdb_movie_id', 'title', 'poster_path', 'backdrop_path', 'release_date', 'vote_average'];
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
