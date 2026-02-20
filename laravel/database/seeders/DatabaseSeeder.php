<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * ORDEN CORRECTO:
     * 1. SubscriptionPlanSeeder - Planes de suscripción (Basic, Silver, Gold, Platinum)
     * 2. PaymentTypeSeeder - Tipos de pago (Credit Card, PayPal, etc.)
     * 3. GenreSeeder - Géneros de películas (Action, Drama, etc.)
     * 4. UserSeeder - Usuarios con ubicaciones, géneros favoritos, directores y suscripciones
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            SubscriptionPlanSeeder::class,
            PaymentTypeSeeder::class,
            GenreSeeder::class,
            UserSeeder::class,
        ]);

        echo "\n🎉 Base de datos poblada exitosamente\n";
        echo "📧 Usuarios de prueba:\n";
        echo "   - pamela@gmail.com (password: 123456)\n";
        echo "   - roberto@gmail.com (password: 123456)\n";
        echo "   - ana@gmail.com (password: 123456)\n";
        echo "   - luis@gmail.com (password: 123456)\n";
        echo "   - renzo@gmail.com (password: 123456)\n";
        echo "   + 5 usuarios adicionales (carlos@demo.com, maria@demo.com, etc.)\n\n";
    }
}
