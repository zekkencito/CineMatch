<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== AGREGANDO PELÍCULAS A USUARIOS ===\n\n";

// Películas populares de TMDB para agregar
$movies = [
    ['id' => 24, 'title' => 'Kill Bill: Vol. 1'],
    ['id' => 38055, 'title' => 'Megamente'],
    ['id' => 157336, 'title' => 'Interestelar'],
    ['id' => 550, 'title' => 'Fight Club'],
    ['id' => 155, 'title' => 'The Dark Knight'],
    ['id' => 13, 'title' => 'Forrest Gump'],
    ['id' => 278, 'title' => 'The Shawshank Redemption'],
    ['id' => 680, 'title' => 'Pulp Fiction'],
];

// Usuarios a los que agregar películas (excluyendo Zekken y Strenght)
$userIds = DB::table('users')
    ->whereNotIn('email', ['zekken@gmail.com', 'strenght@gmail.com'])
    ->pluck('id')
    ->toArray();

echo "Agregando películas a " . count($userIds) . " usuarios...\n\n";

$totalAdded = 0;

foreach ($userIds as $userId) {
    $user = DB::table('users')->where('id', $userId)->first();
    echo "Usuario {$user->name} (ID: {$userId}):\n";
    
    // Cada usuario tendrá entre 1 y 4 películas aleatorias
    $numMovies = rand(1, 4);
    $selectedMovies = array_rand($movies, $numMovies);
    
    if (!is_array($selectedMovies)) {
        $selectedMovies = [$selectedMovies];
    }
    
    foreach ($selectedMovies as $movieIndex) {
        $movie = $movies[$movieIndex];
        
        // Verificar si ya existe
        $exists = DB::table('watched_movies')
            ->where('user_id', $userId)
            ->where('tmdb_movie_id', $movie['id'])
            ->exists();
        
        if (!$exists) {
            $rating = rand(3, 5);
            DB::table('watched_movies')->insert([
                'user_id' => $userId,
                'tmdb_movie_id' => $movie['id'],
                'title' => $movie['title'],
                'rating' => $rating,
                'watched_date' => now()->toDateString()
            ]);
            echo "  ✅ {$movie['title']} (rating: {$rating})\n";
            $totalAdded++;
        } else {
            echo "  ⏭️  {$movie['title']} (ya existe)\n";
        }
    }
    
    echo "\n";
}

echo "=== FINALIZADO ===\n";
echo "Total películas agregadas: {$totalAdded}\n";
