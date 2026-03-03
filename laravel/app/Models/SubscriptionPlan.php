<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'daily_likes',
        'see_who_liked',
        'advanced_filters',
        'duration_days',
    ];

    protected $casts = [
        'see_who_liked' => 'boolean',
        'advanced_filters' => 'boolean',
        'price' => 'decimal:2',
    ];
}
