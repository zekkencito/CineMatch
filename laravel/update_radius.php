<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

$user = User::find(7);
if ($user && $user->location) {
    $oldRadius = $user->location->search_radius;
    $user->location->update(['search_radius' => 2000]);
    echo "✅ Radio actualizado: {$oldRadius} km → 2000 km para {$user->name}\n";
} else {
    echo "❌ Usuario o ubicación no encontrados\n";
}
