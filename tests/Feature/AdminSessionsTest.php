<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\VMSessionStatus;
use App\Models\User;
use App\Models\VMSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSessionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_see_all_active_sessions_with_all_param(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Active session for user 1
        VMSession::factory()->create([
            'user_id' => $user1->id,
            'status' => VMSessionStatus::ACTIVE,
        ]);

        // Active session for user 2
        VMSession::factory()->create([
            'user_id' => $user2->id,
            'status' => VMSessionStatus::ACTIVE,
        ]);

        // Expired session for user 1 (should not be shown in findAllActive)
        VMSession::factory()->create([
            'user_id' => $user1->id,
            'status' => VMSessionStatus::EXPIRED,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/sessions?all=1');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_regular_user_cannot_see_others_sessions_even_with_all_param(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Active session for user 1
        VMSession::factory()->create([
            'user_id' => $user1->id,
            'status' => VMSessionStatus::ACTIVE,
        ]);

        // Active session for user 2
        VMSession::factory()->create([
            'user_id' => $user2->id,
            'status' => VMSessionStatus::ACTIVE,
        ]);

        $response = $this->actingAs($user1)
            ->getJson('/sessions?all=1');

        // Should only see their own session
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_sees_only_own_sessions_without_all_param(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $user1 = User::factory()->create();

        // Active session for admin
        VMSession::factory()->create([
            'user_id' => $admin->id,
            'status' => VMSessionStatus::ACTIVE,
        ]);

        // Active session for user 1
        VMSession::factory()->create([
            'user_id' => $user1->id,
            'status' => VMSessionStatus::ACTIVE,
        ]);

        $response = $this->actingAs($admin)
            ->getJson('/sessions');

        // Should only see their own session by default (standard index behavior)
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}
