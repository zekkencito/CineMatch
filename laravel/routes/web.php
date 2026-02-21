<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
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

Route::get('/run-migrations', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        return "✅ Migraciones ejecutadas con éxito!<br><br>" . nl2br(Artisan::output());
    } catch (\Exception $e) {
        return "❌ Error: " . $e->getMessage();
    }
});

Route::get('/check-tables', function () {
    $tables = ['users', 'personal_access_tokens', 'subscriptions', 'user_favorite_genres', 'watched_movies', 'locations'];
    $result = [];
    foreach ($tables as $table) {
        $exists = Schema::hasTable($table);
        $count = $exists ? DB::table($table)->count() : 'N/A';
        $result[] = ($exists ? '✅' : '❌') . " {$table}: " . ($exists ? "{$count} rows" : 'NOT FOUND');
    }
    return implode('<br>', $result);
});

Route::get('/reset-database', function () {
    try {
        $output = "✅ Iniciando reset...\n\n";
        
        $exit1 = Artisan::call('migrate:fresh', ['--force' => true]);
        $output .= "Migrate Exit Code: " . $exit1 . "\n";
        $output .= "Migrate Output:\n" . Artisan::output() . "\n\n";
        
        $exit2 = Artisan::call('db:seed', ['--force' => true]);
        $output .= "Seed Exit Code: " . $exit2 . "\n";
        $output .= "Seed Output:\n" . Artisan::output() . "\n\n";
        
        return nl2br($output);
    } catch (\Exception $e) {
        return "❌ Error: " . $e->getMessage() . "\n\n" . $e->getTraceAsString();
    }
});

Route::get('/fix-tokens', function () {
    try {
        Artisan::call('migrate', [
            '--path' => 'vendor/laravel/sanctum/database/migrations',
            '--force' => true
        ]);
        return "✅ Tabla de tokens (personal_access_tokens) creada exitosamente!<br><br>" . nl2br(Artisan::output());
    } catch (\Exception $e) {
        return "❌ Error: " . $e->getMessage();
    }
});