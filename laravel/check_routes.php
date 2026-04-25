<?php
// Script para verificar rutas de Laravel
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Obtener rutas
$routes = $kernel->call('route:list');

echo "<pre>";
echo $routes;
echo "</pre>";

// Buscar específicamente las rutas que necesitamos
$apiRoutes = [
    'POST /api/movie-forum/movies/{movieId}/rating',
    'POST /api/movie-forum/movies/{movieId}/reviews'
];

echo "<h2>Rutas API necesarias:</h2>";
foreach ($apiRoutes as $route) {
    echo "<p>Buscando: $route</p>";
}
?>
