<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('subscription_plans')->insert([
            ['name'=>'Basic','price'=>0,'daily_likes'=>10,'see_who_liked'=>false,'advanced_filters'=>false,'duration_days'=>30,'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Silver','price'=>50,'daily_likes'=>50,'see_who_liked'=>true,'advanced_filters'=>false,'duration_days'=>30,'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Gold','price'=>100,'daily_likes'=>100,'see_who_liked'=>true,'advanced_filters'=>true,'duration_days'=>30,'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Platinum','price'=>200,'daily_likes'=>200,'see_who_liked'=>true,'advanced_filters'=>true,'duration_days'=>30,'created_at'=>now(),'updated_at'=>now()]
        ]);
    }
}

