<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== VERIFICACIÓN USUARIO: strenght@gmail.com ===\n\n";

$user = User::where('email', 'strenght@gmail.com')->first();

if ($user) {
    echo "Usuario encontrado:\n";
    echo "  ID: {$user->id}\n";
    echo "  Nombre: {$user->name}\n";
    echo "  Email: {$user->email}\n";
    echo "  Password hash: " . substr($user->password, 0, 60) . "...\n";
    
    $isValid = Hash::check('password', $user->password);
    echo "\n  Hash::check('password', hash): " . ($isValid ? "✅ VÁLIDO" : "❌ INVÁLIDO") . "\n";
    
    if (!$isValid) {
        echo "\n  🔧 CORRIGIENDO CONTRASEÑA...\n";
        $user->password = Hash::make('password');
        $user->save();
        echo "  ✅ Contraseña actualizada\n";
        
        // Verificar de nuevo
        $userUpdated = User::where('email', 'strenght@gmail.com')->first();
        $isValidNow = Hash::check('password', $userUpdated->password);
        echo "  Verificación post-actualización: " . ($isValidNow ? "✅ AHORA SÍ FUNCIONA" : "❌ SIGUE FALLANDO") . "\n";
    }
} else {
    echo "❌ Usuario NO existe en la base de datos\n";
}
