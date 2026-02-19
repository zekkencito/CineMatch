<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Location;

class NearbyUsersSeeder extends Seeder
{
    public function run(): void
    {
        echo "🎬 Creating 15 nearby users with movie preferences...\n";

        // Ubicación base (CDMX) - todos los usuarios estarán dentro de ~5km
        $baseLatitude = 19.432600;
        $baseLongitude = -99.133200;
        
        // Géneros disponibles (IDs del sistema)
        $genreIds = [
            'action' => 1,
            'comedy' => 4,
            'horror' => 11,
            'romance' => 14,
            'scifi' => 15,
        ];
        
        // Directores favoritos (IDs de TMDB con nombres)
        $directors = [
            ['id' => 865, 'name' => 'Michael Bay'],
            ['id' => 138, 'name' => 'Quentin Tarantino'],
            ['id' => 24, 'name' => 'Robert Zemeckis'],
            ['id' => 525, 'name' => 'Christopher Nolan'],
            ['id' => 55934, 'name' => 'Tom McGrath'],
            ['id' => 1704, 'name' => 'Andrew Adamson'],
            ['id' => 958, 'name' => 'Ridley Scott'],
            ['id' => 240, 'name' => 'James Cameron'],
        ];

        // Datos de los 15 usuarios
        $users = [
            [
                'name' => 'Ana García',
                'email' => 'ana.garcia@demo.com',
                'age' => 25,
                'bio' => 'Fanática de Spider-Man y las películas de acción. Me encanta el cine de superhéroes.',
                'genres' => [$genreIds['action'], $genreIds['scifi']],
                'directors' => [0, 3], // Michael Bay, Christopher Nolan
            ],
            [
                'name' => 'Luis Martínez',
                'email' => 'luis.martinez@demo.com',
                'age' => 28,
                'bio' => 'Amante de Quentin Tarantino y el cine de culto. Kill Bill es mi película favorita.',
                'genres' => [$genreIds['action']],
                'directors' => [1], // Quentin Tarantino
            ],
            [
                'name' => 'Carmen López',
                'email' => 'carmen.lopez@demo.com',
                'age' => 24,
                'bio' => 'Fan del terror y las películas de suspenso. Nada mejor que una noche de películas de horror.',
                'genres' => [$genreIds['horror']],
                'directors' => [6], // Ridley Scott
            ],
            [
                'name' => 'Miguel Hernández',
                'email' => 'miguel.hernandez@demo.com',
                'age' => 27,
                'bio' => 'Romantic at heart. Me encantan las comedias románticas y las historias de amor.',
                'genres' => [$genreIds['romance'], $genreIds['comedy']],
                'directors' => [2, 4], // Robert Zemeckis, Tom McGrath
            ],
            [
                'name' => 'Sofia Ramírez',
                'email' => 'sofia.ramirez@demo.com',
                'age' => 23,
                'bio' => 'Interstellar cambió mi vida. Fan de Christopher Nolan y la ciencia ficción.',
                'genres' => [$genreIds['scifi'], $genreIds['action']],
                'directors' => [3], // Christopher Nolan
            ],
            [
                'name' => 'Jorge Díaz',
                'email' => 'jorge.diaz@demo.com',
                'age' => 29,
                'bio' => 'Shrek es amor, Shrek es vida. Fan de las películas animadas con humor inteligente.',
                'genres' => [$genreIds['comedy']],
                'directors' => [5], // Andrew Adamson
            ],
            [
                'name' => 'Patricia Morales',
                'email' => 'patricia.morales@demo.com',
                'age' => 26,
                'bio' => 'Back to the Future es atemporal. Me fascina la ciencia ficción clásica.',
                'genres' => [$genreIds['scifi'], $genreIds['comedy']],
                'directors' => [2], // Robert Zemeckis
            ],
            [
                'name' => 'Roberto Sánchez',
                'email' => 'roberto.sanchez@demo.com',
                'age' => 30,
                'bio' => 'Megamind demuestra que las películas animadas pueden ser profundas. Gran fan.',
                'genres' => [$genreIds['comedy'], $genreIds['action']],
                'directors' => [4, 0], // Tom McGrath, Michael Bay
            ],
            [
                'name' => 'Laura Jiménez',
                'email' => 'laura.jimenez@demo.com',
                'age' => 25,
                'bio' => 'Las películas de terror son mi pasión. Cuanto más escalofriante, mejor.',
                'genres' => [$genreIds['horror']],
                'directors' => [6], // Ridley Scott
            ],
            [
                'name' => 'Fernando Torres',
                'email' => 'fernando.torres@demo.com',
                'age' => 28,
                'bio' => 'Michael Bay sabe cómo hacer explosiones épicas. Transformers fue increíble.',
                'genres' => [$genreIds['action'], $genreIds['scifi']],
                'directors' => [0], // Michael Bay
            ],
            [
                'name' => 'Elena Vargas',
                'email' => 'elena.vargas@demo.com',
                'age' => 24,
                'bio' => 'Romántica empedernida. Busco alguien con quien compartir películas de amor.',
                'genres' => [$genreIds['romance']],
                'directors' => [7], // James Cameron
            ],
            [
                'name' => 'Daniel Ruiz',
                'email' => 'daniel.ruiz@demo.com',
                'age' => 27,
                'bio' => 'Kill Bill es una obra maestra. Tarantino es un genio absoluto del cine.',
                'genres' => [$genreIds['action']],
                'directors' => [1], // Quentin Tarantino
            ],
            [
                'name' => 'Gabriela Ortiz',
                'email' => 'gabriela.ortiz@demo.com',
                'age' => 26,
                'bio' => 'Las comedias son mi escape. Me encanta reír hasta llorar viendo películas.',
                'genres' => [$genreIds['comedy']],
                'directors' => [4, 5], // Tom McGrath, Andrew Adamson
            ],
            [
                'name' => 'Ricardo Castro',
                'email' => 'ricardo.castro@demo.com',
                'age' => 29,
                'bio' => 'Spider-Man: Into the Spider-Verse es una joya. Las pelis de superhéroes son lo mejor.',
                'genres' => [$genreIds['action'], $genreIds['scifi']],
                'directors' => [0, 3], // Michael Bay, Christopher Nolan
            ],
            [
                'name' => 'Isabella Rojas',
                'email' => 'isabella.rojas@demo.com',
                'age' => 23,
                'bio' => 'Amante del cine en general. Desde terror hasta romance, disfruto todo tipo de películas.',
                'genres' => [$genreIds['horror'], $genreIds['romance'], $genreIds['comedy']],
                'directors' => [1, 6, 7], // Quentin Tarantino, Ridley Scott, James Cameron
            ],
        ];

        // Función para generar coordenadas cercanas (dentro de ~5km)
        $generateNearbyCoords = function() use ($baseLatitude, $baseLongitude) {
            // 0.045 grados ≈ 5km
            $latOffset = (rand(-450, 450) / 10000); // ±0.045
            $lonOffset = (rand(-450, 450) / 10000);
            
            return [
                'lat' => $baseLatitude + $latOffset,
                'lon' => $baseLongitude + $lonOffset,
            ];
        };

        // Crear los 15 usuarios
        foreach ($users as $index => $userData) {
            $coords = $generateNearbyCoords();
            
            // Crear usuario
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('password123'),
                'age' => $userData['age'],
                'bio' => $userData['bio'],
            ]);
            
            // Crear ubicación
            Location::create([
                'user_id' => $user->id,
                'latitude' => $coords['lat'],
                'longitude' => $coords['lon'],
                'city' => 'CDMX',
                'country' => 'México',
                'search_radius' => 5000, // 5km radius
            ]);
            
            // Asignar géneros favoritos
            if (!empty($userData['genres'])) {
                $user->favoriteGenres()->attach($userData['genres']);
            }
            
            // Asignar directores favoritos (insertar directamente en la tabla pivot)
            if (!empty($userData['directors'])) {
                foreach ($userData['directors'] as $directorIndex) {
                    $director = $directors[$directorIndex];
                    DB::table('user_favorite_directors')->insert([
                        'user_id' => $user->id,
                        'tmdb_director_id' => $director['id'],
                        'name' => $director['name'],
                    ]);
                }
            }
            
            echo "  ✓ Created user: {$userData['name']}\n";
        }

        echo "\n✅ Successfully created 15 nearby users!\n";
        echo "📧 All users have password: password123\n";
        echo "📍 All users are within 5km of base location (CDMX)\n";
    }
}
