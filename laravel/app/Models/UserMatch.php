<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMatch extends Model
{
    use HasFactory;

    protected $table = 'matches';
    
    public $timestamps = false; // La tabla solo tiene matched_at

    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'matched_at',
    ];

    protected $casts = [
        'matched_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($match) {
            if (!$match->matched_at) {
                $match->matched_at = now();
            }
        });
    }

    // Usuario uno
    public function userOne()
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    // Usuario dos
    public function userTwo()
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }
}
