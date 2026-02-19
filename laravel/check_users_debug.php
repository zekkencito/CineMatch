<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

echo "=== DIAGNÓSTICO DE USUARIOS ===\n\n";

// 1. Usuario actual
$currentUser = User::where('email', 'zekken@gmail.com')->with('location', 'favoriteGenres')->first();
if ($currentUser) {
    echo "Usuario actual: {$currentUser->name} (ID: {$currentUser->id})\n";
    
    // Ubicación
    if ($currentUser->location) {
        echo "Ubicación: Lat: {$currentUser->location->latitude}, Lon: {$currentUser->location->longitude}, Radio: {$currentUser->location->search_radius} km\n";
    } else {
        echo "❌ NO TIENE UBICACIÓN\n";
    }
    
    // Géneros
    $genreNames = $currentUser->favoriteGenres->pluck('name')->toArray();
    echo "Géneros ({$currentUser->favoriteGenres->count()}): " . implode(', ', $genreNames) . "\n";
} else {
    echo "❌ Usuario no encontrado\n";
}

echo "\n=== ESTADÍSTICAS GENERALES ===\n";
$totalUsers = User::count();
$usersWithLocation = User::whereHas('location')->count();
$usersWithGenres = User::whereHas('favoriteGenres')->count();
$otherUsers = User::where('email', '!=', 'zekken@gmail.com')->count();

echo "Total usuarios: {$totalUsers}\n";
echo "Otros usuarios (no incluye zekken): {$otherUsers}\n";
echo "Con ubicación: {$usersWithLocation}\n";
echo "Con géneros: {$usersWithGenres}\n";

echo "\n=== OTROS USUARIOS ===\n";
$others = User::where('email', '!=', 'zekken@gmail.com')->with('location', 'favoriteGenres')->get();
foreach ($others as $user) {
    echo "\n{$user->name} (ID: {$user->id})\n";
    echo "  Ubicación: " . ($user->location ? "✓ (Radio: {$user->location->search_radius} km)" : "❌ NO") . "\n";
    echo "  Géneros: " . ($user->favoriteGenres->count() > 0 ? "✓ ({$user->favoriteGenres->count()})" : "❌ NO") . "\n";
    if ($user->favoriteGenres->count() > 0) {
        echo "    " . $user->favoriteGenres->pluck('name')->implode(', ') . "\n";
    }
}
