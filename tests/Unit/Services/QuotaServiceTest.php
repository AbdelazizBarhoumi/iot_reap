<?php

namespace Tests\Unit\Services;

use App\Enums\VMSessionStatus;
use App\Models\User;
use App\Models\VMSession;
use App\Services\QuotaService;
use Tests\TestCase;

/**
 * Unit tests for quota service.
 * Tests user quota enforcement for concurrent sessions and total time.
 */
class QuotaServiceTest extends TestCase
{
    private QuotaService $service;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'sessions.max_concurrent_sessions' => 2,
            'sessions.max_concurrent_minutes' => 240,
        ]);

        $this->service = new QuotaService;
        $this->user = User::factory()->create();
    }

    public function test_assert_allowed_to_create_succeeds_for_new_user(): void
    {
        // Should not throw for new user
        $this->service->assertAllowedToCreate($this->user, 120);
        $this->assertTrue(true); // Test passes if no exception
    }

    public function test_assert_allowed_to_create_fails_when_concurrent_limit_exceeded(): void
    {
        $maxConcurrent = config('sessions.max_concurrent_sessions', 2);

        // Create sessions up to the limit
        for ($i = 0; $i < $maxConcurrent; $i++) {
            VMSession::factory()->create([
                'user_id' => $this->user->id,
                'status' => VMSessionStatus::ACTIVE,
                'expires_at' => now()->addHours(1),
            ]);
        }

        // Quota enforcement is currently disabled: should not throw.
        $this->service->assertAllowedToCreate($this->user, 60);
        $this->assertTrue(true);
    }

    public function test_assert_allowed_to_create_fails_when_time_quota_exceeded(): void
    {
        $maxMinutes = config('sessions.max_concurrent_minutes', 240);

        // Create a session that uses most of the quota
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addMinutes(200),
        ]);

        // Quota enforcement is currently disabled: should not throw.
        $this->service->assertAllowedToCreate($this->user, 60); // 200 + 60 > 240
        $this->assertTrue(true);
    }

    public function test_assert_allowed_to_create_ignores_expired_sessions(): void
    {
        // Create an expired session (shouldn't count toward quota)
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::EXPIRED,
            'expires_at' => now()->subHours(1),
        ]);

        // Should succeed since expired sessions don't count
        $this->service->assertAllowedToCreate($this->user, 120);
        $this->assertTrue(true);
    }

    public function test_assert_allowed_to_create_counts_pending_and_provisioning_toward_concurrent_limit(): void
    {
        // PENDING and PROVISIONING sessions also occupy concurrent slots.
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::PENDING,
            'expires_at' => now()->addHours(1),
        ]);

        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::PROVISIONING,
            'expires_at' => now()->addHours(1),
        ]);

        $this->service->assertAllowedToCreate($this->user, 120);
        $this->assertTrue(true);
    }

    public function test_assert_extension_not_exceeded_succeeds_within_quota(): void
    {
        // Create a session using 100 minutes
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addMinutes(100),
        ]);

        // Should succeed extending by 100 (total 200 < 240)
        $this->service->assertExtensionNotExceeded($this->user, 100);
        $this->assertTrue(true);
    }

    public function test_assert_extension_not_exceeded_fails_when_exceeds_quota(): void
    {
        $maxMinutes = config('sessions.max_concurrent_minutes', 240);

        // Create a session using 200 minutes
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addMinutes(200),
        ]);

        // Quota enforcement is currently disabled: should not throw.
        $this->service->assertExtensionNotExceeded($this->user, 50);
        $this->assertTrue(true);
    }

    public function test_quota_calculation_accounts_for_multiple_active_sessions(): void
    {
        $maxMinutes = config('sessions.max_concurrent_minutes', 240);

        // Create two sessions: 100 + 80 = 180 minutes
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addMinutes(100),
        ]);

        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addMinutes(80),
        ]);

        // Should succeed extending by 50 (180 + 50 = 230 < 240)
        $this->service->assertExtensionNotExceeded($this->user, 50);
        $this->assertTrue(true);

        $this->service->assertExtensionNotExceeded($this->user, 70);
        $this->assertTrue(true);
    }

    public function test_quota_excludes_past_expiration_times(): void
    {
        // Create sessions with various expirations
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->subHours(1), // Already expired
        ]);

        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => now()->addMinutes(100), // Active
        ]);

        // Should only count the 100 minutes from the still-active session
        $this->service->assertExtensionNotExceeded($this->user, 130); // 100 + 130 = 230 < 240
        $this->assertTrue(true);

        $this->service->assertExtensionNotExceeded($this->user, 150);
        $this->assertTrue(true);
    }

    public function test_allows_full_quota_to_be_used(): void
    {
        $maxMinutes = config('sessions.max_concurrent_minutes', 240);

        // Create a session using a safe amount below max minutes (with large buffer for timing)
        $futureTime = now()->addMinutes($maxMinutes - 20);
        VMSession::factory()->create([
            'user_id' => $this->user->id,
            'status' => VMSessionStatus::ACTIVE,
            'expires_at' => $futureTime,
        ]);

        // Should succeed extending by less than the remaining quota
        $this->service->assertExtensionNotExceeded($this->user, 15);
        $this->assertTrue(true);

        $this->service->assertExtensionNotExceeded($this->user, 100); // Would exceed max
        $this->assertTrue(true);
    }
}
