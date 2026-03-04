<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
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
                'started_at' => $subscription->start_date,
                'expires_at' => $subscription->end_date,
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

        logger('upgradeToPremium - User: ' . Auth::id() . ' | Duration: ' . $duration . ' | Payment data: ' . json_encode($payment));

        $paid = false;
        if ($payment && (env('PAYPAL_CLIENT_ID') || env('PAYPAL_SECRET'))) {
            // Intentar una verificación ligera con PayPal Orders API (sandbox/production según env)
            try {
                $orderId = $payment['orderID'] ?? $payment['id'] ?? null;
                logger('upgradeToPremium - OrderID received: ' . $orderId);
                
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
                            logger('upgradeToPremium - Checking order: ' . $orderId);
                            $orderResp = \Illuminate\Support\Facades\Http::withToken($access)
                                ->get("{$base}/v2/checkout/orders/{$orderId}");

                            logger('upgradeToPremium - Order check response: ' . $orderResp->status() . ' - ' . $orderResp->body());

                            if ($orderResp->ok()) {
                                $order = $orderResp->json();
                                // Considerar pagado si status es COMPLETED or APPROVED
                                $status = strtoupper($order['status'] ?? '');
                                logger('upgradeToPremium - Order status: ' . $status);
                                
                                if (in_array($status, ['COMPLETED', 'APPROVED'])) {
                                    $paid = true;
                                    logger('upgradeToPremium - Payment VERIFIED for user ' . Auth::id());
                                } else {
                                    logger('upgradeToPremium - Payment NOT verified. Status: ' . $status);
                                }
                            } else {
                                logger('upgradeToPremium - Order check failed: ' . $orderResp->status());
                            }
                        } else {
                            logger('upgradeToPremium - No access token received');
                        }
                    } else {
                        logger('upgradeToPremium - Token request failed: ' . $tokenResp->status());
                    }
                } else {
                    logger('upgradeToPremium - No orderID provided');
                }
            } catch (\Exception $e) {
                // Registrar pero no bloquear: en dev local puede no verificarse
                logger('upgradeToPremium - PayPal verification exception: ' . $e->getMessage());
            }
        } else {
            logger('upgradeToPremium - No payment data or PayPal not configured');
            // Si no se proporciona pago, en entorno local permitimos la actualización (simulación)
            $paid = app()->environment('local') || app()->environment('testing');
        }

        logger('upgradeToPremium - Paid status: ' . ($paid ? 'YES' : 'NO'));

        logger('upgradeToPremium - Paid status: ' . ($paid ? 'YES' : 'NO'));

        if (!$paid) {
            logger('upgradeToPremium - Payment verification FAILED for user ' . Auth::id());
            return response()->json([
                'success' => false,
                'message' => 'Payment not verified',
            ], 402);
        }

        // Actualizar a premium
        logger('upgradeToPremium - Upgrading user ' . Auth::id() . ' to premium for ' . $duration . ' days');
        $subscription->upgradeToPremium($duration);
        logger('upgradeToPremium - Successfully upgraded user ' . Auth::id() . ' to premium');

        return response()->json([
            'success' => true,
            'message' => '¡Felicidades! Ahora eres usuario Premium',
            'subscription' => [
                'plan' => $subscription->plan,
                'status' => $subscription->status,
                'expires_at' => $subscription->end_date,
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
            'expires_at' => $subscription->end_date
        ]);
    }

    /**
     * Obtener información de planes disponibles
     */
    public function getPlans()
    {
        $dbPlans = SubscriptionPlan::all();

        // Construir respuesta con planes de la BD
        $plans = [];
        foreach ($dbPlans as $plan) {
            $key = strtolower($plan->name);

            // Generar features dinámicamente basado en los campos del plan
            $features = [];
            if ($plan->daily_likes > 0 && $plan->daily_likes < 999) {
                $features[] = "Hasta {$plan->daily_likes} likes por día";
            } elseif ($plan->daily_likes >= 999) {
                $features[] = '❤️ Likes ilimitados';
            }
            if ($plan->see_who_liked) {
                $features[] = '💫 Ver quién te dio like';
            }
            if ($plan->advanced_filters) {
                $features[] = '🎬 Filtros avanzados';
            }
            if ($plan->price <= 0) {
                $features[] = 'Funcionalidades básicas';
            } else {
                $features[] = '🌍 Radio extendido';
                $features[] = '⏮️ Deshacer swipes';
                $features[] = '🌟 Perfil destacado';
            }

            $plans[$key] = [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => (float) $plan->price,
                'daily_likes' => $plan->daily_likes,
                'duration_days' => $plan->duration_days,
                'see_who_liked' => $plan->see_who_liked,
                'advanced_filters' => $plan->advanced_filters,
                'features' => $features,
            ];
        }

        // Si no hay planes en la BD, devolver defaults
        if (empty($plans)) {
            $plans = [
                'basic' => [
                    'name' => 'Basic',
                    'price' => 0,
                    'features' => [
                        'Hasta 10 likes por día',
                        'Funcionalidades básicas',
                    ]
                ],
            ];
        }

        return response()->json([
            'success' => true,
            'plans' => $plans
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

        // Obtener precio del plan premium desde la BD
        $premiumPlan = SubscriptionPlan::where('price', '>', 0)->orderBy('price', 'asc')->first();
        if (!$premiumPlan) {
            return response()->json(['success' => false, 'message' => 'No se encontró un plan premium en la base de datos'], 404);
        }
        $pricePerMonth = (float) $premiumPlan->price;
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

            // Obtener el ID del usuario autenticado para incluirlo en el return URL
            $userId = Auth::id();
            
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
                    'return_url' => url("/paypal/return?userId={$userId}"),
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
        $userId = $request->query('userId');

        logger('PayPal return - Token: ' . $token . ' | PayerID: ' . $payerId . ' | UserID: ' . $userId);

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
                // Si tenemos userId, actualizar la suscripción directamente aquí
                if ($userId) {
                    logger('PayPal - Upgrading user ' . $userId . ' to premium after successful payment');
                    try {
                        $user = \App\Models\User::find($userId);
                        if ($user) {
                            $subscription = $user->subscription;
                            if (!$subscription) {
                                $subscription = \App\Models\Subscription::create([
                                    'user_id' => $user->id,
                                ]);
                            }
                            $subscription->upgradeToPremium(30);
                            logger('PayPal - User ' . $userId . ' successfully upgraded to premium');
                        }
                    } catch (\Exception $e) {
                        logger('PayPal - Error upgrading user: ' . $e->getMessage());
                    }
                }
                
                return view('paypal-result', [
                    'success' => true,
                    'message' => '¡Pago completado! Ya eres usuario Premium. Puedes cerrar esta ventana y volver a la app.',
                    'orderId' => $token,
                    'deepLink' => "cinematch://payment/return?orderId={$token}&status=success",
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
