<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

echo "═══════════════════════════════════════════════════════\n";
echo "    POBLAR GÉNEROS DE TMDB Y CREAR USUARIOS DE PRUEBA   \n";
echo "═══════════════════════════════════════════════════════\n\n";

// Géneros de TMDB (IDs oficiales)
$tmdbGenres = [
    ['id' => 28, 'name' => 'Acción'],
    ['id' => 12, 'name' => 'Aventura'],
    ['id' => 16, 'name' => 'Animación'],
    ['id' => 35, 'name' => 'Comedia'],
    ['id' => 80, 'name' => 'Crimen'],
    ['id' => 99, 'name' => 'Documental'],
    ['id' => 18, 'name' => 'Drama'],
    ['id' => 10751, 'name' => 'Familia'],
    ['id' => 14, 'name' => 'Fantasía'],
    ['id' => 36, 'name' => 'Historia'],
    ['id' => 27, 'name' => 'Terror'],
    ['id' => 10402, 'name' => 'Música'],
    ['id' => 9648, 'name' => 'Misterio'],
    ['id' => 10749, 'name' => 'Romance'],
    ['id' => 878, 'name' => 'Ciencia ficción'],
    ['id' => 10770, 'name' => 'Película de TV'],
    ['id' => 53, 'name' => 'Suspense'],
    ['id' => 10752, 'name' => 'Bélica'],
    ['id' => 37, 'name' => 'Western'],
];

echo "📝 Paso 1: Poblando géneros de TMDB...\n\n";

foreach ($tmdbGenres as $genre) {
    DB::table('genres')->updateOrInsert(
        ['id' => $genre['id']],
        ['name' => $genre['name'], 'created_at' => now(), 'updated_at' => now()]
    );
    echo "✅ Género: {$genre['name']} (ID: {$genre['id']})\n";
}

echo "\n💚 " . count($tmdbGenres) . " géneros agregados/actualizados\n\n";

// Paso 2: Crear usuarios en Nuevo Casas Grandes manualmente
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📝 Paso 2: Creando usuarios en Nuevo Casas Grandes...\n\n";

// Coordenadas base (Nuevo Casas Grandes, Chihuahua)
$baseLatitude = 30.4336;
$baseLongitude = -107.9063;

$newUsers = [
    ['name' => 'María García', 'email' => 'maria@test.com', 'lat_offset' => 0.05, 'lng_offset' => 0],
    ['name' => 'Carlos Méndez', 'email' => 'carlos@test.com', 'lat_offset' => -0.08, 'lng_offset' => 0.03],
    ['name' => 'Ana López', 'email' => 'ana@test.com', 'lat_offset' => 0.12, 'lng_offset' => -0.05],
    ['name' => 'Roberto Silva', 'email' => 'roberto@test.com', 'lat_offset' => -0.03, 'lng_offset' => 0.08],
    ['name' => 'Laura Martínez', 'email' => 'laura@test.com', 'lat_offset' => 0.02, 'lng_offset' => -0.10],
    ['name' => 'Diego Ramírez', 'email' => 'diego@test.com', 'lat_offset' => -0.10, 'lng_offset' => -0.03],
    ['name' => 'Sofia Torres', 'email' => 'sofia@test.com', 'lat_offset' => 0.07, 'lng_offset' => 0.05],
    ['name' => 'Pedro González', 'email' => 'pedro@test.com', 'lat_offset' => -0.06, 'lng_offset' => 0.06],
    ['name' => 'Valentina Cruz', 'email' => 'valentina@test.com', 'lat_offset' => 0.09, 'lng_offset' => -0.04],
    ['name' => 'Javier Morales', 'email' => 'javier@test.com', 'lat_offset' => -0.04, 'lng_offset' => -0.07],
];

$created = 0;
foreach ($newUsers as $userData) {
    // Verificar si el usuario ya existe
    $existing = User::where('email', $userData['email'])->first();
    
    if (!$existing) {
        // Crear usuario
        $user = User::create([
            'name' => $userData['name'],
            'email' => $userData['email'],
            'password' => Hash::make('password'),
            'age' => rand(23, 35),
            'bio' => 'Amante del cine en Nuevo Casas Grandes'
        ]);
        
        // Crear ubicación
        DB::table('locations')->insert([
            'user_id' => $user->id,
            'latitude' => $baseLatitude + $userData['lat_offset'],
            'longitude' => $baseLongitude + $userData['lng_offset'],
            'city' => 'Nuevo Casas Grandes',
            'country' => 'México',
            'search_radius' => 50,
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        // Agregar géneros favoritos (Ciencia ficción, Romance, Acción)
        DB::table('user_favorite_genres')->insert([
            ['user_id' => $user->id, 'genre_id' => 878], // Ciencia ficción
            ['user_id' => $user->id, 'genre_id' => 10749], // Romance
            ['user_id' => $user->id, 'genre_id' => 28], // Acción
        ]);
        
        // Agregar películas vistas
        DB::table('watched_movies')->insert([
            [
                'user_id' => $user->id,
                'tmdb_movie_id' => 24,
                'title' => 'Kill Bill: Vol. 1',
                'watched_date' => now(),
                'rating' => 5
            ],
            [
                'user_id' => $user->id,
                'tmdb_movie_id' => 680,
                'title' => 'Pulp Fiction',
                'watched_date' => now(),
                'rating' => 5
            ]
        ]);
        
        //Agregar director favorito (Tarantino)
        DB::table('user_favorite_directors')->insert([
            'user_id' => $user->id,
            'tmdb_director_id' => 138,
            'name' => 'Quentin Tarantino'
        ]);
        
        echo "✅ Usuario creado: {$userData['name']} ({$userData['email']})\n";
        $created++;
    } else {
        echo "⏭️  Usuario ya existe: {$userData['email']}\n";
    }
}

echo "\n💚 $created nuevos usuarios creados\n\n";

// Paso 3: Verificar resultados
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📊 RESULTADOS FINALES\n\n";

$totalUsers = User::count();
$nuevoCasasGrandesUsers = User::whereHas('location', function($q) {
    $q->whereBetween('latitude', [29.5, 31.5])
      ->whereBetween('longitude', [-109, -107]);
})->count();

echo "Total de usuarios: $totalUsers\n";
echo "Usuarios en Nuevo Casas Grandes: $nuevoCasasGrandesUsers\n\n";

// Mostrar usuarios de Nuevo Casas Grandes
$ncgUsers = User::whereHas('location', function($q) {
    $q->whereBetween('latitude', [29.5, 31.5])
      ->whereBetween('longitude', [-109, -107]);
})->with('location')->get();

echo "👥 TODOS los usuarios en Nuevo Casas Grandes:\n";
foreach ($ncgUsers as $user) {
    $hashOk = Hash::check('password', $user->password) ? "✅" : "❌";
    echo "   $hashOk {$user->name} ({$user->email})\n";
}

echo "\n🎉 ¡Listo! Ahora puedes hacer login con:\n";
echo "   Email: zekken@gmail.com (o cualquier email de arriba)\n";
echo "   Password: password\n\n";
