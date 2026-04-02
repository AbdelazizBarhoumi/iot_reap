<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// auth endpoints (session-based JSON)
Route::prefix('auth')->group(function () {
    // Rate-limited auth endpoints (5 attempts per minute)
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth');
});
