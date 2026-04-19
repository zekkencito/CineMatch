<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Location;
use App\Models\Subscription;
use App\Models\UserMatch;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $frameUnlockByStreak = [
            1 => ['classic_gold'],
            3 => ['classic_gold', 'noir_silver'],
            7 => ['classic_gold', 'noir_silver', 'neon_pop'],
            14 => ['classic_gold', 'noir_silver', 'neon_pop', 'epic_scarlet'],
            30 => ['classic_gold', 'noir_silver', 'neon_pop', 'epic_scarlet', 'director_cut'],
        ];

        $streakProfilesByEmail = [
            'pamela@gmail.com' => ['streak' => 14, 'frame' => 'epic_scarlet'],
            'roberto@gmail.com' => ['streak' => 30, 'frame' => 'director_cut'],
            'maria@test.com' => ['streak' => 7, 'frame' => 'neon_pop'],
            'carlos@test.com' => ['streak' => 3, 'frame' => 'noir_silver'],
            'ana@test.com' => ['streak' => 1, 'frame' => 'classic_gold'],
        ];

        $createdUsersByEmail = [];

        // Coordenadas base (Nuevo Casas Grandes, Chihuahua)
        $baseLatitude = 30.4336;
        $baseLongitude = -107.9063;

        // IDs de géneros de TMDB
        $sciFiGenreId = 878;
        $romanceGenreId = 10749;
        $actionGenreId = 28;
        $dramaGenreId = 18;
        $thrillerGenreId = 53;
        $comedyGenreId = 35;
        $horrorGenreId = 27;
        $fantasyGenreId = 14;

        // IDs de películas populares en TMDB
        $killBillId = 24;
        $killBill2Id = 393;
        $pulpFictionId = 680;
        $inceptionId = 27205;
        $darkKnightId = 155;
        $fightClubId = 550;
        $godfatherId = 238;
        $forrestGumpId = 13;
        $reservoirDogsId = 389;

        // Array de usuarios de prueba
        $testUsers = [
            // Usuario Admin
            [
                'name' => 'Administrator',
                'email' => 'admin@gmail.com',
                'age' => 30,
                'bio' => 'Panel de administración de Cinematch',
                'latitude' => $baseLatitude,
                'longitude' => $baseLongitude,
                'city' => 'Nuevo Casas Grandes',
                'country' => 'México',
                'genres' => [$sciFiGenreId, $actionGenreId],
                'directors' => [],
                'movies' => []
            ],

            // Usuario 1: María García
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
                    ['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg'],
                    ['id' => 578, 'name' => 'Ridley Scott', 'profile' => '/zABJmN9opmqD4orWl3KSdCaSo7Q.jpg']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5, 'poster' => '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg'],
                    ['id' => $pulpFictionId, 'title' => 'Pulp Fiction', 'rating' => 5, 'poster' => '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg']
                ]
            ],

            // Usuario 2: Carlos Méndez
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
                    ['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg'],
                    ['id' => 7467, 'name' => 'Denis Villeneuve', 'profile' => '/5Ul3hj8qJQyJyT7NV9bX0iRK46B.jpg']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5, 'poster' => '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg'],
                    ['id' => $killBill2Id, 'title' => 'Kill Bill: Vol. 2', 'rating' => 5, 'poster' => '/2yhg0mZQweonjiy79eHgsfsI8yR.jpg'],
                    ['id' => $inceptionId, 'title' => 'Inception', 'rating' => 5, 'poster' => '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg']
                ]
            ],

            // Usuario 3: Ana López
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
                    ['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg'],
                    ['id' => 525, 'name' => 'Christopher Nolan', 'profile' => '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 4, 'poster' => '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg'],
                    ['id' => $darkKnightId, 'title' => 'The Dark Knight', 'rating' => 5, 'poster' => '/qJ2tW6WMUDux911r6m7haRef0WH.jpg']
                ]
            ],

            // Usuario 4: Roberto Silva
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
                    ['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg'],
                    ['id' => 7467, 'name' => 'Denis Villeneuve', 'profile' => '/5Ul3hj8qJQyJyT7NV9bX0iRK46B.jpg'],
                    ['id' => 525, 'name' => 'Christopher Nolan', 'profile' => '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5, 'poster' => '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg'],
                    ['id' => $killBill2Id, 'title' => 'Kill Bill: Vol. 2', 'rating' => 4, 'poster' => '/2yhg0mZQweonjiy79eHgsfsI8yR.jpg'],
                    ['id' => $pulpFictionId, 'title' => 'Pulp Fiction', 'rating' => 5, 'poster' => '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'],
                    ['id' => $forrestGumpId, 'title' => 'Forrest Gump', 'rating' => 5, 'poster' => '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg']
                ]
            ],

            // Usuario 5: Laura Martínez
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
                    ['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg'],
                    ['id' => 578, 'name' => 'Ridley Scott', 'profile' => '/zABJmN9opmqD4orWl3KSdCaSo7Q.jpg']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5, 'poster' => '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg'],
                    ['id' => $fightClubId, 'title' => 'Fight Club', 'rating' => 4, 'poster' => '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg']
                ]
            ],

            // Usuario 6: Diego Ramírez
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
                    ['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5, 'poster' => '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg'],
                    ['id' => $killBill2Id, 'title' => 'Kill Bill: Vol. 2', 'rating' => 5, 'poster' => '/2yhg0mZQweonjiy79eHgsfsI8yR.jpg']
                ]
            ],

            // Usuario 7: Sofía Torres
            [
                'name' => 'Sofía Torres',
                'email' => 'sofia@test.com',
                'age' => 26,
                'bio' => 'Romance, sci-fi y todo lo que haga Tarantino.',
                'latitude' => $baseLatitude + 0.02,
                'longitude' => $baseLongitude + 0.015,
                'city' => 'Nuevo Casas Grandes',
                'country' => 'México',
                'genres' => [$romanceGenreId, $sciFiGenreId, $thrillerGenreId, $dramaGenreId],
                'directors' => [
                    ['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg'],
                    ['id' => 525, 'name' => 'Christopher Nolan', 'profile' => '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg'],
                    ['id' => 7467, 'name' => 'Denis Villeneuve', 'profile' => '/5Ul3hj8qJQyJyT7NV9bX0iRK46B.jpg']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 5, 'poster' => '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg'],
                    ['id' => $pulpFictionId, 'title' => 'Pulp Fiction', 'rating' => 5, 'poster' => '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg'],
                    ['id' => $reservoirDogsId, 'title' => 'Reservoir Dogs', 'rating' => 4, 'poster' => '/xi8Iu6qyTfyZVDVy60raIOYJJmk.jpg']
                ]
            ],

            // Usuario 8: Javier Hernández
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
                    ['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg'],
                    ['id' => 578, 'name' => 'Ridley Scott', 'profile' => '/zABJmN9opmqD4orWl3KSdCaSo7Q.jpg']
                ],
                'movies' => [
                    ['id' => $killBillId, 'title' => 'Kill Bill: Vol. 1', 'rating' => 4, 'poster' => '/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg'],
                    ['id' => $godfatherId, 'title' => 'The Godfather', 'rating' => 5, 'poster' => '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg']
                ]
            ],

            // Usuario 9: Pamela Tarelo (usuario principal)
            [
                'name' => 'Pamela Tarelo',
                'email' => 'pamela@gmail.com',
                'age' => 21,
                'bio' => 'Fan de ciencia ficción y películas de Christopher Nolan. Interstellar es mi favorita.',
                'latitude' => $baseLatitude,
                'longitude' => $baseLongitude,
                'city' => 'Nuevo Casas Grandes',
                'country' => 'México',
                'genres' => [$sciFiGenreId, $actionGenreId, $thrillerGenreId],
                'directors' => [
                    ['id' => 525, 'name' => 'Christopher Nolan', 'profile' => '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg'],
                    ['id' => 7467, 'name' => 'Denis Villeneuve', 'profile' => '/5Ul3hj8qJQyJyT7NV9bX0iRK46B.jpg']
                ],
                'movies' => [
                    ['id' => 157336, 'title' => 'Interstellar', 'rating' => 5, 'poster' => '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'],
                    ['id' => $inceptionId, 'title' => 'Inception', 'rating' => 5, 'poster' => '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'],
                    ['id' => $darkKnightId, 'title' => 'The Dark Knight', 'rating' => 5, 'poster' => '/qJ2tW6WMUDux911r6m7haRef0WH.jpg']
                ]
            ],

            // Usuario 10: Roberto Gomez
            [
                'name' => 'Roberto Gomez',
                'email' => 'roberto@gmail.com',
                'age' => 24,
                'bio' => 'Horror fan. Me encanta el terror psicológico y las películas de suspense.',
                'latitude' => $baseLatitude + 0.04,
                'longitude' => $baseLongitude - 0.03,
                'city' => 'Janos',
                'country' => 'México',
                'genres' => [$horrorGenreId, $thrillerGenreId, $dramaGenreId],
                'directors' => [
                    ['id' => 2127, 'name' => 'Jordan Peele', 'profile' => '/kBSKKaOPbHsaJXVY3PWHxQcEhBt.jpg'],
                    ['id' => 11343, 'name' => 'Ari Aster', 'profile' => '/9y5YE1cMyE0g1F8T4w5G7CqBDAT.jpg']
                ],
                'movies' => [
                    ['id' => 419430, 'title' => 'Get Out', 'rating' => 5, 'poster' => '/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg'],
                    ['id' => 530385, 'title' => 'Midsommar', 'rating' => 4, 'poster' => '/7LEI8ulZzO5gy9Ww2NVCrKmHeDZ.jpg']
                ]
            ],

            // Usuarios adicionales 11-20
            [
                'name' => 'Valentina Cruz',
                'email' => 'valentina@test.com',
                'age' => 23,
                'bio' => 'Comedias románticas y dramas. Nolan es mi director favorito.',
                'latitude' => $baseLatitude + 0.012,
                'longitude' => $baseLongitude + 0.018,
                'city' => 'Casas Grandes',
                'country' => 'México',
                'genres' => [$comedyGenreId, $romanceGenreId, $dramaGenreId],
                'directors' => [
                    ['id' => 525, 'name' => 'Christopher Nolan', 'profile' => '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg'],
                    ['id' => 11343, 'name' => 'Greta Gerwig', 'profile' => '/wfciaiAl3pClZAPhhI2K0YbJFO2.jpg']
                ],
                'movies' => [
                    ['id' => 27205, 'title' => 'Inception', 'rating' => 5, 'poster' => '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'],
                    ['id' => 550, 'title' => 'Fight Club', 'rating' => 5, 'poster' => '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg']
                ]
            ],

            [
                'name' => 'Fernando Ruiz',
                'email' => 'fernando@test.com',
                'age' => 35,
                'bio' => 'Acción y fantasía. Marvel y DC son lo mío.',
                'latitude' => $baseLatitude - 0.018,
                'longitude' => $baseLongitude + 0.025,
                'city' => 'Buenaventura',
                'country' => 'México',
                'genres' => [$actionGenreId, $fantasyGenreId, $sciFiGenreId],
                'directors' => [
                    ['id' => 19272, 'name' => 'Anthony Russo', 'profile' => '/iKK6zIREVvJxgkH3Cs5O3qs3n95.jpg'],
                    ['id' => 19263, 'name' => 'Joe Russo', 'profile' => '/8WiQX3woWsn8ngKVkiF4ybFxJqP.jpg']
                ],
                'movies' => [
                    ['id' => 299536, 'title' => 'Avengers: Infinity War', 'rating' => 5, 'poster' => '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg'],
                    ['id' => 299534, 'title' => 'Avengers: Endgame', 'rating' => 5, 'poster' => '/or06FN3Dka5tukK1e9sl16pB3iy.jpg']
                ]
            ],

            [
                'name' => 'Isabel Morales',
                'email' => 'isabel@test.com',
                'age' => 29,
                'bio' => 'Romance y drama. Las películas que hacen llorar son mis favoritas.',
                'latitude' => $baseLatitude + 0.022,
                'longitude' => $baseLongitude - 0.012,
                'city' => 'Ascensión',
                'country' => 'México',
                'genres' => [$romanceGenreId, $dramaGenreId, $comedyGenreId],
                'directors' => [
                    ['id' => 11343, 'name' => 'Greta Gerwig', 'profile' => '/wfciaiAl3pClZAPhhI2K0YbJFO2.jpg'],
                    ['id' => 2294, 'name' => 'Damien Chazelle', 'profile' => '/dFaupD76QL0xtXvGc2ud1RnLSKa.jpg']
                ],
                'movies' => [
                    ['id' => 313369, 'title' => 'La La Land', 'rating' => 5, 'poster' => '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg'],
                    ['id' => 194662, 'title' => 'Birdman', 'rating' => 4, 'poster' => '/rSZs93P0LLxqlVEbI001UKoeCQC.jpg']
                ]
            ],

            [
                'name' => 'Miguel Ángel',
                'email' => 'miguel@test.com',
                'age' => 33,
                'bio' => 'Documentales y películas históricas. Spielberg es un genio.',
                'latitude' => $baseLatitude - 0.028,
                'longitude' => $baseLongitude - 0.008,
                'city' => 'Madera',
                'country' => 'México',
                'genres' => [$dramaGenreId, $actionGenreId, $thrillerGenreId],
                'directors' => [
                    ['id' => 488, 'name' => 'Steven Spielberg', 'profile' => '/tZxcg19YQ3e8fJ0pOs7hjlnmmr6.jpg'],
                    ['id' => 1032, 'name' => 'Martin Scorsese', 'profile' => '/9U9Y5GQuWX3EZy39B8nkk4NY01S.jpg']
                ],
                'movies' => [
                    ['id' => 424, 'title' => "Schindler's List", 'rating' => 5, 'poster' => '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg'],
                    ['id' => 238, 'title' => 'The Godfather', 'rating' => 5, 'poster' => '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg']
                ]
            ],

            [
                'name' => 'Patricia Vega',
                'email' => 'patricia@test.com',
                'age' => 26,
                'bio' => 'Sci-fi y thriller. Villeneuve es mi director favorito.',
                'latitude' => $baseLatitude + 0.008,
                'longitude' => $baseLongitude + 0.022,
                'city' => 'Gómez Farías',
                'country' => 'México',
                'genres' => [$sciFiGenreId, $thrillerGenreId, $dramaGenreId],
                'directors' => [
                    ['id' => 7467, 'name' => 'Denis Villeneuve', 'profile' => '/5Ul3hj8qJQyJyT7NV9bX0iRK46B.jpg'],
                    ['id' => 138, 'name' => 'Quentin Tarantino', 'profile' => '/1gjcpAa99FAOWGnrUvHEXXsRs7o.jpg']
                ],
                'movies' => [
                    ['id' => 335984, 'title' => 'Blade Runner 2049', 'rating' => 5, 'poster' => '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg'],
                ]
            ],

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
        foreach ($testUsers as $userData) {
            // Crear usuario
            $password = $userData['email'] === 'admin@gmail.com' ? 'admin123' : '123456';
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make($password),
                'age' => $userData['age'],
                'bio' => $userData['bio'],
            ]);

            $createdUsersByEmail[$userData['email']] = $user;

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

            if (isset($streakProfilesByEmail[$userData['email']])) {
                $profile = $streakProfilesByEmail[$userData['email']];
                $streak = (int) $profile['streak'];
                $frames = ['classic_gold'];

                if ($streak >= 30) {
                    $frames = $frameUnlockByStreak[30];
                } elseif ($streak >= 14) {
                    $frames = $frameUnlockByStreak[14];
                } elseif ($streak >= 7) {
                    $frames = $frameUnlockByStreak[7];
                } elseif ($streak >= 3) {
                    $frames = $frameUnlockByStreak[3];
                }

                $user->update([
                    'current_streak' => $streak,
                    'best_streak' => $streak,
                    'last_active_date' => now()->toDateString(),
                    'equipped_frame' => $profile['frame'],
                    'total_activities' => $streak * 4,
                ]);

                foreach ($frames as $frameId) {
                    DB::table('user_unlocked_frames')->insert([
                        'user_id' => $user->id,
                        'frame_id' => $frameId,
                        'unlocked_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            $count++;
            echo "✅ Usuario creado: {$userData['name']} ({$userData['email']})\n";
        }

        echo "\n🎉 {$count} usuarios creados exitosamente!\n";
        echo "📧 Admin: admin@gmail.com | Contraseña: admin123\n";
        echo "📧 Otros usuarios: contraseña 123456\n";
        echo "🌍 Ubicación base: Nuevo Casas Grandes, Chihuahua\n";
        echo "📱 Radio de búsqueda: 7 km\n";

        $pamela = $createdUsersByEmail['pamela@gmail.com'] ?? null;
        $matchCandidates = [
            $createdUsersByEmail['roberto@gmail.com'] ?? null,
            $createdUsersByEmail['maria@test.com'] ?? null,
            $createdUsersByEmail['carlos@test.com'] ?? null,
        ];

        if ($pamela) {
            foreach ($matchCandidates as $candidate) {
                if (!$candidate) {
                    continue;
                }

                UserMatch::firstOrCreate([
                    'user_one_id' => min($pamela->id, $candidate->id),
                    'user_two_id' => max($pamela->id, $candidate->id),
                ]);
            }

            echo "🍿 Pamela ahora tiene 3 matches de prueba.\n";
        }
    }
}
