<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    /**
     * Obtener el plan actual del usuario
     */
    public function getCurrentPlan()
    {
        $user = Auth::user();
        $subscription = $user->subscription;

        // Si no tiene suscripción, crear una free por defecto
        if (!$subscription) {
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan' => 'free',
                'status' => 'active',
                'max_radius' => 50,
                'daily_likes_limit' => 10,
            ]);
        }

        // Verificar expiración
        $subscription->checkExpiration();
        $subscription->refresh();

        return response()->json([
            'success' => true,
            'subscription' => [
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'is_premium' => $subscription->isPremium(),
                'started_at' => $subscription->started_at,
                'expires_at' => $subscription->expires_at,
                'benefits' => [
                    'max_radius' => $subscription->max_radius,
                    'daily_likes_limit' => $subscription->daily_likes_limit === -1 ? 'unlimited' : $subscription->daily_likes_limit,
                    'can_see_likes' => $subscription->can_see_likes,
                    'can_undo_swipes' => $subscription->can_undo_swipes,
                    'has_advanced_filters' => $subscription->has_advanced_filters,
                    'is_featured' => $subscription->is_featured,
                ]
            ]
        ]);
    }

    /**
     * Actualizar a premium (simulación de pago)
     */
    public function upgradeToPremium(Request $request)
    {
        $request->validate([
            'duration' => 'nullable|integer|min:1|max:365', // Días de suscripción
        ]);

        $user = Auth::user();
        $subscription = $user->subscription;

        // Si no tiene suscripción, crear una
        if (!$subscription) {
            $subscription = Subscription::create([
                'user_id' => $user->id,
            ]);
        }

        // Actualizar a premium
        $duration = $request->input('duration', 30); // 30 días por defecto
        $subscription->upgradeToPremium($duration);

        return response()->json([
            'success' => true,
            'message' => '¡Felicidades! Ahora eres usuario Premium',
            'subscription' => [
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'expires_at' => $subscription->expires_at,
                'benefits' => [
                    'max_radius' => $subscription->max_radius,
                    'daily_likes_limit' => 'unlimited',
                    'can_see_likes' => true,
                    'can_undo_swipes' => true,
                    'has_advanced_filters' => true,
                    'is_featured' => true,
                ]
            ]
        ]);
    }

    /**
     * Cancelar suscripción
     */
    public function cancelSubscription()
    {
        $user = Auth::user();
        $subscription = $user->subscription;

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes una suscripción activa'
            ], 404);
        }

        if ($subscription->plan === 'free') {
            return response()->json([
                'success' => false,
                'message' => 'No puedes cancelar el plan gratuito'
            ], 400);
        }

        $subscription->cancel();

        return response()->json([
            'success' => true,
            'message' => 'Tu suscripción ha sido cancelada. Mantendrás los beneficios hasta la fecha de expiración.',
            'expires_at' => $subscription->expires_at
        ]);
    }

    /**
     * Obtener información de planes disponibles
     */
    public function getPlans()
    {
        return response()->json([
            'success' => true,
            'plans' => [
                'free' => [
                    'name' => 'Gratis',
                    'price' => 0,
                    'features' => [
                        'Radio de búsqueda: hasta 50 km',
                        'Hasta 10 likes por día',
                        'Funcionalidades básicas',
                    ]
                ],
                'premium' => [
                    'name' => 'Premium',
                    'price' => 9.99, // USD por mes
                    'features' => [
                        '🌍 Radio extendido hasta 100 km',
                        '❤️ Likes ilimitados',
                        '💫 Ver quién te dio like',
                        '⏮️ Deshacer swipes',
                        '🎬 Filtros avanzados',
                        '🌟 Perfil destacado',
                    ]
                ]
            ]
        ]);
    }

    /**
     * Obtener conteo de likes usados hoy
     */
    public function getDailyLikesCount()
    {
        $user = Auth::user();
        $subscription = $user->subscription;

        // Si es premium, likes ilimitados
        if ($subscription && $subscription->isPremium()) {
            return response()->json([
                'success' => true,
                'likes_used' => 0,
                'likes_limit' => -1,
                'is_unlimited' => true
            ]);
        }

        // Contar likes enviados hoy
        $likesToday = $user->sentLikes()
            ->whereDate('created_at', today())
            ->count();

        $limit = $subscription ? $subscription->daily_likes_limit : 10;

        return response()->json([
            'success' => true,
            'likes_used' => $likesToday,
            'likes_limit' => $limit,
            'is_unlimited' => false,
            'remaining' => max(0, $limit - $likesToday)
        ]);
    }
}
