<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovieForumReviewReaction extends Model
{
    protected $table = 'movie_forum_review_reactions';
    protected $fillable = ['movie_forum_review_id', 'user_id', 'reaction_type'];
    protected $hidden = ['created_at', 'updated_at'];

    public function review(): BelongsTo
    {
        return $this->belongsTo(MovieForumReview::class, 'movie_forum_review_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
