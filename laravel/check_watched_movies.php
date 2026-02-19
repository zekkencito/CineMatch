<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== ESTRUCTURA DE TABLA watched_movies ===\n\n";

$columns = DB::select("DESCRIBE watched_movies");
foreach ($columns as $column) {
    echo "  • {$column->Field} ({$column->Type}) " . ($column->Null === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
}

echo "\n📝 Registro de ejemplo:\n";
$record = DB::table('watched_movies')->first();
if ($record) {
    foreach ((array)$record as $key => $value) {
        echo "  $key: $value\n";
    }
}
