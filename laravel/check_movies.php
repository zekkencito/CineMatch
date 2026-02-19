<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CHECKING WATCHED_MOVIES FOR NULL TITLES ===\n\n";

// Check for NULL or empty titles in watched_movies
$moviesWithNullTitle = DB::table('watched_movies')
    ->whereNull('title')
    ->orWhere('title', '')
    ->get();

echo "Movies with NULL or empty title: " . count($moviesWithNullTitle) . "\n\n";

if (count($moviesWithNullTitle) > 0) {
    echo "PROBLEMATIC MOVIES:\n";
    foreach ($moviesWithNullTitle as $movie) {
        echo "  User ID: {$movie->user_id}, TMDB ID: {$movie->tmdb_movie_id}, Title: ";
        var_export($movie->title);
        echo " (type: " . gettype($movie->title) . ")\n";
    }
}

echo "\n=== CHECKING ALL MOVIES FOR USER 7 (STRENGHT) ===\n\n";

$strenghtMovies = DB::table('watched_movies')
    ->where('user_id', 7)
    ->get();

echo "Strenght has " . count($strenghtMovies) . " movies\n\n";

foreach ($strenghtMovies as $movie) {
    echo "Movie ID: {$movie->tmdb_movie_id}\n";
    echo "  Title: ";
    var_export($movie->title);
    echo " (type: " . gettype($movie->title) . ")\n";
    echo "  Rating: ";
    var_export($movie->rating);
    echo " (type: " . gettype($movie->rating) . ")\n\n";
}
