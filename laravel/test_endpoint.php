<?php
// Script para probar si el endpoint de calificación funciona
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Probar si el modelo Movie existe
try {
    $movieCount = \App\Models\Movie::count();
    echo "Modelo Movie funciona. Total películas: $movieCount<br>";
} catch (Exception $e) {
    echo "Error en modelo Movie: " . $e->getMessage() . "<br>";
}

// Probar si hay películas con tmdb_movie_id
try {
    $tmdbMovies = \App\Models\Movie::whereNotNull('tmdb_movie_id')->count();
    echo "Películas con tmdb_movie_id: $tmdbMovies<br>";
} catch (Exception $e) {
    echo "Error al buscar tmdb_movie_id: " . $e->getMessage() . "<br>";
}

// Probar búsqueda específica
try {
    $movie = \App\Models\Movie::where('tmdb_movie_id', 42640)->first();
    if ($movie) {
        echo "Película TMDB 42640 encontrada: " . $movie->title . "<br>";
    } else {
        echo "Película TMDB 42640 NO encontrada<br>";
    }
} catch (Exception $e) {
    echo "Error al buscar película específica: " . $e->getMessage() . "<br>";
}

// Probar búsqueda por ID normal
try {
    $movie = \App\Models\Movie::find(42640);
    if ($movie) {
        echo "Película ID 42640 encontrada: " . $movie->title . "<br>";
    } else {
        echo "Película ID 42640 NO encontrada<br>";
    }
} catch (Exception $e) {
    echo "Error al buscar por ID: " . $e->getMessage() . "<br>";
}

echo "<br>Diagnóstico completado.";
?>
