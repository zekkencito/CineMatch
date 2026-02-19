<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;

echo "=== TEST ENDPOINT STRENGHT ===\n\n";

$currentUser = User::where('email', 'strenght@gmail.com')->first();
echo "Usuario: {$currentUser->name} (ID: {$currentUser->id})\n\n";

// Simular autenticación
auth()->login($currentUser);

// Crear request
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
            "- %s (ID: %d) - Match: %d%% - %.1f km\n",
            $user['name'],
            $user['id'],
            $user['match_percentage'],
            $user['distance'] ?? 0
        );
    }
} else {
    echo "❌ NO SE DEVOLVIERON USUARIOS\n";
}
