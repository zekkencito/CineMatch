<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserFavoriteDirectorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('user_favorite_directors')->insert([
            ['user_id'=>1,'director_id'=>1],
            ['user_id'=>2,'director_id'=>2],
            ['user_id'=>3,'director_id'=>3],
            ['user_id'=>4,'director_id'=>4],
            ['user_id'=>5,'director_id'=>1],
        ]);
    }
}

