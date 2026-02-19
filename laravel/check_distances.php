<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

echo "=== ANÁLISIS DE DISTANCIAS ===\n\n";

$currentUser = User::where('email', 'zekken@gmail.com')->with('location', 'favoriteGenres')->first();
$currentLat = $currentUser->location->latitude;
$currentLon = $currentUser->location->longitude;
$radius = $currentUser->location->search_radius;
$currentGenreIds = $currentUser->favoriteGenres->pluck('id')->toArray();

echo "Usuario: {$currentUser->name}\n";
echo "Ubicación: Lat {$currentLat}, Lon {$currentLon}\n";
echo "Radio de búsqueda: {$radius} km\n";
echo "Géneros: " . $currentUser->favoriteGenres->pluck('name')->implode(', ') . "\n\n";

echo "=== USUARIOS CERCANOS ===\n";

function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371; // km
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon/2) * sin($dLon/2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    return $earthRadius * $c;
}

$others = User::where('id', '!=', $currentUser->id)->with('location', 'favoriteGenres')->get();
$usersInRange = 0;
$usersWithCommonGenres = 0;
$usersMatching = 0;

foreach ($others as $user) {
    if (!$user->location) continue;
    
    $distance = calculateDistance(
        $currentLat, $currentLon,
        $user->location->latitude, $user->location->longitude
    );
    
    $userGenreIds = $user->favoriteGenres->pluck('id')->toArray();
    $commonGenres = array_intersect($currentGenreIds, $userGenreIds);
    $hasCommonGenre = count($commonGenres) > 0;
    
    if ($distance <= $radius) {
        $usersInRange++;
    }
    
    if ($hasCommonGenre) {
        $usersWithCommonGenres++;
    }
    
    $inRange = $distance <= $radius;
    
    if ($inRange && $hasCommonGenre) {
        $usersMatching++;
        $status = "✅ MATCH";
    } else if (!$inRange && $hasCommonGenre) {
        $status = "❌ LEJOS";
    } else if ($inRange && !$hasCommonGenre) {
        $status = "❌ SIN GÉNEROS";
    } else {
        $status = "❌ NO MATCH";
    }
    
    echo sprintf(
        "[%s] %s (ID: %d) - %.1f km - Géneros: %s\n",
        $status,
        $user->name,
        $user->id,
        $distance,
        $user->favoriteGenres->pluck('name')->implode(', ')
    );
}

echo "\n=== RESUMEN ===\n";
echo "Total otros usuarios: " . $others->count() . "\n";
echo "Dentro del radio ({$radius} km): {$usersInRange}\n";
echo "Con géneros en común: {$usersWithCommonGenres}\n";
echo "⭐ USUARIOS VÁLIDOS (cerca + géneros): {$usersMatching}\n";
