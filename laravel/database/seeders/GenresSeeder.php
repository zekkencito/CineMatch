<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenresSeeder extends Seeder
{
    /**
     * Seed the genres table with TMDB genre IDs
     * Estos son los géneros oficiales de TMDB
     */
    public function run(): void
    {
        $genres = [
            ['id' => 28, 'name' => 'Acción'],
            ['id' => 12, 'name' => 'Aventura'],
            ['id' => 16, 'name' => 'Animación'],
            ['id' => 35, 'name' => 'Comedia'],
            ['id' => 80, 'name' => 'Crimen'],
            ['id' => 99, 'name' => 'Documental'],
            ['id' => 18, 'name' => 'Drama'],
            ['id' => 10751, 'name' => 'Familia'],
            ['id' => 14, 'name' => 'Fantasía'],
            ['id' => 36, 'name' => 'Historia'],
            ['id' => 27, 'name' => 'Terror'],
            ['id' => 10402, 'name' => 'Música'],
            ['id' => 9648, 'name' => 'Misterio'],
            ['id' => 10749, 'name' => 'Romance'],
            ['id' => 878, 'name' => 'Ciencia ficción'],
            ['id' => 10770, 'name' => 'Película de TV'],
            ['id' => 53, 'name' => 'Suspense'],
            ['id' => 10752, 'name' => 'Bélica'],
            ['id' => 37, 'name' => 'Western'],
        ];

        foreach ($genres as $genre) {
            DB::table('genres')->updateOrInsert(
                ['id' => $genre['id']],
                ['name' => $genre['name'], 'created_at' => now(), 'updated_at' => now()]
            );
        }

        $this->command->info('✅ Géneros de TMDB insertados correctamente');
    }
}
