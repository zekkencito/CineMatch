<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "═══════════════════════════════════════════════════════\n";
echo "     REPARAR CONTRASEÑAS Y EJECUTAR TESTUSERSSEEDER     \n";
echo "═══════════════════════════════════════════════════════\n\n";

// 1. Arreglar contraseñas de usuarios existentes
echo "📝 Paso 1: Arreglando contraseñas de usuarios existentes...\n\n";

$users = User::all();
$fixed = 0;

foreach ($users as $user) {
    // Si la contraseña no es un hash bcrypt válido, hashearla
    if (!Hash::check('password', $user->password)) {
        $user->password = Hash::make('password');
        $user->save();
        echo "✅ Contraseña arreglada para: {$user->email}\n";
        $fixed++;
    }
}

echo "\n💚 $fixed contraseñas arregladas\n\n";

// 2. Ejecutar TestUsersSeeder para crear usuarios en Nuevo Casas Grandes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📝 Paso 2: Creando usuarios de prueba en Nuevo Casas Grandes...\n\n";

// Primero, eliminar usuarios de prueba antiguos si existen
$testEmails = [
    'maria@test.com', 'carlos@test.com', 'ana@test.com', 'roberto@test.com',
    'laura@test.com', 'diego@test.com', 'sofia@test.com', 'pedro@test.com',
    'valentina@test.com', 'javier@test.com', 'isabella@test.com', 'lucas@test.com',
    'camila@test.com', 'mateo@test.com', 'martina@test.com', 'santiago@test.com',
    'lucia@test.com', 'nicolas@test.com', 'emma@test.com', 'alejandro@test.com'
];

DB::table('users')->whereIn('email', $testEmails)->delete();
echo "🗑️  Usuarios de prueba antiguos eliminados\n";

// Ejecutar el seeder
try {
    Artisan::call('db:seed', ['--class' => 'TestUsersSeeder', '--force' => true]);
    echo "✅ TestUsersSeeder ejecutado exitosamente\n\n";
} catch (\Exception $e) {
    echo "❌ Error ejecutando seeder: " . $e->getMessage() . "\n\n";
}

// 3. Verificar resultados
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📊 RESULTADOS FINALES\n\n";

$totalUsers = User::count();
$nuevoCasasGrandesUsers = User::whereHas('location', function($q) {
    $q->whereBetween('latitude', [29.5, 31.5])
      ->whereBetween('longitude', [-109, -107]);
})->count();

echo "Total de usuarios: $totalUsers\n";
echo "Usuarios en Nuevo Casas Grandes: $nuevoCasasGrandesUsers\n\n";

// Mostrar algunos usuarios de Nuevo Casas Grandes
$ncgUsers = User::whereHas('location', function($q) {
    $q->whereBetween('latitude', [29.5, 31.5])
      ->whereBetween('longitude', [-109, -107]);
})->with('location')->take(10)->get();

echo "👥 Usuarios en Nuevo Casas Grandes (muestra):\n";
foreach ($ncgUsers as $user) {
    $hashOk = Hash::check('password', $user->password) ? "✅" : "❌";
    echo "   $hashOk {$user->name} ({$user->email})\n";
}

echo "\n🎉 ¡Listo! Ahora puedes hacer login con:\n";
echo "   Email: zekken@gmail.com o cualquier email de arriba\n";
echo "   Password: password\n\n";
