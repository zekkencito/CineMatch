<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovieForumRating extends Model
{
    protected $table = 'movie_forum_ratings';
    protected $fillable = ['movie_id', 'user_id', 'rating'];
    protected $hidden = ['created_at', 'updated_at'];

    protected $casts = [
        'rating' => 'decimal:1',
    ];

    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class, 'movie_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope para obtener calificaciones válidas (1-10)
     */
    public function scopeValid($query)
    {
        return $query->whereBetween('rating', [1, 10]);
    }
}
