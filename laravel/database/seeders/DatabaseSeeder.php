<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
{
    $this->call([
        UserSeeder::class,
        LocationSeeder::class,
        MovieSeeder::class,
        GallerySeeder::class,
        GenreSeeder::class,
        GenreMovieSeeder::class,
        DirectorSeeder::class,
        DirectorMovieSeeder::class,
        UserMovieRatingSeeder::class,
        WatchedMovieSeeder::class,
        UserFavoriteGenreSeeder::class,
        UserFavoriteDirectorSeeder::class,
        LikeSeeder::class,
        MatchSeeder::class,
        SubscriptionPlanSeeder::class,
        PaymentTypeSeeder::class,
        PaymentSeeder::class,
    ]);
}
}
