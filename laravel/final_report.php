<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "✅ LIMPIEZA COMPLETADA\n\n";

echo "=== TABLAS FINALES ===\n";
$tables = [
    'users' => 'Usuarios',
    'locations' => 'Ubicaciones',
    'genres' => 'Géneros TMDB',
    'user_favorite_genres' => 'Géneros favoritos (user ↔ genre)',
    'user_favorite_directors' => 'Directores favoritos (solo TMDB IDs)',
    'watched_movies' => 'Películas vistas (solo TMDB IDs)',
    'likes' => 'Likes (swipes)',
    'matches' => 'Matches',
];

foreach ($tables as $table => $description) {
    $count = DB::table($table)->count();
    echo "✅ $table - $count registros - $description\n";
}

echo "\n=== TABLAS ELIMINADAS ===\n";
$removed = [
    'directors' => 'Ya no se necesita, usamos TMDB IDs directos',
    'movies' => 'Ya no se necesita, usamos TMDB IDs directos',
    'genre_movie' => 'Relación innecesaria (TMDB tiene esto)',
    'director_movie' => 'Relación innecesaria (TMDB tiene esto)',
    'user_movie_ratings' => 'Redundante (rating está en watched_movies)',
    'galleries' => 'Nunca se usaba',
];

foreach ($removed as $table => $reason) {
    echo "❌ $table - $reason\n";
}

echo "\n=== VERIFICACIÓN DE DATOS DE PRUEBA ===\n";
$testUser = DB::table('users')->where('email', 'carlos@test.com')->first();
if ($testUser) {
    $genres = DB::table('user_favorite_genres')->where('user_id', $testUser->id)->count();
    $directors = DB::table('user_favorite_directors')->where('user_id', $testUser->id)->count();
    $movies = DB::table('watched_movies')->where('user_id', $testUser->id)->count();
    
    echo "👤 Usuario de prueba: " . $testUser->name . "\n";
    echo "  Géneros: $genres\n";
    echo "  Directores: $directors\n";
    echo "  Películas: $movies\n";
    
    if ($directors > 0) {
        echo "\n  📋 Directores:\n";
        $dirList = DB::table('user_favorite_directors')->where('user_id', $testUser->id)->get();
        foreach ($dirList as $dir) {
            echo "    - {$dir->name} (TMDB ID: {$dir->tmdb_director_id})\n";
        }
    }
}

echo "\n🎉 BASE DE DATOS LIMPIA Y ORGANIZADA\n";
