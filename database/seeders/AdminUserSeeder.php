<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // create one user per role using a consistent password
        $defaultPassword = env('DEFAULT_ADMIN_PASSWORD', 'password');

        foreach (UserRole::cases() as $role) {
            User::factory()->create([
                'name' => ucfirst(str_replace('_', ' ', $role->value)),
                'email' => $role->value.'@example.com',
                'password' => $defaultPassword,
                'role' => $role->value,
                'email_verified_at' => now(),
            ]);
        }
    }
}
