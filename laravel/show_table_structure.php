<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$columns = DB::select("SHOW COLUMNS FROM watched_movies");

echo "=== ESTRUCTURA DE TABLA watched_movies ===\n\n";
foreach ($columns as $column) {
    echo "{$column->Field} ({$column->Type}) - NULL: {$column->Null}, Key: {$column->Key}\n";
}
