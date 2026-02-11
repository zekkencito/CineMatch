<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('genres')->insert([
            ['name' => 'Action', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Drama', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Romance', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Horror', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Sci-Fi', 'created_at'=>now(), 'updated_at'=>now()],
        ]);
    }
}

