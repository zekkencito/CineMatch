<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'age',
        'bio',
        'profile_photo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'age' => 'integer',
    ];

    /**
     * Relaciones
     */
    
    // Ubicación del usuario (relación 1-1)
    public function location()
    {
        return $this->hasOne(Location::class);
    }
    
    // Géneros favoritos del usuario
    public function favoriteGenres()
    {
        return $this->belongsToMany(Genre::class, 'user_favorite_genres');
    }

    // Directores favoritos del usuario
    public function favoriteDirectors()
    {
        return $this->belongsToMany(Director::class, 'user_favorite_directors');
    }

    // Películas que el usuario ha visto
    public function watchedMovies()
    {
        return $this->belongsToMany(Movie::class, 'watched_movies')
            ->withPivot('rating')
            ->withTimestamps();
    }

    // Likes enviados
    public function sentLikes()
    {
        return $this->hasMany(Like::class, 'from_user_id');
    }

    // Likes recibidos
    public function receivedLikes()
    {
        return $this->hasMany(Like::class, 'to_user_id');
    }

    // Matches (relación compleja)
    public function matches()
    {
        return $this->hasMany(UserMatch::class, 'user_one_id')
            ->orWhere('user_two_id', $this->id);
    }
}
