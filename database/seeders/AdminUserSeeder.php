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
        $admin = null;

        foreach (UserRole::cases() as $role) {
            $user = User::factory()->create([
                'name' => ucfirst(str_replace('_', ' ', $role->value)),
                'email' => $role->value.'@example.com',
                'password' => $defaultPassword,
                'role' => $role->value,
                'email_verified_at' => now(),
            ]);

            // Store admin reference for teacher approval
            if ($role->value === UserRole::ADMIN->value) {
                $admin = $user;
            }

            // Pre-approve seeded teachers (they're test accounts, not real registrations)
            if ($role->value === UserRole::TEACHER->value && $admin) {
                $user->update([
                    'teacher_approved_at' => now(),
                    'teacher_approved_by' => $admin->id,
                ]);
            }
        }
    }
}
