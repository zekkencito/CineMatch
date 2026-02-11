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
            ['type'=>'Credit Card','created_at'=>now(),'updated_at'=>now()],
            ['type'=>'Debit Card','created_at'=>now(),'updated_at'=>now()],
            ['type'=>'PayPal','created_at'=>now(),'updated_at'=>now()],
            ['type'=>'Mercado Pago','created_at'=>now(),'updated_at'=>now()],
            ['type'=>'Bank Transfer','created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}

