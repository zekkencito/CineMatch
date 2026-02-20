<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan',
        'status',
        'start_date',
        'end_date',
        'max_radius',
        'daily_likes_limit',
        'can_see_likes',
        'can_undo_swipes',
        'has_advanced_filters',
        'is_featured',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'max_radius' => 'integer',
        'daily_likes_limit' => 'integer',
        'can_see_likes' => 'boolean',
        'can_undo_swipes' => 'boolean',
        'has_advanced_filters' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * Relación con el usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Verificar si la suscripción está activa
     */
    public function isActive()
    {
        if ($this->status !== 'active') {
            return false;
        }

        // Si es free, siempre está activo
        if ($this->plan === 'free') {
            return true;
        }

        // Si es premium, verificar que no haya expirado
        return $this->end_date === null || $this->end_date->isFuture();
    }

    /**
     * Verificar si es suscripción premium
     */
    public function isPremium()
    {
        return $this->plan === 'premium' && $this->isActive();
    }

    /**
     * Actualizar a premium
     */
    public function upgradeToPremium($duration = 30)
    {
        $this->update([
            'plan' => 'premium',
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addDays($duration),
            'max_radius' => 100,
            'daily_likes_limit' => -1, // Ilimitado
            'can_see_likes' => true,
            'can_undo_swipes' => true,
            'has_advanced_filters' => true,
            'is_featured' => true,
        ]);
    }

    /**
     * Cancelar suscripción
     */
    public function cancel()
    {
        $this->update([
            'status' => 'cancelled',
        ]);
    }

    /**
     * Verificar si ha expirado
     */
    public function checkExpiration()
    {
        if ($this->plan === 'premium' && $this->end_date && $this->end_date->isPast()) {
            $this->update([
                'status' => 'expired',
                'plan' => 'free',
                'max_radius' => 50,
                'daily_likes_limit' => 10,
                'can_see_likes' => false,
                'can_undo_swipes' => false,
                'has_advanced_filters' => false,
                'is_featured' => false,
            ]);
        }
    }
}
