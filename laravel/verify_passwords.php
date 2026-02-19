<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== VERIFICAR CONTRASEÑAS DE USUARIOS CLAVE ===\n\n";

$emails = [
    'zekken@gmail.com',
    'renzo@gmail.com',
    'strenght@gmail.com',
    'carlos@test.com',
    'ana@test.com',
];

foreach ($emails as $email) {
    $user = User::where('email', $email)->first();
    if ($user) {
        $hashCheck = Hash::check('password', $user->password) ? "✅ VÁLIDA" : "❌ INVÁLIDA";
        echo "{$hashCheck} - {$user->name} ({$email})\n";
        if (!Hash::check('password', $user->password)) {
            echo "   Hash actual: " . substr($user->password, 0, 50) . "...\n";
        }
    } else {
        echo "❌ NO EXISTE - {$email}\n";
    }
}

echo "\n=== PRUEBA MANUAL DE LOGIN ===\n";
$user = User::where('email', 'zekken@gmail.com')->first();
if ($user) {
    echo "Usuario encontrado: {$user->name}\n";
    echo "Password ingresada: password\n";
    echo "Hash en DB: " . substr($user->password, 0, 60) . "\n";
    echo "Hash::check resultado: " . (Hash::check('password', $user->password) ? "TRUE ✅" : "FALSE ❌") . "\n";
}
