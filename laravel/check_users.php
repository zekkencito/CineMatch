<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "═══════════════════════════════════════════════════════\n";
echo "           USUARIOS DE PRUEBA EN LA BASE DE DATOS       \n";
echo "═══════════════════════════════════════════════════════\n\n";

$users = User::with('location')->get();

if ($users->count() === 0) {
    echo "⚠️  NO HAY USUARIOS EN LA BASE DE DATOS\n\n";
    echo "Ejecuta: php artisan db:seed --class=TestUsersSeeder\n\n";
    exit;
}

echo "Total de usuarios: " . $users->count() . "\n\n";

foreach ($users as $user) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "👤 " . $user->name . "\n";
    echo "   📧 Email: " . $user->email . "\n";
    echo "   🔐 Password: password\n";
    echo "   🎂 Edad: " . ($user->age ?? 'N/A') . "\n";
    
    if ($user->location) {
        echo "   📍 Ubicación: " . ($user->location->city ?? 'N/A') . ", " . ($user->location->country ?? 'N/A') . "\n";
        echo "      Coordenadas: " . $user->location->latitude . ", " . $user->location->longitude . "\n";
        echo "      Radio: " . $user->location->search_radius . " km\n";
    } else {
        echo "   ⚠️  Sin ubicación\n";
    }
    
    // Verificar que la contraseña funciona
    $passwordWorks = Hash::check('password', $user->password);
    echo "   " . ($passwordWorks ? "✅" : "❌") . " Password hash válido\n";
    
    echo "\n";
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

echo "🔑 CREDENCIALES PARA LOGIN:\n";
echo "   Email: cualquier email de arriba\n";
echo "   Password: password (para todos)\n\n";

// Verificar usuarios en Nuevo Casas Grandes
$nuevoCasasGrandesUsers = User::whereHas('location', function($q) {
    $q->whereBetween('latitude', [29.5, 31.5])
      ->whereBetween('longitude', [-109, -107]);
})->count();

echo "📍 Usuarios en Nuevo Casas Grandes, Chihuahua: $nuevoCasasGrandesUsers\n\n";
