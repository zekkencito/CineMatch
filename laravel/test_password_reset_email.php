<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Usuarios registrados: " . App\Models\User::count() . PHP_EOL;
$users = App\Models\User::select('id', 'name', 'email')->limit(5)->get();
foreach ($users as $u) {
    echo $u->id . ' - ' . $u->name . ' - ' . $u->email . PHP_EOL;
}

// Probar envío de email de recuperación
$firstUser = App\Models\User::first();
if ($firstUser) {
    echo PHP_EOL . "Probando envío de email de recuperación para: " . $firstUser->email . PHP_EOL;
    try {
        $token = \Illuminate\Support\Str::random(60);
        Mail::to($firstUser->email)->send(new App\Mail\PasswordResetMail($firstUser->name, $token));
        echo "Email de recuperación enviado exitosamente!" . PHP_EOL;
    } catch (\Exception $e) {
        echo "Error al enviar email: " . $e->getMessage() . PHP_EOL;
    }
}
