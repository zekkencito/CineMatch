<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "=== DIAGNÓSTICO CUENTA STRENGHT ===\n\n";

$user = User::where('email', 'strenght@gmail.com')->with('location', 'favoriteGenres')->first();

if (!$user) {
    echo "❌ Usuario no encontrado\n";
    exit;
}

echo "Usuario: {$user->name} (ID: {$user->id})\n";

// Ubicación
if ($user->location) {
    echo "Ubicación: Lat {$user->location->latitude}, Lon {$user->location->longitude}\n";
    echo "⚠️  Radio de búsqueda: {$user->location->search_radius} km\n";
} else {
    echo "❌ NO TIENE UBICACIÓN\n";
}

// Géneros
$genreNames = $user->favoriteGenres->pluck('name')->toArray();
echo "Géneros ({$user->favoriteGenres->count()}): " . implode(', ', $genreNames) . "\n\n";

// Likes dados
$likes = DB::table('likes')->where('from_user_id', $user->id)->get();
echo "=== USUARIOS YA VISTOS ===\n";
echo "Total: {$likes->count()}\n\n";

if ($likes->count() > 0) {
    foreach ($likes as $like) {
        $targetUser = User::find($like->to_user_id);
        echo sprintf(
            "  %s %s (ID: %d)\n",
            $like->type === 'like' ? '👍' : '👎',
            $targetUser ? $targetUser->name : "Usuario {$like->to_user_id}",
            $like->to_user_id
        );
    }
}

$seenIds = $likes->pluck('to_user_id')->toArray();

// Calcular usuarios disponibles
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371;
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon/2) * sin($dLon/2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    return $earthRadius * $c;
}

echo "\n=== USUARIOS DISPONIBLES ===\n";

$currentGenreIds = $user->favoriteGenres->pluck('id')->toArray();
$others = User::where('id', '!=', $user->id)
    ->whereNotIn('id', $seenIds)
    ->with('location', 'favoriteGenres')
    ->get();

$available = 0;
$radius = $user->location->search_radius;

foreach ($others as $other) {
    if (!$other->location) continue;
    
    $distance = calculateDistance(
        $user->location->latitude,
        $user->location->longitude,
        $other->location->latitude,
        $other->location->longitude
    );
    
    $otherGenreIds = $other->favoriteGenres->pluck('id')->toArray();
    $commonGenres = array_intersect($currentGenreIds, $otherGenreIds);
    
    $inRange = $distance <= $radius;
    $hasCommonGenres = count($commonGenres) > 0;
    
    if ($inRange && $hasCommonGenres) {
        $available++;
        echo sprintf(
            "  ✅ %s (ID: %d) - %.1f km - Géneros: %s\n",
            $other->name,
            $other->id,
            $distance,
            $other->favoriteGenres->pluck('name')->implode(', ')
        );
    }
}

echo "\n=== RESUMEN ===\n";
echo "⭐ Usuarios disponibles para ver: {$available}\n";
echo "⚠️  Problema: Radio de búsqueda muy pequeño ({$radius} km)\n";
echo "💡 Solución: Aumentar el radio de búsqueda\n";
