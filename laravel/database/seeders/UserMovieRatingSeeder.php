<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserMovieRatingSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('user_movie_ratings')->insert([
            ['user_id'=>1,'movie_id'=>1,'rating'=>5],
            ['user_id'=>2,'movie_id'=>2,'rating'=>4],
            ['user_id'=>3,'movie_id'=>3,'rating'=>3],
            ['user_id'=>4,'movie_id'=>4,'rating'=>5],
            ['user_id'=>5,'movie_id'=>5,'rating'=>4],
        ]);
    }
}

