<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SubscriptionController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Rutas de retorno de PayPal
Route::get('/paypal/return', [SubscriptionController::class, 'handlePayPalReturn'])->name('paypal.return');
Route::get('/paypal/cancel', [SubscriptionController::class, 'handlePayPalCancel'])->name('paypal.cancel');
Route::get('/sembrar-datos', function () {
    try {
        // Esto hace exactamente lo mismo que escribir "php artisan db:seed --force" en la terminal
        Artisan::call('db:seed', ['--force' => true]);
        return "¡Base de datos poblada con éxito!";
    } catch (\Exception $e) {
        return "Hubo un error: " . $e->getMessage();
    }
});

Route::get('/reset-database', function () {
    try {
        // Primero ejecuta las migraciones frescas
        Artisan::call('migrate:fresh', ['--force' => true]);
        // Luego ejecuta los seeders
        Artisan::call('db:seed', ['--force' => true]);
        
        $output = "✅ Base de datos reiniciada con éxito!\n\n";
        $output .= "Migraciones ejecutadas: " . Artisan::output() . "\n";
        $output .= "\n🎉 15 usuarios creados (ver UserSeeder)";
        
        return nl2br($output);
    } catch (\Exception $e) {
        return "❌ Error: " . $e->getMessage() . "\n\n" . $e->getTraceAsString();
    }
});