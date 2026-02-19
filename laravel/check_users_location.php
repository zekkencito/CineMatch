<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Location;

echo "\n=== VERIFICACIÓN DE USUARIOS Y UBICACIONES ===\n\n";

// Primero ver qué columnas existen
$firstUser = User::first();
if ($firstUser) {
    echo "Columnas de users:\n";
    echo implode(", ", array_keys($firstUser->getAttributes())) . "\n\n";
}

$totalUsers = User::count();
$totalLocations = Location::count();
echo "Total de usuarios: $totalUsers\n";
echo "Total de ubicaciones: $totalLocations\n";
echo "Usuarios SIN ubicación: " . ($totalUsers - $totalLocations) . "\n\n";

// Obtener ubicaciones de Nuevo Casas Grandes
$nuevoCasasLocations = Location::where('city', 'like', '%Nuevo Casas Grandes%')
    ->orWhere('city', 'like', '%Casas Grandes%')
    ->get();

echo "Ubicaciones en Nuevo Casas Grandes: " . $nuevoCasasLocations->count() . "\n\n";

if ($nuevoCasasLocations->count() > 0) {
    echo "Usuarios en Nuevo Casas Grandes:\n";
    echo str_repeat("-", 100) . "\n";
    foreach ($nuevoCasasLocations as $location) {
        $user = $location->user;
        if ($user) {
            echo sprintf(
                "ID: %-3d | %-20s | %-30s\n",
                $user->id,
                $user->name,
                $user->email
            );
            echo sprintf(
                "        Ubicación: %s (Lat: %.6f, Lon: %.6f)\n",
                $location->city,
                $location->latitude ?? 0,
                $location->longitude ?? 0
            );
            echo "\n";
        }
    }
} else {
    echo "⚠️  NO HAY USUARIOS EN NUEVO CASAS GRANDES\n";
    echo "Mostrando todas las ubicaciones existentes:\n\n";
    foreach (Location::all() as $location) {
        $user = $location->user;
        echo sprintf(
            "User ID %d (%s): %s - Lat: %.6f, Lon: %.6f\n",
            $location->user_id,
            $user ? $user->name : 'N/A',
            $location->city ?? 'Sin ciudad',
            $location->latitude ?? 0,
            $location->longitude ?? 0
        );
    }
}

echo "\n";
