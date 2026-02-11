<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserFavoriteGenreSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('user_favorite_genres')->insert([
            ['user_id'=>1,'genre_id'=>5],
            ['user_id'=>2,'genre_id'=>4],
            ['user_id'=>3,'genre_id'=>3],
            ['user_id'=>4,'genre_id'=>1],
            ['user_id'=>5,'genre_id'=>2],
        ]);
    }
}

