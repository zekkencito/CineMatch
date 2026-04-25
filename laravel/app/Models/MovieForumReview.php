<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovieForumReview extends Model
{
    protected $table = 'movie_forum_reviews';
    protected $fillable = ['movie_id', 'user_id', 'review'];
    protected $hidden = ['updated_at'];

    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class, 'movie_id');
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
