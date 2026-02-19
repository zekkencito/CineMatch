<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== ESTRUCTURA DE TABLAS ===\n\n";

// Ver estructura de user_favorite_directors
echo "📋 Tabla: user_favorite_directors\n";
echo str_repeat("─", 50) . "\n";
$columns = DB::select("DESCRIBE user_favorite_directors");
foreach ($columns as $column) {
    echo "  • {$column->Field} ({$column->Type}) " . ($column->Null === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
}

echo "\n";

// Ver algunos registros de ejemplo
echo "📝 Registros de ejemplo:\n";
$records = DB::table('user_favorite_directors')->limit(5)->get();
if ($records->count() > 0) {
    foreach ($records as $record) {
        echo "  ID: " . ($record->id ?? 'N/A') . "\n";
        foreach ((array)$record as $key => $value) {
            echo "    $key: $value\n";
        }
        echo "\n";
    }
} else {
    echo "  (Tabla vacía)\n";
}
