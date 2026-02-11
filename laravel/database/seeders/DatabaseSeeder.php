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
            DirectorSeeder::class,
            GenreSeeder::class,
            LocationSeeder::class,
            MovieSeeder::class,
            GallerySeeder::class,
            DirectorMovieSeeder::class,
            GenreMovieSeeder::class,
            SubscriptionPlanSeeder::class,
            PaymentTypeSeeder::class,
            PaymentSeeder::class,
            UserMovieRatingSeeder::class,
            WatchedMovieSeeder::class,
            UserFavoriteGenreSeeder::class,
            UserFavoriteDirectorSeeder::class,
            LikeSeeder::class,
            MatchSeeder::class,
        ]);
    }
}
