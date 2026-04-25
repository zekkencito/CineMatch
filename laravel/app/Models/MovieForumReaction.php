<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MovieForumReaction extends Model
{
    protected $table = 'movie_forum_reactions';
    protected $fillable = ['movie_id', 'user_id', 'reaction_type'];
    protected $hidden = ['created_at', 'updated_at'];

    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class, 'movie_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
