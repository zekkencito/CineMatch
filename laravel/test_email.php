<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    Mail::raw('Test de email de CineMatch', function($message) {
        $message->to('test@cinematch.com')->subject('Test');
    });
    echo "Email enviado con éxito\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
