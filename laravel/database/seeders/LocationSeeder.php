<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('locations')->insert([
            ['user_id'=>1,'latitude'=>19.4326,'longitude'=>-99.1332,'city'=>'CDMX','country'=>'Mexico','created_at'=>now(),'updated_at'=>now()],
            ['user_id'=>2,'latitude'=>20.6597,'longitude'=>-103.3496,'city'=>'Guadalajara','country'=>'Mexico','created_at'=>now(),'updated_at'=>now()],
            ['user_id'=>3,'latitude'=>25.6866,'longitude'=>-100.3161,'city'=>'Monterrey','country'=>'Mexico','created_at'=>now(),'updated_at'=>now()],
            ['user_id'=>4,'latitude'=>21.1619,'longitude'=>-86.8515,'city'=>'Cancun','country'=>'Mexico','created_at'=>now(),'updated_at'=>now()],
            ['user_id'=>5,'latitude'=>19.0414,'longitude'=>-98.2063,'city'=>'Puebla','country'=>'Mexico','created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}

