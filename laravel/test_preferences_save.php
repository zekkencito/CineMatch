<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== VERIFICANDO GUARDADO DE PREFERENCIAS ===\n\n";

// Seleccionar usuario para probar (Ana López - ID 3)
$userId = 3;
$user = DB::table('users')->where('id', $userId)->first();

if (!$user) {
    echo "❌ Usuario no encontrado\n";
    exit;
}

echo "🧑 Usuario: {$user->name} (ID: {$userId})\n";
echo "📧 Email: {$user->email}\n\n";

// 1. Verificar GÉNEROS
echo "--- 🎭 GÉNEROS FAVORITOS ---\n";
$genres = DB::table('user_favorite_genres')
    ->join('genres', 'user_favorite_genres.genre_id', '=', 'genres.id')
    ->where('user_favorite_genres.user_id', $userId)
    ->select('genres.id', 'genres.name')
    ->get();

if ($genres->count() > 0) {
    echo "✅ {$genres->count()} géneros guardados:\n";
    foreach ($genres as $genre) {
        echo "   • {$genre->name} (ID: {$genre->id})\n";
    }
} else {
    echo "⚠️  Sin géneros guardados\n";
}

// 2. Verificar DIRECTORES
echo "\n--- 🎬 DIRECTORES FAVORITOS ---\n";
$directors = DB::table('user_favorite_directors')
    ->where('user_id', $userId)
    ->get();

if ($directors->count() > 0) {
    echo "✅ {$directors->count()} directores guardados:\n";
    foreach ($directors as $director) {
        echo "   • {$director->name} (TMDB ID: {$director->tmdb_director_id})\n";
    }
} else {
    echo "⚠️  Sin directores guardados\n";
}

// 3. Verificar PELÍCULAS VISTAS
echo "\n--- 🎥 PELÍCULAS VISTAS ---\n";
$movies = DB::table('watched_movies')
    ->where('user_id', $userId)
    ->get();

if ($movies->count() > 0) {
    echo "✅ {$movies->count()} películas guardadas:\n";
    foreach ($movies as $movie) {
        $rating = $movie->rating ? "⭐ {$movie->rating}/5" : "Sin rating";
        echo "   • {$movie->title} ({$rating}) [TMDB: {$movie->tmdb_movie_id}]\n";
    }
} else {
    echo "⚠️  Sin películas guardadas\n";
}

// 4. Verificar UBICACIÓN
echo "\n--- 📍 UBICACIÓN ---\n";
$location = DB::table('locations')
    ->where('user_id', $userId)
    ->first();

if ($location) {
    echo "✅ Ubicación guardada:\n";
    echo "   • Coordenadas: ({$location->latitude}, {$location->longitude})\n";
    echo "   • Ciudad: " . ($location->city ?? 'N/A') . "\n";
    echo "   • País: " . ($location->country ?? 'N/A') . "\n";
    echo "   • Radio búsqueda: {$location->search_radius} km\n";
} else {
    echo "⚠️  Sin ubicación guardada\n";
}

echo "\n=== RESUMEN ===\n";
echo "Géneros: {$genres->count()}\n";
echo "Directores: {$directors->count()}\n";
echo "Películas: {$movies->count()}\n";
echo "Ubicación: " . ($location ? "✓" : "✗") . "\n";

$total = $genres->count() + $directors->count() + $movies->count() + ($location ? 1 : 0);
echo "\n";
if ($total >= 4) {
    echo "✅ TODAS LAS PREFERENCIAS SE ESTÁN GUARDANDO CORRECTAMENTE\n";
} else {
    echo "⚠️  Algunas preferencias no están guardadas\n";
}
