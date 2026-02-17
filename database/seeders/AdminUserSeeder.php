<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Administrator',
            'email' => env('DEFAULT_ADMIN_EMAIL', 'admin@example.com'),
            'password' => env('DEFAULT_ADMIN_PASSWORD', 'password'),
            'role' => UserRole::ADMIN->value,
            'email_verified_at' => now(),
        ]);
    }
}
