<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Genre;
use Illuminate\Support\Facades\DB;

echo "\n=== ASIGNANDO GÉNEROS A USUARIOS ===\n\n";

// Lista de usuarios sin géneros
$userIds = [27, 28, 29, 30, 31, 32, 33, 34, 35];

// Obtener géneros disponibles
$genres = Genre::all();
if ($genres->count() == 0) {
    die("❌ No hay géneros en la base de datos\n");
}

$genreIds = $genres->pluck('id')->toArray();

echo "Géneros disponibles: " . $genres->pluck('name')->implode(', ') . "\n\n";

foreach ($userIds as $userId) {
    $user = User::find($userId);
    if (!$user) {
        echo "⚠️  Usuario ID $userId no encontrado\n";
        continue;
    }
    
    // Verificar cuántos géneros tiene
    $currentGenres = $user->favoriteGenres()->count();
    
    if ($currentGenres > 0) {
        echo "✓ {$user->name} ya tiene $currentGenres géneros\n";
        continue;
    }
    
    // Asignar 3-5 géneros aleatorios
    $numGenres = rand(3, 5);
    $selectedGenres = array_rand(array_flip($genreIds), $numGenres);
    
    // Sincronizar géneros
    $user->favoriteGenres()->sync($selectedGenres);
    
    // Verificar nombres de géneros asignados
    $genreNames = Genre::whereIn('id', $selectedGenres)->pluck('name')->toArray();
    
    echo "✅ {$user->name}: Asignados $numGenres géneros (" . implode(', ', $genreNames) . ")\n";
}

echo "\n=== RESULTADOS ===\n\n";

// Verificar usuarios en Nuevo Casas Grandes con géneros
$nuevoCasasUsers = User::whereHas('location', function($q) {
    $q->where('city', 'like', '%Nuevo Casas Grandes%');
})->with('favoriteGenres')->get();

echo "Total usuarios en Nuevo Casas Grandes: " . $nuevoCasasUsers->count() . "\n";

$withGenres = 0;
$withoutGenres = 0;

foreach ($nuevoCasasUsers as $user) {
    $genreCount = $user->favoriteGenres->count();
    if ($genreCount > 0) {
        $withGenres++;
    } else {
        $withoutGenres++;
        echo "   ⚠️  {$user->name} (ID: {$user->id}) NO tiene géneros\n";
    }
}

echo "\nCon géneros: $withGenres\n";
echo "Sin géneros: $withoutGenres\n\n";

echo "✅ Ahora strenght debería ver más usuarios!\n\n";
