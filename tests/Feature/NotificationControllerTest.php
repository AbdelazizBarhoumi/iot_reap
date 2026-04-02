<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Authentication Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_access_notifications(): void
    {
        $response = $this->getJson('/notifications');

        $response->assertUnauthorized();
    }

    public function test_unauthenticated_user_cannot_access_recent_notifications(): void
    {
        $response = $this->getJson('/notifications/recent');

        $response->assertUnauthorized();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Get Notifications Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_get_their_notifications(): void
    {
        // Create notifications for the user
        Notification::factory()->count(3)->create([
            'user_id' => $this->user->id,
        ]);

        // Create notifications for other user (should not be returned)
        Notification::factory()->count(2)->create([
            'user_id' => $this->otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications');

        $response->assertOk()
            ->assertJsonStructure([
                'notifications' => [
                    '*' => ['id', 'type', 'title', 'message'],
                ],
                'unread_count',
                'pagination',
            ])
            ->assertJsonCount(3, 'notifications');
    }

    public function test_user_can_filter_unread_notifications(): void
    {
        // Create mix of read and unread notifications
        Notification::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'read_at' => null, // Unread
        ]);

        Notification::factory()->create([
            'user_id' => $this->user->id,
            'read_at' => now(), // Read
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications?unread_only=true');

        $response->assertOk()
            ->assertJsonCount(2, 'notifications');
    }

    public function test_user_can_get_recent_notifications(): void
    {
        Notification::factory()->count(5)->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications/recent?limit=3');

        $response->assertOk()
            ->assertJsonStructure([
                'notifications' => [
                    '*' => ['id', 'type', 'title', 'message'],
                ],
                'unread_count',
            ])
            ->assertJsonCount(3, 'notifications');
    }

    public function test_recent_notifications_respects_limit(): void
    {
        Notification::factory()->count(15)->create([
            'user_id' => $this->user->id,
        ]);

        // Test default limit
        $response = $this->actingAs($this->user)
            ->getJson('/notifications/recent');

        $response->assertOk()
            ->assertJsonCount(10, 'notifications');

        // Test custom limit
        $response = $this->actingAs($this->user)
            ->getJson('/notifications/recent?limit=5');

        $response->assertJsonCount(5, 'notifications');

        // Test max limit enforcement
        $response = $this->actingAs($this->user)
            ->getJson('/notifications/recent?limit=50');

        $response->assertJsonCount(15, 'notifications'); // Should be capped at 20 or actual count
    }

    // ────────────────────────────────────────────────────────────────────────
    // Unread Count Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_get_unread_count(): void
    {
        // Create unread notifications
        Notification::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'read_at' => null,
        ]);

        // Create read notifications
        Notification::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications/unread-count');

        $response->assertOk()
            ->assertJson(['count' => 3]);
    }

    public function test_unread_count_returns_zero_when_no_unread_notifications(): void
    {
        // Create only read notifications
        Notification::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications/unread-count');

        $response->assertOk()
            ->assertJson(['count' => 0]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Mark as Read Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_mark_notification_as_read(): void
    {
        $notification = Notification::factory()->create([
            'user_id' => $this->user->id,
            'read_at' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/notifications/{$notification->id}/read");

        $response->assertOk()
            ->assertJsonStructure([
                'notification' => ['id', 'read'],
            ]);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_cannot_mark_others_notification_as_read(): void
    {
        $notification = Notification::factory()->create([
            'user_id' => $this->otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/notifications/{$notification->id}/read");

        $response->assertNotFound();
    }

    public function test_returns_404_for_nonexistent_notification(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/notifications/fake-uuid/read');

        $response->assertNotFound();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Mark Many as Read Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_mark_multiple_notifications_as_read(): void
    {
        $notifications = Notification::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'read_at' => null,
        ]);

        $notificationIds = $notifications->pluck('id')->toArray();

        $response = $this->actingAs($this->user)
            ->postJson('/notifications/mark-many-read', [
                'notification_ids' => $notificationIds,
            ]);

        $response->assertOk()
            ->assertJsonStructure([
                'marked_count',
                'unread_count',
            ])
            ->assertJson(['marked_count' => 3]);

        foreach ($notifications as $notification) {
            $this->assertNotNull($notification->fresh()->read_at);
        }
    }

    public function test_mark_many_validates_notification_ids(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/notifications/mark-many-read', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['notification_ids']);
    }

    public function test_mark_many_validates_uuid_format(): void
    {
        $validNotification = Notification::factory()->create([
            'user_id' => $this->user->id,
            'read_at' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/notifications/mark-many-read', [
                'notification_ids' => [
                    $validNotification->id,
                    'invalid-uuid',
                    'another-invalid-uuid',
                ],
            ]);

        $response->assertUnprocessable(); // Should fail validation for invalid UUIDs
    }

    // ────────────────────────────────────────────────────────────────────────
    // Mark All as Read Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        Notification::factory()->count(5)->create([
            'user_id' => $this->user->id,
            'read_at' => null,
        ]);

        // Create some already read notifications
        Notification::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/notifications/mark-all-read');

        $response->assertOk()
            ->assertJson([
                'marked_count' => 5,
                'unread_count' => 0,
            ]);

        $unreadCount = $this->user->notifications()->whereNull('read_at')->count();
        $this->assertEquals(0, $unreadCount);
    }

    public function test_mark_all_returns_zero_when_no_unread_notifications(): void
    {
        // Create only read notifications
        Notification::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/notifications/mark-all-read');

        $response->assertOk()
            ->assertJson([
                'marked_count' => 0,
                'unread_count' => 0,
            ]);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Delete Notification Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_user_can_delete_their_notification(): void
    {
        $notification = Notification::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/notifications/{$notification->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Notification deleted']);

        $this->assertDatabaseMissing('notifications', [
            'id' => $notification->id,
        ]);
    }

    public function test_user_cannot_delete_others_notification(): void
    {
        $notification = Notification::factory()->create([
            'user_id' => $this->otherUser->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/notifications/{$notification->id}");

        $response->assertNotFound();

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
        ]);
    }

    public function test_delete_returns_404_for_nonexistent_notification(): void
    {
        $response = $this->actingAs($this->user)
            ->deleteJson('/notifications/fake-uuid');

        $response->assertNotFound();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Pagination Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_notifications_are_paginated(): void
    {
        Notification::factory()->count(25)->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications?per_page=10');

        $response->assertOk()
            ->assertJsonCount(10, 'notifications')
            ->assertJsonStructure([
                'pagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ])
            ->assertJsonPath('pagination.total', 25)
            ->assertJsonPath('pagination.per_page', 10);
    }

    public function test_per_page_is_limited_to_maximum(): void
    {
        Notification::factory()->count(60)->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications?per_page=100'); // Requesting more than max

        $response->assertOk()
            ->assertJsonCount(50, 'notifications'); // Should be capped at max (50)
    }

    // ────────────────────────────────────────────────────────────────────────
    // Service Integration Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_service_methods_are_called_correctly(): void
    {
        // Create test data
        $notifications = Notification::factory()->count(3)->create([
            'user_id' => $this->user->id,
            'read_at' => null,
        ]);

        // Make the request
        $response = $this->actingAs($this->user)
            ->getJson('/notifications');

        // Verify the response
        $response->assertOk()
            ->assertJsonStructure([
                'notifications' => [
                    '*' => ['id', 'type', 'title', 'message'],
                ],
                'unread_count',
                'pagination' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ])
            ->assertJsonCount(3, 'notifications')
            ->assertJson([
                'unread_count' => 3,
                'pagination' => ['total' => 3],
            ]);
    }

    public function test_mark_as_read_calls_service_correctly(): void
    {
        $notification = Notification::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $mockService = \Mockery::mock(NotificationService::class);

        $mockService->shouldReceive('markAsRead')
            ->once()
            ->with($this->user, $notification->id)
            ->andReturn($notification);

        $this->app->instance(NotificationService::class, $mockService);

        $this->actingAs($this->user)
            ->postJson("/notifications/{$notification->id}/read");
    }

    // ────────────────────────────────────────────────────────────────────────
    // Response Format Tests
    // ────────────────────────────────────────────────────────────────────────

    public function test_notification_responses_have_correct_structure(): void
    {
        Notification::factory()->create([
            'user_id' => $this->user->id,
            'data' => [
                'title' => 'Test Notification',
                'message' => 'This is a test notification',
            ],
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications');

        $response->assertOk()
            ->assertJsonStructure([
                'notifications' => [
                    '*' => [
                        'id',
                        'type',
                        'title',
                        'message',
                    ],
                ],
            ]);
    }

    public function test_json_and_inertia_responses_work(): void
    {
        Notification::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // Test JSON response
        $jsonResponse = $this->actingAs($this->user)
            ->getJson('/notifications');

        $jsonResponse->assertOk()
            ->assertJsonStructure(['notifications', 'unread_count', 'pagination']);

        // Test Inertia response (HTML request)
        $inertiaResponse = $this->actingAs($this->user)
            ->get('/notifications', ['Accept' => 'text/html']);

        $inertiaResponse->assertOk();
    }
}
