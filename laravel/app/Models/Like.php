<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_user_id',
        'to_user_id',
        'type',
    ];

    // Usuario que envía el like
    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    // Usuario que recibe el like
    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
