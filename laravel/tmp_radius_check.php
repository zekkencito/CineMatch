<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$email = 'zekken@gmail.com';

try {
    $zekken = DB::selectOne("SELECT u.id, u.email, l.latitude, l.longitude, l.search_radius
        FROM users u
        LEFT JOIN locations l ON l.user_id = u.id
        WHERE u.email = ? LIMIT 1", [$email]);

    if (!$zekken || !$zekken->latitude || !$zekken->longitude) {
        echo json_encode(['error' => 'No se encontró ubicación válida para ' . $email], JSON_UNESCAPED_UNICODE) . "\n";
        exit(0);
    }

    $users = DB::select("SELECT u.id, u.email, l.latitude, l.longitude
        FROM users u
        JOIN locations l ON l.user_id = u.id
        WHERE u.id != ?", [$zekken->id]);

    $nearby = [];
    $lat1 = floatval($zekken->latitude);
    $lon1 = floatval($zekken->longitude);
    $radiusKm = floatval($zekken->search_radius) ?: 50;

    foreach ($users as $u) {
        if (!$u->latitude || !$u->longitude) continue;
        $lat2 = floatval($u->latitude);
        $lon2 = floatval($u->longitude);

        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;

        if ($distance <= $radiusKm) {
            $nearby[] = [
                'id' => $u->id,
                'email' => $u->email,
                'latitude' => $u->latitude,
                'longitude' => $u->longitude,
                'distance_km' => round($distance, 3)
            ];
        }
    }

    echo json_encode(['zekken' => $zekken, 'nearby_count' => count($nearby), 'nearby' => $nearby], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
