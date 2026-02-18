<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrowserLogController;
use App\Http\Controllers\VMSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::post('/browser-log', [BrowserLogController::class, 'store']);

// auth endpoints (session-based JSON)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// VM session API endpoints (protected by auth middleware)
Route::middleware('auth')->group(function () {
    Route::get('/sessions', [VMSessionController::class, 'index']);
    Route::post('/sessions', [VMSessionController::class, 'store']);
    Route::get('/sessions/{id}', [VMSessionController::class, 'show']);
    Route::delete('/sessions/{id}', [VMSessionController::class, 'destroy']);
});

require __DIR__.'/settings.php';
