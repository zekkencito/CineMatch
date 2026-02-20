<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        // Géneros basados en TMDB (The Movie Database) con sus TMDB IDs oficiales
        DB::table('genres')->insert([
            ['name' => 'Action',           'tmdb_id' => 28,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Adventure',        'tmdb_id' => 12,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Animation',        'tmdb_id' => 16,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Comedy',           'tmdb_id' => 35,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Crime',            'tmdb_id' => 80,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Documentary',      'tmdb_id' => 99,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Drama',            'tmdb_id' => 18,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Family',           'tmdb_id' => 10751, 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Fantasy',          'tmdb_id' => 14,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'History',          'tmdb_id' => 36,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Horror',           'tmdb_id' => 27,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Music',            'tmdb_id' => 10402, 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Mystery',          'tmdb_id' => 9648,  'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Romance',          'tmdb_id' => 10749, 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Science Fiction',  'tmdb_id' => 878,   'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'TV Movie',         'tmdb_id' => 10770, 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Thriller',         'tmdb_id' => 53,    'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'War',              'tmdb_id' => 10752, 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Western',          'tmdb_id' => 37,    'created_at'=>now(), 'updated_at'=>now()],
        ]);
    }
}

