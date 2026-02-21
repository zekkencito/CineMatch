<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Location;
use App\Models\Subscription;

class ExtraLimaUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // IDs de géneros de TMDB
        $sciFiGenreId = 878;
        $romanceGenreId = 10749;
        $actionGenreId = 28;
        $dramaGenreId = 18;
        $thrillerGenreId = 53;
        $comedyGenreId = 35;
        $horrorGenreId = 27;
        $fantasyGenreId = 14;

        $limaUsers = [
            // Usuarios en Lima (Alrededor de -12.027838, -77.067761)
            [
                'name' => 'Carlos Mendoza',
                'email' => 'carlos.lima@test.com',
                'age' => 25,
                'bio' => 'Cinéfilo en Lima. Me encanta la ciencia ficción.',
                'latitude' => -12.0315,
                'longitude' => -77.0621,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$sciFiGenreId, $actionGenreId],
                'directors' => [['id' => 525, 'name' => 'Christopher Nolan', 'profile' => null]],
                'movies' => []
            ],
            [
                'name' => 'Ana Rosales',
                'email' => 'ana.lima@test.com',
                'age' => 28,
                'bio' => 'Romance y drama. Buscando a alguien con quien ver el atardecer y buenas películas.',
                'latitude' => -12.0253,
                'longitude' => -77.0712,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$romanceGenreId, $dramaGenreId],
                'directors' => [],
                'movies' => []
            ],
            [
                'name' => 'José Fernández',
                'email' => 'jose.lima@test.com',
                'age' => 30,
                'bio' => 'Comedias y acción. Fan de Marvel.',
                'latitude' => -12.0289,
                'longitude' => -77.0685,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$actionGenreId, $comedyGenreId],
                'directors' => [],
                'movies' => []
            ],
            [
                'name' => 'María López',
                'email' => 'maria.lima@test.com',
                'age' => 22,
                'bio' => 'Terror y suspenso, nada mejor para el fin de semana en Lima.',
                'latitude' => -12.0241,
                'longitude' => -77.0643,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$horrorGenreId, $thrillerGenreId],
                'directors' => [],
                'movies' => []
            ],
            [
                'name' => 'Luis Castillo',
                'email' => 'luis.lima@test.com',
                'age' => 35,
                'bio' => 'Tarantino fan. Películas clásicas y buen cine.',
                'latitude' => -12.0305,
                'longitude' => -77.0701,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$thrillerGenreId, $actionGenreId],
                'directors' => [['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => null]],
                'movies' => []
            ],
            [
                'name' => 'Jorge Huamán',
                'email' => 'jorge.lima@test.com',
                'age' => 27,
                'bio' => 'Me gusta todo tipo de películas, siempre que tengan buena trama.',
                'latitude' => -12.0221,
                'longitude' => -77.0655,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$dramaGenreId],
                'directors' => [],
                'movies' => []
            ],
            [
                'name' => 'Claudia Sánchez',
                'email' => 'claudia.lima@test.com',
                'age' => 24,
                'bio' => 'Ciencia ficción y romance. Villeneuve me encanta.',
                'latitude' => -12.0267,
                'longitude' => -77.0734,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$sciFiGenreId, $romanceGenreId],
                'directors' => [['id' => 7467, 'name' => 'Denis Villeneuve', 'profile' => null]],
                'movies' => []
            ],
            [
                'name' => 'Lucía Pérez',
                'email' => 'lucia.lima@test.com',
                'age' => 31,
                'bio' => 'Documentales y cine histórico en mis ratos libres.',
                'latitude' => -12.0298,
                'longitude' => -77.0667,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$dramaGenreId],
                'directors' => [],
                'movies' => []
            ],
            [
                'name' => 'Pedro Kuroki',
                'email' => 'pedro.lima@test.com',
                'age' => 29,
                'bio' => 'Acción ininterrumpida y grandes explosiones.',
                'latitude' => -12.0255,
                'longitude' => -77.0622,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$actionGenreId],
                'directors' => [],
                'movies' => []
            ],
            [
                'name' => 'Marta Jiménez',
                'email' => 'marta.lima@test.com',
                'age' => 26,
                'bio' => 'Fantasía y animación. ¡Buscando con quién armar maratones!',
                'latitude' => -12.0278,
                'longitude' => -77.0677,
                'city' => 'Lima',
                'country' => 'Perú',
                'genres' => [$fantasyGenreId, $comedyGenreId],
                'directors' => [],
                'movies' => []
            ]
        ];

        $count = 0;
        foreach ($limaUsers as $userData) {
            
            // Check if user already exists
            $existingUser = User::where('email', $userData['email'])->first();
            if($existingUser) {
                echo "⚠️ El usuario {$userData['email']} ya existe, saltando...\n";
                continue;
            }

            // Crear usuario
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('123456'),
                'age' => $userData['age'],
                'bio' => $userData['bio'],
            ]);

            // Crear ubicación
            Location::create([
                'user_id' => $user->id,
                'latitude' => $userData['latitude'],
                'longitude' => $userData['longitude'],
                'city' => $userData['city'],
                'country' => $userData['country'],
                'search_radius' => 7,
            ]);

            // Crear suscripción Basic activa
            Subscription::create([
                'user_id' => $user->id,
                'subscription_plan_id' => 1, // Basic
                'start_date' => now(),
                'end_date' => now()->addDays(30),
                'is_active' => true
            ]);

            // Agregar géneros favoritos (usar TMDB IDs)
            foreach ($userData['genres'] as $genreId) {
                DB::table('user_favorite_genres')->insert([
                    'user_id' => $user->id,
                    'tmdb_genre_id' => $genreId,
                    'name' => null,
                ]);
            }

            // Agregar directores favoritos
            foreach ($userData['directors'] as $director) {
                DB::table('user_favorite_directors')->insert([
                    'user_id' => $user->id,
                    'tmdb_director_id' => $director['id'],
                    'name' => $director['name'],
                    'profile_path' => $director['profile'] ?? null,
                ]);
            }

            // Agregar películas vistas
            foreach ($userData['movies'] as $movie) {
                DB::table('watched_movies')->insert([
                    'user_id' => $user->id,
                    'tmdb_movie_id' => $movie['id'],
                    'title' => $movie['title'],
                    'rating' => $movie['rating'],
                    'poster_path' => $movie['poster'] ?? null,
                ]);
            }

            $count++;
            echo "✅ Usuario creado: {$userData['name']} ({$userData['email']})\n";
        }

        echo "\n🎉 {$count} usuarios agregados exitosamente en Lima!\n";
    }
}
