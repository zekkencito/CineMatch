<?php
// Script temporal para agregar usuarios de prueba ubicados en Perú
// Ejecutar desde la carpeta `laravel` con: php tmp_add_peru_users.php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

$users = [
    ['name' => 'Lima Tester', 'email' => 'peru_lima@example.com', 'lat' => -12.046374, 'lng' => -77.042793, 'city' => 'Lima'],
    ['name' => 'Arequipa Tester', 'email' => 'peru_arequipa@example.com', 'lat' => -16.409047, 'lng' => -71.537451, 'city' => 'Arequipa'],
    ['name' => 'Cusco Tester', 'email' => 'peru_cusco@example.com', 'lat' => -13.53195, 'lng' => -71.967462, 'city' => 'Cusco'],
    ['name' => 'Trujillo Tester', 'email' => 'peru_trujillo@example.com', 'lat' => -8.111052, 'lng' => -79.021533, 'city' => 'Trujillo'],
    ['name' => 'Chiclayo Tester', 'email' => 'peru_chiclayo@example.com', 'lat' => -6.771, 'lng' => -79.838, 'city' => 'Chiclayo'],
];

foreach ($users as $u) {
    try {
        // Insert user (si no existe)
        $existing = DB::table('users')->where('email', $u['email'])->first();
        if ($existing) {
            echo "Usuario ya existe: {$u['email']}\n";
            $userId = $existing->id;
        } else {
            $userId = DB::table('users')->insertGetId([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => Hash::make('password123'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            echo "Usuario creado: {$u['email']} (id={$userId})\n";
        }

        // Insert or update location
        $loc = DB::table('locations')->where('user_id', $userId)->first();
        $radius = 100; // radio inicial en km para pruebas
        if ($loc) {
            DB::table('locations')->where('user_id', $userId)->update([
                'latitude' => $u['lat'],
                'longitude' => $u['lng'],
                'search_radius' => $radius,
                'city' => $u['city'],
                'country' => 'Peru',
                'updated_at' => now(),
            ]);
            echo "Ubicación actualizada para user_id={$userId}\n";
        } else {
            DB::table('locations')->insert([
                'user_id' => $userId,
                'latitude' => $u['lat'],
                'longitude' => $u['lng'],
                'search_radius' => $radius,
                'city' => $u['city'],
                'country' => 'Peru',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            echo "Ubicación insertada para user_id={$userId}\n";
        }

        // Optionally add a watched movie for card richness
        $watched = DB::table('watched_movies')->where('user_id', $userId)->first();
        if (!$watched) {
            DB::table('watched_movies')->insert([
                'user_id' => $userId,
                'tmdb_movie_id' => 100 + $userId,
                'title' => 'Pelicula de Prueba',
                'poster_path' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

    } catch (Exception $e) {
        echo "Error procesando {$u['email']}: " . $e->getMessage() . "\n";
    }
}

echo "Hecho. Revisa la base de datos / API para confirmar los usuarios.\n";
