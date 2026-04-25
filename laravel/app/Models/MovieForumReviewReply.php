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
