<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MatchSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('matches')->insert([
            ['user_one_id'=>1,'user_two_id'=>2,'matched_at'=>now()],
            ['user_one_id'=>3,'user_two_id'=>4,'matched_at'=>now()],
            ['user_one_id'=>2,'user_two_id'=>3,'matched_at'=>now()],
            ['user_one_id'=>4,'user_two_id'=>5,'matched_at'=>now()],
            ['user_one_id'=>1,'user_two_id'=>3,'matched_at'=>now()],
        ]);
    }
}

