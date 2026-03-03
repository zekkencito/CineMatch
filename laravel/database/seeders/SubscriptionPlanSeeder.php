<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            ['name'=>'Basic','price'=>0,'daily_likes'=>10,'see_who_liked'=>false,'advanced_filters'=>false,'duration_days'=>30],
            ['name'=>'Silver','price'=>50,'daily_likes'=>50,'see_who_liked'=>true,'advanced_filters'=>false,'duration_days'=>30],
            ['name'=>'Gold','price'=>100,'daily_likes'=>100,'see_who_liked'=>true,'advanced_filters'=>true,'duration_days'=>30],
            ['name'=>'Platinum','price'=>200,'daily_likes'=>200,'see_who_liked'=>true,'advanced_filters'=>true,'duration_days'=>30],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['name' => $plan['name']],
                $plan
            );
        }
    }
}

