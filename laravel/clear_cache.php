<?php
// Script para limpiar cache de Laravel
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Limpiar caches
$kernel->call('cache:clear');
$kernel->call('config:clear');
$kernel->call('route:clear');
$kernel->call('view:clear');

echo "Cache limpiada correctamente!";
?>
