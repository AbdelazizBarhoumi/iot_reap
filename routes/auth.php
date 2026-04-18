<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleOAuthController;
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

// Google OAuth routes
Route::prefix('auth/oauth')->group(function () {
    Route::get('/google/redirect', [GoogleOAuthController::class, 'redirect'])->name('google.redirect');
    Route::get('/google/callback', [GoogleOAuthController::class, 'callback'])->name('google.callback');
    Route::post('/google/auth-code', [GoogleOAuthController::class, 'handleAuthCode'])->name('google.auth-code');
    Route::get('/google/role-selection', [GoogleOAuthController::class, 'showRoleSelection'])->name('google.role-selection');
    Route::post('/google/complete-signup', [GoogleOAuthController::class, 'completeSignup'])->name('google.complete-signup');
});
