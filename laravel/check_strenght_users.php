<?php
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

// Get strenght's data
$strenght = User::where('email', 'strenght@gmail.com')->with('location')->first();

if (!$strenght) {
    echo "Strenght not found\n";
    exit;
}

echo "=== STRENGHT (ID {$strenght->id}) ===\n\n";
echo "Location: {$strenght->location->city}\n";
echo "Search Radius: {$strenght->location->search_radius}km\n\n";

// Get genres
$strenghtGenres = DB::table('user_favorite_genres')
    ->where('user_id', $strenght->id)
    ->join('genres', 'user_favorite_genres.genre_id', '=', 'genres.id')
    ->pluck('genres.name')
    ->toArray();

echo "Strenght's genres: " . implode(", ", $strenghtGenres) . "\n\n";

// Get users in range
$lat = $strenght->location->latitude;
$lon = $strenght->location->longitude;
$radius = $strenght->location->search_radius;

$users = User::with(['location', 'favoriteGenres'])
    ->where('id', '!=', $strenght->id)
    ->whereHas('location')
    ->get();

// Filter by distance
$usersInRange = $users->filter(function($user) use ($lat, $lon, $radius) {
    if (!$user->location) return false;
    
    $latDistance = deg2rad($user->location->latitude - $lat);
    $lonDistance = deg2rad($user->location->longitude - $lon);
    
    $a = sin($latDistance / 2) * sin($latDistance / 2) +
         cos(deg2rad($lat)) * cos(deg2rad($user->location->latitude)) *
         sin($lonDistance / 2) * sin($lonDistance / 2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $distance = 6371 * $c;
    
    return $distance <= $radius;
});

echo "=== USERS VISIBLE TO STRENGHT ===\n\n";

foreach ($usersInRange as $user) {
    // Get user's genres
    $userGenres = DB::table('user_favorite_genres')
        ->where('user_id', $user->id)
        ->join('genres', 'user_favorite_genres.genre_id', '=', 'genres.id')
        ->pluck('genres.name')
        ->toArray();
    
    // Check for genre intersection
    $commonGenres = array_intersect($strenghtGenres, $userGenres);
    
    if (empty($commonGenres)) {
        echo "User ID {$user->id} ({$user->name}): NO COMMON GENRES - WILL BE FILTERED OUT\n\n";
        continue;
    }
    
    echo "===== USER ID {$user->id}: {$user->name} =====\n";
    echo "Data types that might cause rendering errors:\n\n";
    
    // Check each field with its type
    echo "name: ";
    var_export($user->name);
    echo " (type: " . gettype($user->name) . ")\n";
    
    echo "age: ";
    var_export($user->age);
    echo " (type: " . gettype($user->age) . ")\n";
    
    echo "bio: ";
    var_export($user->bio);
    echo " (type: " . gettype($user->bio) . ", length: " . strlen($user->bio ?? '') . ")\n";
    
    echo "profile_photo: ";
    $photoType = gettype($user->profile_photo);
    if ($photoType === 'string') {
        echo "(string, length: " . strlen($user->profile_photo) . ")\n";
    } else {
        var_export($user->profile_photo);
        echo " (type: $photoType)\n";
    }
    
    echo "\nGenres: " . count($userGenres) . " total\n";
    foreach ($userGenres as $g) {
        echo "  - ";
        var_export($g);
        echo " (type: " . gettype($g) . ")\n";
    }
    
    echo "\nCommon genres count: " . count($commonGenres) . "\n";
    echo "Common genres: " . implode(", ", $commonGenres) . "\n";
    
    echo "\n" . str_repeat("=", 80) . "\n\n";
}
