<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

$email = 'strenght@gmail.com';
$user = User::where('email', $email)->with(['location', 'favoriteGenres'])->first();

if (!$user) {
    die("\n❌ Usuario $email no encontrado\n");
}

echo "\n=== DIAGNÓSTICO DE strenght@gmail.com ===\n\n";
echo "ID: {$user->id}\n";
echo "Nombre: {$user->name}\n";
echo "Email: {$user->email}\n\n";

// Ubicación
if ($user->location) {
    echo "📍 Ubicación:\n";
    echo "   Ciudad: {$user->location->city}\n";
    echo "   Latitud: {$user->location->latitude}\n";
    echo "   Longitud: {$user->location->longitude}\n";
    echo "   Radio de búsqueda: {$user->location->search_radius} km\n\n";
} else {
    echo "⚠️  NO tiene ubicación configurada\n\n";
}

// Géneros favoritos
$genres = $user->favoriteGenres;
echo "🎬 Géneros favoritos: " . $genres->count() . "\n";
if ($genres->count() > 0) {
    foreach ($genres as $genre) {
        echo "   - {$genre->name}\n";
    }
} else {
    echo "   ❌ NO TIENE GÉNEROS CONFIGURADOS - Por eso no ve a nadie!\n";
}
echo "\n";

// Directores favoritos
$directors = DB::table('user_favorite_directors')
    ->where('user_id', $user->id)
    ->count();
echo "🎭 Directores favoritos: $directors\n\n";

// Películas vistas
$movies = DB::table('watched_movies')
    ->where('user_id', $user->id)
    ->count();
echo "🎞️  Películas vistas: $movies\n\n";

// Likes enviados
$likes = DB::table('likes')
    ->where('from_user_id', $user->id)
    ->count();
echo "👍 Likes enviados: $likes\n";

// Usuarios ya vistos
$seenUsers = DB::table('likes')
    ->where('from_user_id', $user->id)
    ->pluck('to_user_id')
    ->toArray();
    
if (count($seenUsers) > 0) {
    echo "👀 Ya vio a estos usuarios: " . implode(', ', $seenUsers) . "\n";
}

echo "\n";

// Verificar cuántos usuarios están en el radio
if ($user->location) {
    $lat = $user->location->latitude;
    $lon = $user->location->longitude;
    $radius = $user->location->search_radius ?? 50;
    
    echo "=== USUARIOS EN RADIO ===\n\n";
    
    $allUsers = User::where('id', '!=', $user->id)
        ->with(['location', 'favoriteGenres'])
        ->get();
    
    $usersInRadius = 0;
    foreach ($allUsers as $otherUser) {
        if (!$otherUser->location) continue;
        
        $targetLat = $otherUser->location->latitude;
        $targetLon = $otherUser->location->longitude;
        
        $earthRadius = 6371;
        $dLat = deg2rad($targetLat - $lat);
        $dLon = deg2rad($targetLon - $lon);
        
        $a = sin($dLat/2) * sin($dLat/2) +
             cos(deg2rad($lat)) * cos(deg2rad($targetLat)) *
             sin($dLon/2) * sin($dLon/2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1-$a));
        $distance = $earthRadius * $c;
        
        if ($distance <= $radius) {
            $usersInRadius++;
            $genresMatch = false;
            if ($genres->count() > 0 && $otherUser->favoriteGenres->count() > 0) {
                $myGenres = $genres->pluck('id')->toArray();
                $theirGenres = $otherUser->favoriteGenres->pluck('id')->toArray();
                $common = array_intersect($myGenres, $theirGenres);
                $genresMatch = count($common) > 0;
            }
            
            $status = in_array($otherUser->id, $seenUsers) ? "YA VISTO" : ($genresMatch ? "✅ MATCH GÉNEROS" : "❌ SIN GÉNEROS COMUNES");
            
            echo sprintf("   %d. %s (%.1f km) - %s\n", 
                $otherUser->id, 
                $otherUser->name, 
                $distance,
                $status
            );
        }
    }
    
    echo "\nTotal en radio de {$radius}km: $usersInRadius usuarios\n";
}

echo "\n";
