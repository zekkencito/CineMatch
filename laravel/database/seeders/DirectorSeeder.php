<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DirectorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('directors')->insert([
            ['name' => 'Christopher Nolan', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'James Cameron', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'James Wan', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Anthony Russo', 'created_at'=>now(), 'updated_at'=>now()],
            ['name' => 'Joe Russo', 'created_at'=>now(), 'updated_at'=>now()],
        ]);
    }
}

