<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Director extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    // Películas del director
    public function movies()
    {
        return $this->belongsToMany(Movie::class, 'movie_directors');
    }

    // Usuarios que tienen este director como favorito
    public function fans()
    {
        return $this->belongsToMany(User::class, 'user_favorite_directors');
    }
}
