<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

// TMDB API Key
$tmdbApiKey = '6bbead30a73217ca3cd601c83f85e50b';

// Get all watched movies without poster_path
$movies = DB::table('watched_movies')
    ->whereNull('poster_path')
    ->orWhere('poster_path', '')
    ->select('tmdb_movie_id', 'title')
    ->distinct()
    ->get();

echo "Found " . count($movies) . " movies without poster_path\n\n";

$updated = 0;
$failed = 0;

foreach ($movies as $movie) {
    echo "Fetching poster for: {$movie->title} (ID: {$movie->tmdb_movie_id})... ";
    
    try {
        // Fetch movie details from TMDB
        $response = Http::get("https://api.themoviedb.org/3/movie/{$movie->tmdb_movie_id}", [
            'api_key' => $tmdbApiKey,
            'language' => 'es-MX'
        ]);
        
        if ($response->successful()) {
            $data = $response->json();
            $posterPath = $data['poster_path'] ?? null;
            
            if ($posterPath) {
                // Update all records with this tmdb_movie_id
                DB::table('watched_movies')
                    ->where('tmdb_movie_id', $movie->tmdb_movie_id)
                    ->update(['poster_path' => $posterPath]);
                
                echo "✓ Updated: {$posterPath}\n";
                $updated++;
            } else {
                echo "✗ No poster available\n";
                $failed++;
            }
        } else {
            echo "✗ API Error: " . $response->status() . "\n";
            $failed++;
        }
        
        // Rate limiting - wait 250ms between requests
        usleep(250000);
        
    } catch (Exception $e) {
        echo "✗ Exception: " . $e->getMessage() . "\n";
        $failed++;
    }
}

echo "\n";
echo "=================================\n";
echo "Summary:\n";
echo "Updated: $updated movies\n";
echo "Failed: $failed movies\n";
echo "=================================\n";
