<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MovieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('movies')->insert([
            ['title' => 'Inception', 'release_year' => 2010, 'created_at'=>now(), 'updated_at'=>now()],
            ['title' => 'Titanic', 'release_year' => 1997, 'created_at'=>now(), 'updated_at'=>now()],
            ['title' => 'The Conjuring', 'release_year' => 2013, 'created_at'=>now(), 'updated_at'=>now()],
            ['title' => 'Avengers: Endgame', 'release_year' => 2019, 'created_at'=>now(), 'updated_at'=>now()],
            ['title' => 'Interstellar', 'release_year' => 2014, 'created_at'=>now(), 'updated_at'=>now()],
        ]);
    }
}
