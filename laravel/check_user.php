<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

$user = User::where('email', 'hola@gmail')->first();

if (!$user) {
    echo "❌ Usuario hola@gmail no encontrado\n";
    exit;
}

echo "=== DIAGNÓSTICO DE MATCHING ===\n\n";
echo "👤 Usuario: {$user->name} ({$user->email})\n";
echo "📍 Ubicación: {$user->location->latitude}, {$user->location->longitude} ({$user->location->city})\n";
echo "🔍 Radio de búsqueda: {$user->location->search_radius}km ⚠️\n\n";

// Calcular distancias con usuarios de prueba
$testUsers = User::whereIn('email', ['carlos@test.com', 'ana@test.com', 'roberto@test.com', 'laura@test.com', 'diego@test.com', 'sofia@test.com'])
    ->with(['favoriteGenres', 'location'])
    ->get();

echo "=== USUARIOS DE PRUEBA Y DISTANCIAS ===\n\n";

$lat1 = $user->location->latitude;
$lon1 = $user->location->longitude;
$radius = $user->location->search_radius;

foreach ($testUsers as $testUser) {
    if (!$testUser->location) {
        echo "{$testUser->name}: SIN UBICACIÓN\n";
        continue;
    }
    
    $lat2 = $testUser->location->latitude;
    $lon2 = $testUser->location->longitude;
    
    // Fórmula de Haversine
    $earthRadius = 6371;
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon/2) * sin($dLon/2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    $distance = $earthRadius * $c;
    
    $inRange = $distance <= $radius ? "✅ DENTRO" : "❌ FUERA";
    $genres = $testUser->favoriteGenres->pluck('name')->take(3)->implode(', ');
    
    echo "{$testUser->name} ({$testUser->location->city}):\n";
    echo "  📏 Distancia: " . round($distance, 1) . "km $inRange del radio de {$radius}km\n";
    echo "  🎬 Géneros: $genres\n\n";
}

echo "\n💡 PROBLEMA ENCONTRADO:\n";
echo "❌ El radio de búsqueda es de {$radius}km\n";
echo "❌ Los usuarios de prueba están entre 55-133km de distancia\n";
echo "📝 SOLUCIÓN: Aumentar el radio de búsqueda a 160km\n\n";

echo "🔧 Actualizando radio de búsqueda a 160km...\n";
$user->location->update(['search_radius' => 160]);
echo "✅ Radio actualizado a 160km\n\n";

echo "📊 VERIFICANDO AHORA...\n";
$radius = 160;
$inRangeCount = 0;

foreach ($testUsers as $testUser) {
    if (!$testUser->location) continue;
    
    $lat2 = $testUser->location->latitude;
    $lon2 = $testUser->location->longitude;
    
    $earthRadius = 6371;
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon/2) * sin($dLon/2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    $distance = $earthRadius * $c;
    
    if ($distance <= $radius) {
        $inRangeCount++;
        echo "✅ {$testUser->name} - " . round($distance, 1) . "km\n";
    }
}

echo "\n🎉 Total de usuarios compatibles ahora: $inRangeCount\n";
