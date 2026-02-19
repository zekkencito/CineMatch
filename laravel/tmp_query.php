<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $rows = DB::select("SELECT u.id, u.email, l.latitude, l.longitude, l.search_radius
        FROM users u
        LEFT JOIN locations l ON l.user_id = u.id
        WHERE u.email IN ('zekken@gmail.com','gabriel@test.com')");

    echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
