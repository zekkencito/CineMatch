<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('payment_types')->insert([
            ['name'=>'Credit Card','type'=>'Credit Card','created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Debit Card','type'=>'Debit Card','created_at'=>now(),'updated_at'=>now()],
            ['name'=>'PayPal','type'=>'PayPal','created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Mercado Pago','type'=>'Mercado Pago','created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Bank Transfer','type'=>'Bank Transfer','created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}

