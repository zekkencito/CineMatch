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

        // Intentar validar pago si viene incluido (recomendado)
        $duration = $request->input('duration', 30); // 30 días por defecto
        $payment = $request->input('payment');

        $paid = false;
        if ($payment && (env('PAYPAL_CLIENT_ID') || env('PAYPAL_SECRET'))) {
            // Intentar una verificación ligera con PayPal Orders API (sandbox/production según env)
            try {
                $orderId = $payment['orderID'] ?? $payment['id'] ?? null;
                if ($orderId) {
                    $clientId = env('PAYPAL_CLIENT_ID');
                    $secret = env('PAYPAL_SECRET');
                    $base = env('PAYPAL_ENV') === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

                    // Obtener access token
                    $tokenResp = \Illuminate\Support\Facades\Http::withBasicAuth($clientId, $secret)
                        ->asForm()
                        ->post("{$base}/v1/oauth2/token", ['grant_type' => 'client_credentials']);

                    if ($tokenResp->ok()) {
                        $access = $tokenResp->json()['access_token'] ?? null;
                        if ($access) {
                            $orderResp = \Illuminate\Support\Facades\Http::withToken($access)
                                ->get("{$base}/v2/checkout/orders/{$orderId}");

                            if ($orderResp->ok()) {
                                $order = $orderResp->json();
                                // Considerar pagado si status es COMPLETED or APPROVED
                                $status = strtoupper($order['status'] ?? '');
                                if (in_array($status, ['COMPLETED', 'APPROVED'])) {
                                    $paid = true;
                                }
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                // Registrar pero no bloquear: en dev local puede no verificarse
                logger('PayPal verification failed: ' . $e->getMessage());
            }
        } else {
            // Si no se proporciona pago, en entorno local permitimos la actualización (simulación)
            $paid = app()->environment('local') || app()->environment('testing');
        }

        if (!$paid) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not verified',
            ], 402);
        }

        // Actualizar a premium
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

    /**
     * Crear una orden de PayPal y devolver la URL de aprobación
     */
    public function createPayPalOrder(Request $request)
    {
        $request->validate([
            'duration' => 'nullable|integer|min:1|max:365',
        ]);

        $duration = $request->input('duration', 30);

        // Precio base por mes (USD)
        $pricePerMonth = 9.99;
        $amount = round($pricePerMonth * ($duration / 30), 2);
        if ($amount <= 0) $amount = 0.5;

        $clientId = env('PAYPAL_CLIENT_ID');
        $secret = env('PAYPAL_SECRET');
        $base = env('PAYPAL_ENV') === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        // En entorno local/testing, simular orden si no hay credenciales válidas
        if (app()->environment('local', 'testing') && (!$clientId || !$secret || $clientId === $secret)) {
            logger('PayPal: usando modo simulación (credenciales no configuradas o iguales)');
            return response()->json([
                'success' => true,
                'orderID' => 'MOCK_ORDER_' . time() . '_' . rand(1000, 9999),
                'approveUrl' => 'https://www.sandbox.paypal.com/checkoutnow?token=MOCK_TOKEN',
                'amount' => $amount,
                'mock' => true,
            ]);
        }

        try {
            // Obtener access token
            $tokenResp = \Illuminate\Support\Facades\Http::withBasicAuth($clientId, $secret)
                ->asForm()
                ->post("{$base}/v1/oauth2/token", ['grant_type' => 'client_credentials']);

            if (!$tokenResp->ok()) {
                logger('PayPal token request failed: ' . $tokenResp->status() . ' - ' . $tokenResp->body());
                
                // En local, permitir mock en caso de fallo
                if (app()->environment('local', 'testing')) {
                    return response()->json([
                        'success' => true,
                        'orderID' => 'MOCK_ORDER_' . time() . '_' . rand(1000, 9999),
                        'approveUrl' => 'https://www.sandbox.paypal.com/checkoutnow?token=MOCK_TOKEN',
                        'amount' => $amount,
                        'mock' => true,
                    ]);
                }
                
                return response()->json(['success' => false, 'message' => 'Could not obtain PayPal token'], 500);
            }

            $access = $tokenResp->json()['access_token'] ?? null;
            if (!$access) {
                return response()->json(['success' => false, 'message' => 'Invalid PayPal token response'], 500);
            }

            // Crear orden
            $body = [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'amount' => [
                        'currency_code' => 'USD',
                        'value' => number_format($amount, 2, '.', ''),
                    ]
                ]],
                'application_context' => [
                    'brand_name' => 'CineMatch',
                    'landing_page' => 'NO_PREFERENCE',
                    'user_action' => 'PAY_NOW',
                    'return_url' => url('/paypal/return'),
                    'cancel_url' => url('/paypal/cancel'),
                ]
            ];

            $orderResp = \Illuminate\Support\Facades\Http::withToken($access)
                ->acceptJson()
                ->post("{$base}/v2/checkout/orders", $body);

            if (!$orderResp->successful()) {
                logger('PayPal create order failed: ' . $orderResp->body());
                return response()->json(['success' => false, 'message' => 'Failed to create PayPal order'], 500);
            }

            $order = $orderResp->json();
            $orderId = $order['id'] ?? null;
            $approve = null;
            foreach ($order['links'] ?? [] as $link) {
                if (($link['rel'] ?? '') === 'approve') {
                    $approve = $link['href'];
                    break;
                }
            }

            return response()->json([
                'success' => true,
                'orderID' => $orderId,
                'approveUrl' => $approve,
                'amount' => $amount,
            ]);

        } catch (\Exception $e) {
            logger('PayPal create order exception: ' . $e->getMessage());
            
            // En local, permitir mock en caso de excepción
            if (app()->environment('local', 'testing')) {
                return response()->json([
                    'success' => true,
                    'orderID' => 'MOCK_ORDER_' . time() . '_' . rand(1000, 9999),
                    'approveUrl' => 'https://www.sandbox.paypal.com/checkoutnow?token=MOCK_TOKEN',
                    'amount' => $amount,
                    'mock' => true,
                ]);
            }
            
            return response()->json(['success' => false, 'message' => 'PayPal error'], 500);
        }
    }

    /**
     * Manejar retorno exitoso de PayPal (después del pago)
     */
    public function handlePayPalReturn(Request $request)
    {
        $token = $request->query('token');
        $payerId = $request->query('PayerID');

        if (!$token) {
            return view('paypal-result', [
                'success' => false,
                'message' => 'Token de PayPal no encontrado',
            ]);
        }

        try {
            // Capturar el pago
            $clientId = env('PAYPAL_CLIENT_ID');
            $secret = env('PAYPAL_SECRET');
            $base = env('PAYPAL_ENV') === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

            // Obtener access token
            $tokenResp = \Illuminate\Support\Facades\Http::withBasicAuth($clientId, $secret)
                ->asForm()
                ->post("{$base}/v1/oauth2/token", ['grant_type' => 'client_credentials']);

            if (!$tokenResp->successful()) {
                throw new \Exception('No se pudo obtener token de PayPal');
            }

            $accessToken = $tokenResp->json()['access_token'] ?? null;
            if (!$accessToken) {
                throw new \Exception('Token de acceso inválido');
            }

            // Capturar la orden usando cURL directo (Laravel Http tiene problemas con body vacío)
            $ch = curl_init("{$base}/v2/checkout/orders/{$token}/capture");
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $accessToken,
                    'Content-Type: application/json',
                    'Accept: application/json',
                ],
                CURLOPT_POSTFIELDS => '', // Body vacío explícito
            ]);
            
            $captureBody = curl_exec($ch);
            $captureStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            logger('PayPal capture response: ' . $captureStatus . ' - ' . $captureBody);

            if ($captureStatus < 200 || $captureStatus >= 300) {
                $errorMsg = 'No se pudo capturar el pago';
                $errorData = json_decode($captureBody, true);
                if (isset($errorData['details'][0]['issue'])) {
                    $errorMsg .= ': ' . $errorData['details'][0]['issue'];
                }
                logger('PayPal capture failed: ' . $captureBody);
                throw new \Exception($errorMsg);
            }

            $capture = json_decode($captureBody, true);
            $status = strtoupper($capture['status'] ?? '');

            logger('PayPal capture status: ' . $status);

            if ($status === 'COMPLETED') {
                return view('paypal-result', [
                    'success' => true,
                    'message' => '¡Pago completado! Ahora puedes volver a la app y verificar tu suscripción Premium.',
                    'orderId' => $token,
                ]);
            } else {
                return view('paypal-result', [
                    'success' => false,
                    'message' => 'El pago no se completó. Estado: ' . $status,
                    'orderId' => $token,
                ]);
            }

        } catch (\Exception $e) {
            logger('PayPal return error: ' . $e->getMessage());
            return view('paypal-result', [
                'success' => false,
                'message' => 'Error al procesar el pago: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Manejar cancelación de PayPal
     */
    public function handlePayPalCancel(Request $request)
    {
        return view('paypal-result', [
            'success' => false,
            'message' => 'Pago cancelado. Puedes volver a la app e intentar nuevamente.',
        ]);
    }
}
