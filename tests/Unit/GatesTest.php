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

    public function test_admin_only_gate_works(): void
    {
        $engineer = User::factory()->engineer()->create();
        $admin = User::factory()->admin()->create();

        $this->assertFalse(Gate::forUser($engineer)->allows('admin-only'));
        $this->assertTrue(Gate::forUser($admin)->allows('admin-only'));
    }

    public function test_security_officer_only_gate_works(): void
    {
        $engineer = User::factory()->engineer()->create();
        $officer = User::factory()->securityOfficer()->create();

        $this->assertFalse(Gate::forUser($engineer)->allows('security-officer-only'));
        $this->assertTrue(Gate::forUser($officer)->allows('security-officer-only'));
    }

    public function test_provision_vm_gate_allows_engineer_and_admin(): void
    {
        $engineer = User::factory()->engineer()->create();
        $admin = User::factory()->admin()->create();
        $officer = User::factory()->securityOfficer()->create();

        $this->assertTrue(Gate::forUser($engineer)->allows('provision-vm'));
        $this->assertTrue(Gate::forUser($admin)->allows('provision-vm'));
        $this->assertFalse(Gate::forUser($officer)->allows('provision-vm'));
    }

    public function test_generic_role_gate_works(): void
    {
        $admin = User::factory()->admin()->create();

        $this->assertTrue(Gate::forUser($admin)->allows('role', UserRole::ADMIN->value));
        $this->assertFalse(Gate::forUser($admin)->allows('role', UserRole::ENGINEER->value));
    }
}
