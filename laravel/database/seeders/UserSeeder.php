<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Location;
use App\Models\Subscription;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ===== USUARIO 1: PAMELA (Usuario principal de prueba) =====
        $pamela = User::create([
            'name' => 'Pamela Tarelo',
            'email' => 'pamela@gmail.com',
            'password' => Hash::make('123456'),
            'age' => 21,
            'bio' => 'Fan de ciencia ficción y películas de Christopher Nolan. Me encanta Interstellar.',
        ]);
        Location::create([
            'user_id' => $pamela->id,
            'latitude' => 19.432600,
            'longitude' => -99.133200,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $pamela->favoriteGenres()->attach([15, 1]); // Science Fiction, Action
        $pamela->favoriteDirectors()->create(['tmdb_id' => 525, 'name' => 'Christopher Nolan', 'profile_path' => '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg']);
        Subscription::create(['user_id' => $pamela->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        // ===== USUARIO 2: ROBERTO =====
        $roberto = User::create([
            'name' => 'Roberto Gomez',
            'email' => 'roberto@gmail.com',
            'password' => Hash::make('123456'),
            'age' => 24,
            'bio' => 'Horror fan. Me encanta el terror psicológico y las películas de suspense.',
        ]);
        Location::create([
            'user_id' => $roberto->id,
            'latitude' => 19.420000,
            'longitude' => -99.150000,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $roberto->favoriteGenres()->attach([11, 17]); // Horror, Thriller
        $roberto->favoriteDirectors()->create(['tmdb_id' => 2127, 'name' => 'Jordan Peele', 'profile_path' => '/kBSKKaOPbHsaJXVY3PWHxQcEhBt.jpg']);
        Subscription::create(['user_id' => $roberto->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        // ===== USUARIO 3: ANA =====
        $ana = User::create([
            'name' => 'Ana Lopez',
            'email' => 'ana@gmail.com',
            'password' => Hash::make('123456'),
            'age' => 21,
            'bio' => 'Romantic movies lover. Me encantan las comedias románticas y dramas.',
        ]);
        Location::create([
            'user_id' => $ana->id,
            'latitude' => 19.356000,
            'longitude' => -99.156000,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $ana->favoriteGenres()->attach([14, 4, 7]); // Romance, Comedy, Drama
        $ana->favoriteDirectors()->create(['tmdb_id' => 11343, 'name' => 'Greta Gerwig', 'profile_path' => '/wfciaiAl3pClZAPhhI2K0YbJFO2.jpg']);
        Subscription::create(['user_id' => $ana->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        // ===== USUARIO 4: LUIS =====
        $luis = User::create([
            'name' => 'Luis Martinez',
            'email' => 'luis@gmail.com',
            'password' => Hash::make('123456'),
            'age' => 28,
            'bio' => 'Action movies enthusiast. Marvel y DC son mis favoritas.',
        ]);
        Location::create([
            'user_id' => $luis->id,
            'latitude' => 19.404000,
            'longitude' => -99.170000,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $luis->favoriteGenres()->attach([1, 2, 15]); // Action, Adventure, Science Fiction
        $luis->favoriteDirectors()->create(['tmdb_id' => 19272, 'name' => 'Anthony Russo', 'profile_path' => '/iKK6zIREVvJxgkH3Cs5O3qs3n95.jpg']);
        Subscription::create(['user_id' => $luis->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        // ===== USUARIO 5: RENZO =====
        $renzo = User::create([
            'name' => 'Renzo Caycho',
            'email' => 'renzo@gmail.com',
            'password' => Hash::make('123456'),
            'age' => 25,
            'bio' => 'Drama enthusiast. Me gustan las películas con historias profundas.',
        ]);
        Location::create([
            'user_id' => $renzo->id,
            'latitude' => 19.384300,
            'longitude' => -99.176700,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $renzo->favoriteGenres()->attach([7, 10, 5]); // Drama, History, Crime
        $renzo->favoriteDirectors()->create(['tmdb_id' => 1032, 'name' => 'Martin Scorsese', 'profile_path' => '/9U9Y5GQuWX3EZy39B8nkk4NY01S.jpg']);
        Subscription::create(['user_id' => $renzo->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        // ===== USUARIO 6: CARLOS (Alta compatibilidad con Pamela) =====
        $carlos = User::create([
            'name' => 'Carlos Méndez',
            'email' => 'carlos@demo.com',
            'password' => Hash::make('123456'),
            'age' => 26,
            'bio' => 'Fan de ciencia ficción y películas de Nolan. Interstellar e Inception son mis favoritas.',
        ]);
        Location::create([
            'user_id' => $carlos->id,
            'latitude' => 19.420000,
            'longitude' => -99.150000,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $carlos->favoriteGenres()->attach([15, 1]); // Science Fiction, Action
        $carlos->favoriteDirectors()->create(['tmdb_id' => 525, 'name' => 'Christopher Nolan', 'profile_path' => '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg']);
        Subscription::create(['user_id' => $carlos->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        // ===== USUARIO 7: MARÍA =====
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
        $maria->favoriteGenres()->attach([15, 7]); // Science Fiction, Drama
        $maria->favoriteDirectors()->create(['tmdb_id' => 2710, 'name' => 'James Cameron', 'profile_path' => '/5tXGxsQyp05biKpq99NKyGRuFHX.jpg']);
        Subscription::create(['user_id' => $maria->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        // ===== USUARIO 8: DIEGO =====
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
        $diego->favoriteGenres()->attach([1, 7]); // Action, Drama
        $diego->favoriteDirectors()->create(['tmdb_id' => 525, 'name' => 'Christopher Nolan', 'profile_path' => '/xuAIuYSmsUzKlUMBFGVZaWsY3DZ.jpg']);
        Subscription::create(['user_id' => $diego->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        // ===== USUARIO 9: SOFÍA =====
        $sofia = User::create([
            'name' => 'Sofía Hernández',
            'email' => 'sofia@demo.com',
            'password' => Hash::make('123456'),
            'age' => 23,
            'bio' => 'Me encantan las comedias y películas familiares.',
        ]);
        Location::create([
            'user_id' => $sofia->id,
            'latitude' => 19.410000,
            'longitude' => -99.130000,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $sofia->favoriteGenres()->attach([4, 8, 3]); // Comedy, Family, Animation
        $sofia->favoriteDirectors()->create(['tmdb_id' => 7879, 'name' => 'Pete Docter', 'profile_path' => '/iTaSu30K0PtLo6YdC7Sh7QLsKCp.jpg']);
        Subscription::create(['user_id' => $sofia->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        // ===== USUARIO 10: MIGUEL =====
        $miguel = User::create([
            'name' => 'Miguel Ángel',
            'email' => 'miguel@demo.com',
            'password' => Hash::make('123456'),
            'age' => 30,
            'bio' => 'Aficionado a documentales y películas históricas.',
        ]);
        Location::create([
            'user_id' => $miguel->id,
            'latitude' => 19.361900,
            'longitude' => -99.270000,
            'city' => 'CDMX',
            'country' => 'México',
            'search_radius' => 2000,
        ]);
        $miguel->favoriteGenres()->attach([6, 10, 18]); // Documentary, History, War
        $miguel->favoriteDirectors()->create(['tmdb_id' => 488, 'name' => 'Steven Spielberg', 'profile_path' => '/tZxcg19YQ3e8fJ0pOs7hjlnmmr6.jpg']);
        Subscription::create(['user_id' => $miguel->id, 'subscription_plan_id' => 1, 'start_date' => now(), 'end_date' => now()->addDays(30), 'is_active' => true]);

        echo "✅ Creados 10 usuarios con ubicaciones, géneros favoritos, directores y suscripciones\n";
    }
}
