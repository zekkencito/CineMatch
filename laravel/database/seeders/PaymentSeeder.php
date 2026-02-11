<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('payments')->insert([
            ['amount'=>50,'user_id'=>1,'plan_id'=>3,'payment_type_id'=>1,'token'=>'TXN001','created_at'=>now(),'updated_at'=>now()],
            ['amount'=>100,'user_id'=>2,'plan_id'=>2,'payment_type_id'=>2,'token'=>'TXN002','created_at'=>now(),'updated_at'=>now()],
            ['amount'=>100,'user_id'=>3,'plan_id'=>4,'payment_type_id'=>3,'token'=>'TXN003','created_at'=>now(),'updated_at'=>now()],
            ['amount'=>50,'user_id'=>4,'plan_id'=>2,'payment_type_id'=>1,'token'=>'TXN004','created_at'=>now(),'updated_at'=>now()],
            ['amount'=>0,'user_id'=>5,'plan_id'=>1,'payment_type_id'=>4,'token'=>'TXN005','created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}

