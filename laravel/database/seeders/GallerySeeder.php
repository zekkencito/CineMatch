<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GallerySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('galleries')->insert([
            ['movie_id'=>1,'photo'=>'inception.jpg','created_at'=>now(),'updated_at'=>now()],
            ['movie_id'=>2,'photo'=>'titanic.jpg','created_at'=>now(),'updated_at'=>now()],
            ['movie_id'=>3,'photo'=>'conjuring.jpg','created_at'=>now(),'updated_at'=>now()],
            ['movie_id'=>4,'photo'=>'endgame.jpg','created_at'=>now(),'updated_at'=>now()],
            ['movie_id'=>5,'photo'=>'interstellar.jpg','created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}

