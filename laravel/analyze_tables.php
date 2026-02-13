<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$tables = [
    'users',
    'locations',
    'genres',
    'user_favorite_genres',
    'directors',
    'user_favorite_directors',
    'movies',
    'watched_movies',
    'genre_movie',
    'director_movie',
    'user_movie_ratings'
];

echo "=== ANÁLISIS DE TABLAS ===\n\n";

foreach ($tables as $table) {
    if (Schema::hasTable($table)) {
        $count = DB::table($table)->count();
        echo "✅ $table - $count registros\n";
        
        $columns = DB::select("SHOW COLUMNS FROM $table");
        echo "   Columnas: ";
        $colNames = array_map(function($col) { return $col->Field; }, $columns);
        echo implode(', ', $colNames) . "\n\n";
    } else {
        echo "❌ $table - NO EXISTE\n\n";
    }
}

echo "\n=== ANÁLISIS DE USO ===\n\n";

// Verificar si se usan las tablas 'directors' y 'movies'
$directorsUsage = DB::table('directors')->count();
$moviesUsage = DB::table('movies')->count();

echo "📋 Tabla 'directors': $directorsUsage registros\n";
echo "📋 Tabla 'movies': $moviesUsage registros\n";
echo "📋 Tabla 'user_favorite_directors': " . DB::table('user_favorite_directors')->count() . " registros\n";
echo "📋 Tabla 'watched_movies': " . DB::table('watched_movies')->count() . " registros\n\n";

echo "💡 CONCLUSIÓN:\n";
if ($directorsUsage == 0 && $moviesUsage == 0) {
    echo "❌ Las tablas 'directors' y 'movies' están VACÍAS y NO se están usando\n";
    echo "✅ En su lugar se usa 'user_favorite_directors' y 'watched_movies' con TMDB IDs directos\n";
    echo "📝 ESTAS TABLAS SON INNECESARIAS Y CAUSAN CONFUSIÓN\n";
} else {
    echo "⚠️  Las tablas 'directors' y 'movies' tienen datos pero puede que sean redundantes\n";
}
