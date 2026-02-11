<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DirectorMovieSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('director_movie')->insert([
            ['movie_id'=>1,'director_id'=>1],
            ['movie_id'=>2,'director_id'=>2],
            ['movie_id'=>3,'director_id'=>3],
            ['movie_id'=>4,'director_id'=>4],
            ['movie_id'=>5,'director_id'=>1],
        ]);
    }
}

