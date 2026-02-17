<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            UserSeeder::class,
            // DirectorSeeder::class, // Comentado: Ahora se usa TMDB para directores
            GenreSeeder::class,
            LocationSeeder::class,
            // MovieSeeder::class, // Comentado: Ahora se usa TMDB para películas
            // GallerySeeder::class, // Comentado: Dependía de movies
            // DirectorMovieSeeder::class, // Comentado: Dependía de movies/directors
            // GenreMovieSeeder::class, // Comentado: Dependía de movies
            SubscriptionPlanSeeder::class,
            PaymentTypeSeeder::class,
            // PaymentSeeder::class, // Comentado: Depende de usuarios específicos
            // UserMovieRatingSeeder::class, // Comentado: Dependía de movies
            // WatchedMovieSeeder::class, // Comentado: Dependía de movies
            UserFavoriteGenreSeeder::class,
            // UserFavoriteDirectorSeeder::class, // Comentado: Ahora usa TMDB IDs
            // LikeSeeder::class, // Comentado: Depende de usuarios específicos
            // MatchSeeder::class, // Comentado: Depende de usuarios específicos
        ]);
    }
}
