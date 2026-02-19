<?php

/**
 * Script para actualizar profile_path de directores existentes usando TMDB API
 * 
 * Uso: php update_director_profiles.php
 */

require __DIR__.'/vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Cargar Laravel app
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Configuración de TMDB
$tmdbApiKey = '6bbead30a73217ca3cd601c83f85e50b';
$tmdbBaseUrl = 'https://api.themoviedb.org/3';

echo "🎬 Actualizando profile_path de directores...\n\n";

// Obtener directores únicos de la base de datos
$directors = DB::table('user_favorite_directors')
    ->select('tmdb_director_id', 'name')
    ->distinct()
    ->get();

$totalDirectors = count($directors);
$updated = 0;
$notFound = 0;

echo "Total de directores a actualizar: {$totalDirectors}\n";
echo str_repeat("=", 60) . "\n\n";

foreach ($directors as $director) {
    $tmdbId = $director->tmdb_director_id;
    $name = $director->name;
    
    echo "[{$tmdbId}] {$name}... ";
    
    try {
        // Hacer request a TMDB API para obtener detalles de la persona
        $url = "{$tmdbBaseUrl}/person/{$tmdbId}?api_key={$tmdbApiKey}&language=es-ES";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $personData = json_decode($response, true);
            
            if (isset($personData['profile_path'])) {
                $profilePath = $personData['profile_path'];
                
                // Actualizar en la base de datos
                DB::table('user_favorite_directors')
                    ->where('tmdb_director_id', $tmdbId)
                    ->update(['profile_path' => $profilePath]);
                
                echo "✓ {$profilePath}\n";
                $updated++;
            } else {
                echo "⚠ Sin foto\n";
                $notFound++;
            }
        } else {
            echo "✗ Error HTTP {$httpCode}\n";
            $notFound++;
        }
        
        // Sleep para respetar rate limit de TMDB (40 requests por 10 segundos)
        usleep(250000); // 0.25 segundos = 4 requests/segundo
        
    } catch (Exception $e) {
        echo "✗ Error: " . $e->getMessage() . "\n";
        $notFound++;
    }
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "✅ Proceso completado!\n";
echo "   - Actualizados: {$updated}\n";
echo "   - Sin foto/Error: {$notFound}\n";
echo "   - Total: {$totalDirectors}\n";
