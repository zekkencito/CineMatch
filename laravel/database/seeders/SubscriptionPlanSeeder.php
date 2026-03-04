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
            ['name'=>'Free','price'=>0,'daily_likes'=>10,'see_who_liked'=>false,'advanced_filters'=>false,'duration_days'=>30],
            ['name'=>'Premium','price'=>9.99,'daily_likes'=>999,'see_who_liked'=>true,'advanced_filters'=>true,'duration_days'=>30],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['name' => $plan['name']],
                $plan
            );
        }
    }
}

