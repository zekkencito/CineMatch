<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    // Películas de este género
    public function movies()
    {
        return $this->belongsToMany(Movie::class, 'movie_genres');
    }

    // Usuarios que tienen este género como favorito
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_favorite_genres');
    }
}
