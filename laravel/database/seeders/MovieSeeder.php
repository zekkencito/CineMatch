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
            [
                'title' => 'Inception', 
                'release_year' => 2010, 
                'poster_url' => 'https://image.tmdb.org/t/p/w500/8IBcEOpxy6vFt8qKkXwUEEw8Z1q.jpg',
                'description' => 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                'created_at'=>now(), 
                'updated_at'=>now()
            ],
            [
                'title' => 'Titanic', 
                'release_year' => 1997, 
                'poster_url' => 'https://image.tmdb.org/t/p/w500/9xjHzS2lSjCTsx1DkTmNqw7uhZS.jpg',
                'description' => 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
                'created_at'=>now(), 
                'updated_at'=>now()
            ],
            [
                'title' => 'The Conjuring', 
                'release_year' => 2013, 
                'poster_url' => 'https://image.tmdb.org/t/p/w500/4hB9y4qNzJeyxWkOqJ2WfBFaM7M.jpg',
                'description' => 'Paranormal investigators work to help a family terrorized by a dark presence in their farmhouse.',
                'created_at'=>now(), 
                'updated_at'=>now()
            ],
            [
                'title' => 'Avengers: Endgame', 
                'release_year' => 2019, 
                'poster_url' => 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukz1zpg4zmnJaw.jpg',
                'description' => 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos actions.',
                'created_at'=>now(), 
                'updated_at'=>now()
            ],
            [
                'title' => 'Interstellar', 
                'release_year' => 2014, 
                'poster_url' => 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
                'description' => 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
                'created_at'=>now(), 
                'updated_at'=>now()
            ],
        ]);
    }
}
