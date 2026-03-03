<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$r = \App\Models\User::select('id','name','email')->paginate(50);
echo 'total: '.$r->total().', lastPage: '.$r->lastPage().', count: '.$r->count().PHP_EOL;

// Check if profile_photo column has large data
$withPhotos = \App\Models\User::whereNotNull('profile_photo')->count();
$withoutPhotos = \App\Models\User::whereNull('profile_photo')->count();
echo "Users with profile_photo: $withPhotos" . PHP_EOL;
echo "Users without profile_photo: $withoutPhotos" . PHP_EOL;

// Check size of response
$query = \App\Models\User::select('users.id', 'users.name', 'users.email', 'users.profile_photo');
$users = $query->get();
$totalSize = 0;
foreach ($users as $u) {
    $size = strlen($u->profile_photo ?? '');
    if ($size > 1000) {
        echo "User {$u->id} ({$u->name}): photo size = " . round($size/1024, 1) . " KB" . PHP_EOL;
    }
    $totalSize += $size;
}
echo "Total profile_photo data size: " . round($totalSize / 1024 / 1024, 2) . " MB" . PHP_EOL;
