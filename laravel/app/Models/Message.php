<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'sender_id',
        'receiver_id',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el match
     */
    public function match()
    {
        return $this->belongsTo(Matches::class, 'match_id');
    }

    /**
     * Relación con el usuario que envía
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Relación con el usuario que recibe
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
