<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== TABLAS LIMPIAS ===\n\n";

$columns = DB::select("SHOW COLUMNS FROM user_favorite_directors");
echo "user_favorite_directors:\n";
foreach ($columns as $col) {
    echo "  - {$col->Field} ({$col->Type})\n";
}

$count = DB::table('user_favorite_directors')->count();
echo "\nRegistros: $count\n";

if ($count > 0) {
    echo "\nPrimeros 3 registros:\n";
    $records = DB::table('user_favorite_directors')->limit(3)->get();
    foreach ($records as $r) {
        print_r($r);
    }
} else {
    echo "⚠️ Tabla vacía - los datos se perdieron en el proceso\n";
    echo "🔧 No hay problema, al guardar preferencias nuevamente se repoblará\n";
}

echo "\n\n=== TABLAS FINALES EN BD ===\n";
$tables = DB::select("SHOW TABLES");
$tableKey = 'Tables_in_' . env('DB_DATABASE');
foreach ($tables as $table) {
    echo "- {$table->$tableKey}\n";
}
