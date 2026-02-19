<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'maria@test.com')->first();
if ($user) {
    $user->password = Hash::make('password');
    $user->save();
    echo "✅ Contraseña de María García arreglada\n";
} else {
    echo "❌ Usuario no encontrado\n";
}
