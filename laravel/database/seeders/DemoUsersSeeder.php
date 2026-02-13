<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Location;
use App\Models\Genre;
use App\Models\Director;
use App\Models\Like;
use App\Models\UserMatch;

class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Géneros y directores IDs
        $sciFiGenre = 5; // Sci-Fi
        $actionGenre = 1; // Action
        $dramaGenre = 2; // Drama
        $horrorGenre = 4; // Horror
        
        $nolanDirector = 1; // Christopher Nolan
        $cameronDirector = 2; // James Cameron
        $russoDirector = 4; // Anthony Russo

        // Ubicación base: Ciudad de México (cerca de Pamela: 19.432600, -99.133200)
        $baseLocations = [
            ['lat' => 19.432600, 'lon' => -99.133200], // Centro CDMX
            ['lat' => 19.420000, 'lon' => -99.150000], // Polanco
            ['lat' => 19.356000, 'lon' => -99.156000], // Coyoacán
            ['lat' => 19.404000, 'lon' => -99.170000], // Condesa
            ['lat' => 19.384300, 'lon' => -99.176700], // San Ángel
            ['lat' => 19.410000, 'lon' => -99.130000], // Juárez
            ['lat' => 19.398900, 'lon' => -99.163600], // Roma
            ['lat' => 19.361900, 'lon' => -99.270000], // Santa Fe
        ];

        // ===== 3 USUARIOS PARA MATCH PREDEFINIDO =====
        echo "Creating match users...\n";
        
        // USUARIO 1: Carlos - Máxima compatibilidad (Sci-Fi + Christopher Nolan)
        $carlos = User::create([
            'name' => 'Carlos Méndez',
            'email' => 'carlos@demo.com',
            'password' => Hash::make('123456'),
            'age' => 26,
            'bio' => 'Fan de ciencia ficción y películas de Nolan. Me encanta Interstellar y Inception.',
        ]);
        Location::create([
            'user_id' => $carlos->id,
            'latitude' => 19.420000,
            'longitude' => -99.150000,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $carlos->favoriteGenres()->attach([$sciFiGenre, $actionGenre]);
        $carlos->favoriteDirectors()->attach([$nolanDirector]);
        
        // USUARIO 2: María - Compatibilidad media (Sci-Fi)
        $maria = User::create([
            'name' => 'María Torres',
            'email' => 'maria@demo.com',
            'password' => Hash::make('123456'),
            'age' => 24,
            'bio' => 'Amante de la ciencia ficción, especialmente películas espaciales y futuristas.',
        ]);
        Location::create([
            'user_id' => $maria->id,
            'latitude' => 19.404000,
            'longitude' => -99.170000,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $maria->favoriteGenres()->attach([$sciFiGenre, $dramaGenre]);
        $maria->favoriteDirectors()->attach([$cameronDirector]);

        // USUARIO 3: Diego - Compatibilidad media (Christopher Nolan)
        $diego = User::create([
            'name' => 'Diego Ramírez',
            'email' => 'diego@demo.com',
            'password' => Hash::make('123456'),
            'age' => 28,
            'bio' => 'Gran fan de Christopher Nolan. The Dark Knight es mi película favorita.',
        ]);
        Location::create([
            'user_id' => $diego->id,
            'latitude' => 19.398900,
            'longitude' => -99.163600,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $diego->favoriteGenres()->attach([$actionGenre, $dramaGenre]);
        $diego->favoriteDirectors()->attach([$nolanDirector, $russoDirector]);

        // ===== CREAR LIKES UNILATERALES (ELLOS HACIA PAMELA) =====
        // Estos usuarios YA dieron like a Pamela, pero ella aún no los ve
        // El match aparecerá cuando Pamela les dé like en el swiper
        $pamelaId = 1; // ID de Pamela

        // Carlos ya dio like a Pamela (esperando match)
        Like::create(['from_user_id' => $carlos->id, 'to_user_id' => $pamelaId, 'type' => 'like']);

        // María ya dio like a Pamela (esperando match)
        Like::create(['from_user_id' => $maria->id, 'to_user_id' => $pamelaId, 'type' => 'like']);

        // Diego ya dio like a Pamela (esperando match)
        Like::create(['from_user_id' => $diego->id, 'to_user_id' => $pamelaId, 'type' => 'like']);

        echo "✓ Created 3 users who already liked Pamela: Carlos, María, Diego\n";
        echo "⏳ Matches will appear when Pamela swipes right on them\n";

        // ===== 20 USUARIOS ADICIONALES CON GUSTOS EN COMÚN =====
        echo "Creating additional users...\n";

        $users = [
            // Usuarios con Sci-Fi (10 usuarios)
            ['name' => 'Sofía García', 'bio' => 'Me fascina la ciencia ficción y películas de Marvel', 'genres' => [$sciFiGenre, $actionGenre], 'directors' => [$russoDirector]],
            ['name' => 'Alejandro Cruz', 'bio' => 'Sci-fi lover! Avatar y Blade Runner son mis favoritas', 'genres' => [$sciFiGenre], 'directors' => [$cameronDirector]],
            ['name' => 'Valeria Ortiz', 'bio' => 'Ciencia ficción y películas espaciales 🚀', 'genres' => [$sciFiGenre, $dramaGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Fernando López', 'bio' => 'Fan de películas futuristas y distopías', 'genres' => [$sciFiGenre, $actionGenre], 'directors' => []],
            ['name' => 'Isabella Ruiz', 'bio' => 'Sci-fi es mi género favorito. Interstellar 10/10', 'genres' => [$sciFiGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Ricardo Morales', 'bio' => 'Me encantan las películas de ciencia ficción complejas', 'genres' => [$sciFiGenre, $dramaGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Camila Flores', 'bio' => 'Sci-fi, action y todo lo que tenga efectos especiales', 'genres' => [$sciFiGenre, $actionGenre], 'directors' => []],
            ['name' => 'Daniel Vargas', 'bio' => 'Fan de Matrix, Inception y todo lo que haga pensar', 'genres' => [$sciFiGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Lucía Hernández', 'bio' => 'Ciencia ficción y películas con viajes en el tiempo', 'genres' => [$sciFiGenre, $dramaGenre], 'directors' => []],
            ['name' => 'Miguel Ángel Soto', 'bio' => 'Sci-fi fan desde siempre. Ex Machina es mi película favorita', 'genres' => [$sciFiGenre], 'directors' => []],
            
            // Usuarios con Christopher Nolan (5 usuarios)
            ['name' => 'Andrea Jiménez', 'bio' => 'Christopher Nolan es un genio. Veo todas sus películas', 'genres' => [$actionGenre, $dramaGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Pablo Castro', 'bio' => 'Fan de Nolan: Dunkirk, Tenet, Memento... todas!', 'genres' => [$dramaGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Gabriela Santos', 'bio' => 'Nolan + Zimmer = perfección cinematográfica', 'genres' => [$actionGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Sebastián Reyes', 'bio' => 'The Dark Knight trilogy cambió mi vida', 'genres' => [$actionGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Natalia Mendoza', 'bio' => 'Gran admiradora de Christopher Nolan y su estilo', 'genres' => [$dramaGenre], 'directors' => [$nolanDirector]],
            
            // Usuarios con ambos (Sci-Fi + Nolan) - Alta compatibilidad (5 usuarios)
            ['name' => 'Emilio Guzmán', 'bio' => 'Sci-fi y Nolan son la combinación perfecta', 'genres' => [$sciFiGenre, $actionGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Victoria Ramos', 'bio' => 'Interstellar es la mejor película de ciencia ficción', 'genres' => [$sciFiGenre], 'directors' => [$nolanDirector, $cameronDirector]],
            ['name' => 'Javier Delgado', 'bio' => 'Fan de Nolan y del género sci-fi en general', 'genres' => [$sciFiGenre, $dramaGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Mariana Silva', 'bio' => 'Ciencia ficción de Nolan = obras maestras', 'genres' => [$sciFiGenre], 'directors' => [$nolanDirector]],
            ['name' => 'Rodrigo Paredes', 'bio' => 'Inception cambió mi forma de ver el cine sci-fi', 'genres' => [$sciFiGenre, $actionGenre], 'directors' => [$nolanDirector]],
        ];

        foreach ($users as $index => $userData) {
            $location = $baseLocations[$index % count($baseLocations)];
            
            $user = User::create([
                'name' => $userData['name'],
                'email' => strtolower(str_replace(' ', '.', $userData['name'])) . '@demo.com',
                'password' => Hash::make('123456'),
                'age' => rand(22, 32),
                'bio' => $userData['bio'],
            ]);

            // Agregar pequeñas variaciones a la ubicación
            Location::create([
                'user_id' => $user->id,
                'latitude' => $location['lat'] + (rand(-100, 100) / 10000), // ±0.01°
                'longitude' => $location['lon'] + (rand(-100, 100) / 10000),
                'city' => 'CDMX',
                'country' => 'México',
                'search_radius' => 2000,
            ]);

            // Asignar géneros favoritos
            if (!empty($userData['genres'])) {
                $user->favoriteGenres()->attach($userData['genres']);
            }

            // Asignar directores favoritos
            if (!empty($userData['directors'])) {
                $user->favoriteDirectors()->attach($userData['directors']);
            }
        }

        echo "✓ Created 20 additional users with common interests\n";
        echo "\n=== SUMMARY ===\n";
        echo "Total users: " . User::count() . "\n";
        echo "Users with Sci-Fi: " . User::whereHas('favoriteGenres', function($q) use ($sciFiGenre) {
            $q->where('genre_id', $sciFiGenre);
        })->count() . "\n";
        echo "Users with Christopher Nolan: " . User::whereHas('favoriteDirectors', function($q) use ($nolanDirector) {
            $q->where('director_id', $nolanDirector);
        })->count() . "\n";
        echo "\n✅ MATCHES FOR PAMELA:\n";
        echo "  1. Carlos Méndez (carlos@demo.com) - Sci-Fi + Christopher Nolan\n";
        echo "  2. María Torres (maria@demo.com) - Sci-Fi\n";
        echo "  3. Diego Ramírez (diego@demo.com) - Christopher Nolan\n";
    }
}
