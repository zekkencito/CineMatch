<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "\n=== COMPARACIÓN ZEKKEN vs STRENGHT ===\n\n";

$zekken = User::find(6);
$strenght = User::find(7);

echo "ZEKKEN (ID 6):\n";
echo "-------------------\n";
echo "Nombre: " . ($zekken->name ?? 'NULL') . "\n";
echo "Email: " . ($zekken->email ?? 'NULL') . "\n";
echo "Age: " . ($zekken->age ?? 'NULL') . "\n";
echo "Bio: " . ($zekken->bio ?? 'NULL') . "\n";
echo "Profile Photo: " . ($zekken->profile_photo ?? 'NULL') . "\n";

if ($zekken->location) {
    echo "Location City: " . ($zekken->location->city ?? 'NULL') . "\n";
    echo "Location Lat: " . ($zekken->location->latitude ?? 'NULL') . "\n";
    echo "Location Lon: " . ($zekken->location->longitude ?? 'NULL') . "\n";
}

$zekkenGenres = $zekken->favoriteGenres;
echo "Géneros: " . $zekkenGenres->count() . "\n";
foreach ($zekkenGenres as $g) {
    echo "  - ID: {$g->id}, Name: " . ($g->name ?? 'NULL') . "\n";
}

$zekkenMovies = DB::table('watched_movies')
    ->where('user_id', 6)
    ->get();
echo "Películas: " . $zekkenMovies->count() . "\n";
foreach ($zekkenMovies as $m) {
    echo "  - ID: {$m->tmdb_movie_id}, Title: " . ($m->title ?? 'NULL') . ", Poster: " . ($m->poster_path ?? 'NULL') . "\n";
}

echo "\n\nSTRENGHT (ID 7):\n";
echo "-------------------\n";
echo "Nombre: " . ($strenght->name ?? 'NULL') . "\n";
echo "Email: " . ($strenght->email ?? 'NULL') . "\n";
echo "Age: " . ($strenght->age ?? 'NULL') . "\n";
echo "Bio: " . ($strenght->bio ?? 'NULL') . "\n";
echo "Profile Photo: " . ($strenght->profile_photo ?? 'NULL') . "\n";

if ($strenght->location) {
    echo "Location City: " . ($strenght->location->city ?? 'NULL') . "\n";
    echo "Location Lat: " . ($strenght->location->latitude ?? 'NULL') . "\n";
    echo "Location Lon: " . ($strenght->location->longitude ?? 'NULL') . "\n";
}

$strenghtGenres = $strenght->favoriteGenres;
echo "Géneros: " . $strenghtGenres->count() . "\n";
foreach ($strenghtGenres as $g) {
    echo "  - ID: {$g->id}, Name: " . ($g->name ?? 'NULL') . "\n";
}

$strenghtMovies = DB::table('watched_movies')
    ->where('user_id', 7)
    ->get();
echo "Películas: " . $strenghtMovies->count() . "\n";
foreach ($strenghtMovies as $m) {
    echo "  - ID: {$m->tmdb_movie_id}, Title: " . ($m->title ?? 'NULL') . ", Poster: " . ($m->poster_path ?? 'NULL') . "\n";
}

echo "\n\n=== SIMULACIÓN DE DATOS DE API ===\n\n";

// Simular lo que devuelve la API cuando Zekken ve a otros usuarios
echo "Lo que ve ZEKKEN (debe incluir a Strenght):\n";
echo "-------------------\n";

$zekkenSeenIds = DB::table('likes')->where('from_user_id', 6)->pluck('to_user_id')->toArray();
$usersForZekken = User::where('id', '!=', 6)
    ->whereNotIn('id', $zekkenSeenIds)
    ->where('id', 7) // Solo ver strenght
    ->with(['favoriteGenres', 'location'])
    ->first();

if ($usersForZekken) {
    echo "Strenght visto por Zekken:\n";
    echo "  Name: " . ($usersForZekken->name ?? 'NULL') . "\n";
    echo "  Age: " . ($usersForZekken->age ?? 'NULL') . "\n";
    echo "  Bio: " . ($usersForZekken->bio ?? 'NULL') . "\n";
    
    $movies = DB::table('watched_movies')
        ->where('user_id', 7)
        ->select('tmdb_movie_id as id', 'title', 'rating', 'poster_path')
        ->limit(10)
        ->get();
    
    echo "  Watched movies count: " . $movies->count() . "\n";
    foreach ($movies as $m) {
        echo "    - Title: " . var_export($m->title, true) . " (type: " . gettype($m->title) . ")\n";
        echo "      Poster: " . var_export($m->poster_path, true) . " (type: " . gettype($m->poster_path) . ")\n";
    }
    
    echo "  Genres count: " . $usersForZekken->favoriteGenres->count() . "\n";
    foreach ($usersForZekken->favoriteGenres as $g) {
        echo "    - Name: " . var_export($g->name, true) . " (type: " . gettype($g->name) . ")\n";
    }
}

echo "\n\nLo que ve STRENGHT (debe incluir a Gabriel y los 9 nuevos):\n";
echo "-------------------\n";

$strenghtSeenIds = DB::table('likes')->where('from_user_id', 7)->pluck('to_user_id')->toArray();
$usersForStrenght = User::where('id', '!=', 7)
    ->whereNotIn('id', $strenghtSeenIds)
    ->where('id', 25) // Solo ver Gabriel
    ->with(['favoriteGenres', 'location'])
    ->first();

if ($usersForStrenght) {
    echo "Gabriel visto por Strenght:\n";
    echo "  Name: " . ($usersForStrenght->name ?? 'NULL') . "\n";
    echo "  Age: " . ($usersForStrenght->age ?? 'NULL') . "\n";
    echo "  Bio: " . ($usersForStrenght->bio ?? 'NULL') . "\n";
    
    $movies = DB::table('watched_movies')
        ->where('user_id', 25)
        ->select('tmdb_movie_id as id', 'title', 'rating', 'poster_path')
        ->limit(10)
        ->get();
    
    echo "  Watched movies count: " . $movies->count() . "\n";
    foreach ($movies as $m) {
        echo "    - Title: " . var_export($m->title, true) . " (type: " . gettype($m->title) . ")\n";
        echo "      Poster: " . var_export($m->poster_path, true) . " (type: " . gettype($m->poster_path) . ")\n";
    }
    
    echo "  Genres count: " . $usersForStrenght->favoriteGenres->count() . "\n";
    foreach ($usersForStrenght->favoriteGenres as $g) {
        echo "    - Name: " . var_export($g->name, true) . " (type: " . gettype($g->name) . ")\n";
    }
}

echo "\n";
