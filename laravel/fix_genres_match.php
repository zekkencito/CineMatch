<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Genre;
use Illuminate\Support\Facades\DB;

echo "\n=== VERIFICANDO GÉNEROS DE USUARIOS ===\n\n";

// Géneros de strenght
$strenght = User::find(7);
$strenghtGenres = $strenght->favoriteGenres->pluck('name', 'id')->toArray();

echo "Géneros de Strenght:\n";
foreach ($strenghtGenres as $id => $name) {
    echo "   ID $id: $name\n";
}
echo "\n";

// Usuarios sin match
$userIds = [27, 28, 29, 30, 31, 32, 33, 34, 35];

echo "=== COMPARACIÓN ===\n\n";

foreach ($userIds as $userId) {
    $user = User::find($userId);
    if (!$user) continue;
    
    $userGenres = $user->favoriteGenres->pluck('name', 'id')->toArray();
    $commonIds = array_intersect_key($strenghtGenres, $userGenres);
    
    echo "{$user->name} (ID: $userId):\n";
    echo "   Géneros: " . implode(', ', $userGenres) . "\n";
    echo "   En común con Strenght: " . (count($commonIds) > 0 ? implode(', ', $commonIds) : "NINGUNO") . "\n";
    
    if (count($commonIds) == 0) {
        // Asignar 3-4 géneros de strenght
        $strenghtGenreIds = array_keys($strenghtGenres);
        $numToAssign = rand(3, 4);
        $selectedGenreIds = array_rand(array_flip($strenghtGenreIds), $numToAssign);
        
        // Sincronizar (reemplazar todos)
        $user->favoriteGenres()->sync($selectedGenreIds);
        
        $newGenres = Genre::whereIn('id', $selectedGenreIds)->pluck('name')->toArray();
        echo "   ✅ REASIGNADOS: " . implode(', ', $newGenres) . "\n";
    } else {
        echo "   ✓ Ya tiene géneros en común\n";
    }
    
    echo "\n";
}

echo "=== VERIFICACIÓN FINAL ===\n\n";

// Ejecutar diagnóstico de nuevo
$strenght = User::find(7);
$lat = $strenght->location->latitude;
$lon = $strenght->location->longitude;
$radius = $strenght->location->search_radius;

$seenUsers = DB::table('likes')
    ->where('from_user_id', 7)
    ->pluck('to_user_id')
    ->toArray();

$allUsers = User::whereIn('id', $userIds)
    ->with(['location', 'favoriteGenres'])
    ->get();

$canSee = 0;

foreach ($allUsers as $user) {
    if (in_array($user->id, $seenUsers)) continue;
    
    $strenghtGenreIds = $strenght->favoriteGenres->pluck('id')->toArray();
    $userGenreIds = $user->favoriteGenres->pluck('id')->toArray();
    $common = array_intersect($strenghtGenreIds, $userGenreIds);
    
    if (count($common) > 0) {
        $canSee++;
        echo "✅ {$user->name} - Strenght lo verá (" . count($common) . " géneros en común)\n";
    } else {
        echo "❌ {$user->name} - NO se verá\n";
    }
}

echo "\n";
echo "Total de nuevos usuarios que Strenght podrá ver: $canSee\n";
echo "Más Gabriel (ID 25) que ya podía ver = " . ($canSee + 1) . " usuarios nuevos\n\n";
