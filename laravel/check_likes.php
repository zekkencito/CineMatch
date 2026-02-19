<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== ANÁLISIS DE LIKES ===\n\n";

$likes = DB::table('likes')->where('from_user_id', 6)->get();

echo "Likes de Zekken (ID: 6):\n";
echo "Total: " . $likes->count() . "\n\n";

if ($likes->count() > 0) {
    foreach ($likes as $like) {
        $user = DB::table('users')->where('id', $like->to_user_id)->first();
        echo sprintf(
            "  -> %s (ID: %d) - Tipo: %s\n",
            $user ? $user->name : "Usuario {$like->to_user_id}",
            $like->to_user_id,
            $like->type
        );
    }
    
    $seenIds = $likes->pluck('to_user_id')->toArray();
    echo "\nUsuarios ya vistos (IDs): " . implode(', ', $seenIds) . "\n";
    
    // Verificar si Renzo (ID 5) y Strenght (ID 7) están en la lista
    echo "\n¿Renzo Caycho (ID: 5) ya visto? " . (in_array(5, $seenIds) ? "SÍ ❌" : "NO ✓") . "\n";
    echo "¿Strenght (ID: 7) ya visto? " . (in_array(7, $seenIds) ? "SÍ ❌" : "NO ✓") . "\n";
} else {
    echo "  No hay likes registrados\n";
    echo "  ✓ Renzo Caycho (ID: 5) debería aparecer\n";
    echo "  ✓ Strenght (ID: 7) debería aparecer\n";
}
