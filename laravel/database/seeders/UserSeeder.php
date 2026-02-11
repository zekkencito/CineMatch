<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name' => 'Pamela Tarelo',
                'email' => 'pamela@gmail.com',
                'password' => Hash::make('123456'),
                'age' => 21,
                'bio' => 'I love sci-fi movies',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Roberto Gomez',
                'email' => 'roberto@gmail.com',
                'password' => Hash::make('123456'),
                'age' => 24,
                'bio' => 'Horror fan',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Ana Lopez',
                'email' => 'ana@gmail.com',
                'password' => Hash::make('123456'),
                'age' => 21,
                'bio' => 'Romantic movies lover',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Luis Martinez',
                'email' => 'luis@gmail.com',
                'password' => Hash::make('123456'),
                'age' => 28,
                'bio' => 'Action movies',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Renzo Caycho',
                'email' => 'renzo@gmail.com',
                'password' => Hash::make('123456'),
                'age' => 25,
                'bio' => 'Drama enthusiast',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}
