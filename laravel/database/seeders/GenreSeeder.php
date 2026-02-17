<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        // Géneros basados en TMDB (The Movie Database)
        DB::table('genres')->insert([
            ['name' => 'Action', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Adventure', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Animation', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Comedy', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Crime', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Documentary', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Drama', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Family', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Fantasy', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'History', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Horror', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Music', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Mystery', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Romance', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Science Fiction', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'TV Movie', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Thriller', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'War', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Western', 'created_at'=>now(), 'updated_at'=>now()],
        ]);
    }
}

