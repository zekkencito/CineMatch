<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class TestUsersSeeder extends Seeder
{
    public function run()
    {
        // Coordenadas base (Nuevo Casas Grandes, Chihuahua)
        $baseLatitude = 30.4336;
        $baseLongitude = -107.9063;

        // IDs de géneros de TMDB
        $sciFiGenreId = 878; // Ciencia ficción
        $romanceGenreId = 10749; // Romance
        $actionGenreId = 28; // Acción
        $dramaGenreId = 18; // Drama
        $thrillerGenreId = 53; // Thriller

        // ID de Kill Bill en TMDB
        $killBillId = 24; // Kill Bill: Vol. 1
        $killBill2Id = 393; // Kill Bill: Vol. 2

        // Usuarios de prueba — coordenadas ajustadas para quedar dentro de 7 km
        $testUsers = [
            [
                'name' => 'María García',
                'email' => 'maria@test.com',
                'age' => 28,
                'bio' => 'Fan de Tarantino y la ciencia ficción. Kill Bill es mi película favorita.',
                'latitude' => $baseLatitude + 0.01,
                'longitude' => $baseLongitude,
                'city' => 'Janos',
                'country' => 'México',
                'genres' => [$sciFiGenreId, $romanceGenreId, $actionGenreId],
                'directors' => [
                    ['id' => 138, 'name' => 'Quentin Tarantino'],
                    ['id' => 578, 'name' => 'Ridley Scott']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5],
                    ['id' => 680, 'title' => 'Pulp Fiction', 'rating' => 5]
                ]
            ],
            [
                'name' => 'Carlos Méndez',
                'email' => 'carlos@test.com',
                'age' => 32,
                'bio' => 'Tarantino es un genio. Me encanta el cine de ciencia ficción y las historias románticas.',
                'latitude' => $baseLatitude - 0.02,
                'longitude' => $baseLongitude + 0.01,
                'city' => 'Casas Grandes',
                'country' => 'México',
                'genres' => [$sciFiGenreId, $romanceGenreId, $thrillerGenreId],
                'directors' => [
                    ['id' => 138, 'name' => 'Quentin Tarantino'],
                    ['id' => 7467, 'name' => 'Denis Villeneuve']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5],
                    ['id' => $killBill2Id, 'title' => 'Kill Bill: Vol. 2', 'rating' => 5],
                    ['id' => 27205, 'title' => 'Inception', 'rating' => 5]
                ]
            ],
            [
                'name' => 'Ana López',
                'email' => 'ana@test.com',
                'age' => 25,
                'bio' => 'Romance, sci-fi y Tarantino. Kill Bill cambió mi vida.',
                'latitude' => $baseLatitude + 0.03,
                'longitude' => $baseLongitude - 0.015,
                'city' => 'Ascensión',
                'country' => 'México',
                'genres' => [$sciFiGenreId, $romanceGenreId, $dramaGenreId],
                'directors' => [
                    ['id' => 138, 'name' => 'Quentin Tarantino'],
                    ['id' => 525, 'name' => 'Christopher Nolan']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 4],
                    ['id' => 155, 'title' => 'The Dark Knight', 'rating' => 5]
                ]
            ],
            [
                'name' => 'Roberto Silva',
                'email' => 'roberto@test.com',
                'age' => 30,
                'bio' => 'Ciencia ficción y romance son mi combo perfecto. Tarantino es el mejor.',
                'latitude' => $baseLatitude - 0.01,
                'longitude' => $baseLongitude + 0.02,
                'city' => 'Buenaventura',
                'country' => 'México',
                'genres' => [$sciFiGenreId, $romanceGenreId, $actionGenreId, $thrillerGenreId],
                'directors' => [
                    ['id' => 138, 'name' => 'Quentin Tarantino'],
                    ['id' => 7467, 'name' => 'Denis Villeneuve'],
                    ['id' => 525, 'name' => 'Christopher Nolan']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5],
                    ['id' => $killBill2Id, 'title' => 'Kill Bill: Vol. 2', 'rating' => 4],
                    ['id' => 680, 'title' => 'Pulp Fiction', 'rating' => 5],
                    ['id' => 13, 'title' => 'Forrest Gump', 'rating' => 5]
                ]
            ],
            [
                'name' => 'Laura Martínez',
                'email' => 'laura@test.com',
                'age' => 27,
                'bio' => 'Fan del romance y la ciencia ficción. Kill Bill es arte puro.',
                'latitude' => $baseLatitude + 0.015,
                'longitude' => $baseLongitude - 0.02,
                'city' => 'Galeana',
                'country' => 'México',
                'genres' => [$romanceGenreId, $sciFiGenreId, $dramaGenreId],
                'directors' => [
                    ['id' => 138, 'name' => 'Quentin Tarantino'],
                    ['id' => 578, 'name' => 'Ridley Scott']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5],
                    ['id' => 550, 'title' => 'Fight Club', 'rating' => 4]
                ]
            ],
            [
                'name' => 'Diego Ramírez',
                'email' => 'diego@test.com',
                'age' => 29,
                'bio' => 'Tarantino forever. Ciencia ficción y romance son lo mío.',
                'latitude' => $baseLatitude - 0.025,
                'longitude' => $baseLongitude - 0.01,
                'city' => 'Madera',
                'country' => 'México',
                'genres' => [$sciFiGenreId, $romanceGenreId, $actionGenreId],
                'directors' => [
                    ['id' => 138, 'name' => 'Quentin Tarantino']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5],
                    ['id' => $killBill2Id, 'title' => 'Kill Bill: Vol. 2', 'rating' => 5]
                ]
            ],
            [
                'name' => 'Sofia Torres',
                'email' => 'sofia@test.com',
                'age' => 26,
                'bio' => 'Romance, sci-fi y todo lo que haga Tarantino.',
                'latitude' => $baseLatitude + 0.02,
                'longitude' => $baseLongitude + 0.015,
                'city' => 'Nuevo Casas Grandes',
                'country' => 'México',
                'genres' => [$romanceGenreId, $sciFiGenreId, $thrillerGenreId, $dramaGenreId],
                'directors' => [
                    ['id' => 138, 'name' => 'Quentin Tarantino'],
                    ['id' => 525, 'name' => 'Christopher Nolan'],
                    ['id' => 7467, 'name' => 'Denis Villeneuve']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5],
                    ['id' => 680, 'title' => 'Pulp Fiction', 'rating' => 5],
                    ['id' => 389, 'title' => 'Reservoir Dogs', 'rating' => 4]
                ]
            ],
            [
                'name' => 'Javier Hernández',
                'email' => 'javier@test.com',
                'age' => 31,
                'bio' => 'Ciencia ficción es mi pasión. Tarantino es un maestro.',
                'latitude' => $baseLatitude - 0.005,
                'longitude' => $baseLongitude + 0.03,
                'city' => 'Gómez Farías',
                'country' => 'México',
                'genres' => [$sciFiGenreId, $actionGenreId, $romanceGenreId],
                'directors' => [
                    ['id' => 138, 'name' => 'Quentin Tarantino'],
                    ['id' => 578, 'name' => 'Ridley Scott']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 4],
                    ['id' => 238, 'title' => 'The Godfather', 'rating' => 5]
                ]
            ]
        ];

        $count = count($testUsers);

        foreach ($testUsers as $userData) {
            // Verificar si el usuario ya existe
            $existingUser = User::where('email', $userData['email'])->first();
            if ($existingUser) {
                $user = $existingUser;
                $this->command->info("⚙️  Actualizando preferencias: {$userData['name']} ({$userData['email']})");

                // Limpiar preferencias existentes
                DB::table('user_favorite_genres')->where('user_id', $user->id)->delete();
                DB::table('user_favorite_directors')->where('user_id', $user->id)->delete();
                DB::table('watched_movies')->where('user_id', $user->id)->delete();

                // Actualizar o insertar ubicación para usuarios existentes para que queden dentro del nuevo radio
                DB::table('locations')->updateOrInsert(
                    ['user_id' => $user->id],
                    [
                        'latitude' => $userData['latitude'],
                        'longitude' => $userData['longitude'],
                        'city' => $userData['city'],
                        'country' => $userData['country'],
                        'search_radius' => 7,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            } else {
                // Crear usuario nuevo
                $user = User::create([
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'password' => Hash::make('password123'),
                    'age' => $userData['age'],
                    'bio' => $userData['bio'],
                ]);

                // Crear ubicación
                DB::table('locations')->insert([
                    'user_id' => $user->id,
                    'latitude' => $userData['latitude'],
                    'longitude' => $userData['longitude'],
                    'city' => $userData['city'],
                    'country' => $userData['country'],
                    'search_radius' => 7,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $this->command->info("✅ Usuario creado: {$userData['name']} ({$userData['email']})");
            }

            // Agregar géneros favoritos (para usuarios nuevos o existentes)
            foreach ($userData['genres'] as $genreId) {
                DB::table('user_favorite_genres')->insert([
                    'user_id' => $user->id,
                    'genre_id' => $genreId,
                ]);
            }

            // Agregar directores favoritos
            foreach ($userData['directors'] as $director) {
                DB::table('user_favorite_directors')->insert([
                    'user_id' => $user->id,
                    'tmdb_director_id' => $director['id'],
                    'name' => $director['name'],
                ]);
            }

            // Agregar películas vistas
            foreach ($userData['movies'] as $movie) {
                DB::table('watched_movies')->insert([
                    'user_id' => $user->id,
                    'tmdb_movie_id' => $movie['id'],
                    'title' => $movie['title'],
                    'rating' => $movie['rating'],
                ]);
            }

            $this->command->info("✅ Preferencias aplicadas: {$userData['name']} ({$userData['email']})");
        }

        $this->command->info("\n🎉 {$count} usuarios de prueba procesados exitosamente!");
        $this->command->info("📧 Todos los usuarios (nuevos) tienen la contraseña: password123");
    }
}
