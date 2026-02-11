<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LikeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('likes')->insert([
            ['from_user_id'=>1,'to_user_id'=>2,'type'=>'like','created_at'=>now(),'updated_at'=>now()],
            ['from_user_id'=>2,'to_user_id'=>1,'type'=>'like','created_at'=>now(),'updated_at'=>now()],
            ['from_user_id'=>3,'to_user_id'=>4,'type'=>'like','created_at'=>now(),'updated_at'=>now()],
            ['from_user_id'=>4,'to_user_id'=>3,'type'=>'like','created_at'=>now(),'updated_at'=>now()],
            ['from_user_id'=>5,'to_user_id'=>1,'type'=>'dislike','created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}

