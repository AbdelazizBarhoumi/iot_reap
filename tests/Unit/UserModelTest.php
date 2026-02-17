<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_primary_key_is_id(): void
    {
        $this->assertEquals('id', (new User())->getKeyName());
    }

    public function test_role_is_cast_to_enum(): void
    {
        $user = User::factory()->create();

        $this->assertInstanceOf(UserRole::class, $user->role);
        $this->assertEquals(UserRole::ENGINEER, $user->role);
    }
}
