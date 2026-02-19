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
