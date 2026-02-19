<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;

echo "=== TEST DIRECTO DEL ENDPOINT ===\n\n";

$currentUser = User::where('email', 'zekken@gmail.com')->first();
echo "Usuario actual: {$currentUser->name} (ID: {$currentUser->id})\n\n";

// Simular autenticación
auth()->login($currentUser);

// Crear request simulado
$request = Request::create('/api/users', 'GET');
$request->setUserResolver(function () use ($currentUser) {
    return $currentUser;
});

// Llamar al controlador
$controller = new UserController();
$response = $controller->getUsers($request);

$data = json_decode($response->getContent(), true);

echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
echo "Total usuarios devueltos: " . count($data['users']) . "\n\n";

if (count($data['users']) > 0) {
    echo "=== USUARIOS DEVUELTOS ===\n";
    foreach ($data['users'] as $user) {
        echo sprintf(
            "- %s (ID: %d) - Match: %d%% - Distancia: %.1f km\n",
            $user['name'],
            $user['id'],
            $user['match_percentage'],
            $user['distance'] ?? 0
        );
    }
} else {
    echo "❌ NO SE DEVOLVIERON USUARIOS\n";
    echo "\nDebug información:\n";
    echo "Users array: " . print_r($data['users'], true) . "\n";
}
