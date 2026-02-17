<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class GatesTest extends TestCase
{
    use RefreshDatabase;

    public function test_isAdmin_gate_and_role_gate_work_as_expected(): void
    {
        $engineer = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::ADMIN->value]);

        $this->assertFalse(Gate::forUser($engineer)->allows('isAdmin'));
        $this->assertTrue(Gate::forUser($admin)->allows('isAdmin'));

        $this->assertFalse(Gate::forUser($engineer)->allows('role', UserRole::ADMIN->value));
        $this->assertTrue(Gate::forUser($admin)->allows('role', UserRole::ADMIN->value));
    }
}
