<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WatchedMovieSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('watched_movies')->insert([
            ['user_id'=>1,'movie_id'=>1,'watched_date'=>'2024-01-10'],
            ['user_id'=>2,'movie_id'=>2,'watched_date'=>'2024-02-15'],
            ['user_id'=>3,'movie_id'=>3,'watched_date'=>'2024-03-20'],
            ['user_id'=>4,'movie_id'=>4,'watched_date'=>'2024-04-05'],
            ['user_id'=>5,'movie_id'=>5,'watched_date'=>'2024-05-12'],
        ]);
    }
}

