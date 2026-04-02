<?php

namespace Tests\Feature\Security;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\User;
use Tests\TestCase;

/**
 * IDOR security tests for NotificationController.
 *
 * Verifies that users cannot delete or access notifications
 * belonging to other users.
 */
class NotificationIdorTest extends TestCase
{
    private User $user;

    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->engineer()->create();
        $this->otherUser = User::factory()->engineer()->create();
    }

    public function test_user_cannot_delete_another_users_notification(): void
    {
        // Create a notification for another user
        $otherUsersNotification = Notification::create([
            'user_id' => $this->otherUser->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Private Notification',
            'message' => 'This is a private message for another user',
        ]);

        // Attempt to delete another user's notification
        $response = $this->actingAs($this->user)
            ->deleteJson("/notifications/{$otherUsersNotification->id}");

        // Should return 404 (not found) since the query is scoped to user
        $response->assertNotFound();

        // Verify the notification still exists
        $this->assertDatabaseHas('notifications', [
            'id' => $otherUsersNotification->id,
        ]);
    }

    public function test_user_can_delete_own_notification(): void
    {
        // Create a notification for the authenticated user
        $ownNotification = Notification::create([
            'user_id' => $this->user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'My Notification',
            'message' => 'This is my notification',
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/notifications/{$ownNotification->id}");

        $response->assertOk();
        $response->assertJson(['message' => 'Notification deleted']);

        // Verify the notification was deleted
        $this->assertDatabaseMissing('notifications', [
            'id' => $ownNotification->id,
        ]);
    }

    public function test_user_cannot_mark_another_users_notification_as_read(): void
    {
        $otherUsersNotification = Notification::create([
            'user_id' => $this->otherUser->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Private Notification',
            'message' => 'This is private',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/notifications/{$otherUsersNotification->id}/read");

        $response->assertNotFound();

        // Verify notification is still unread
        $this->assertNull($otherUsersNotification->fresh()->read_at);
    }

    public function test_user_can_mark_own_notification_as_read(): void
    {
        $ownNotification = Notification::create([
            'user_id' => $this->user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'My Notification',
            'message' => 'This is my notification',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/notifications/{$ownNotification->id}/read");

        $response->assertOk();
        $this->assertNotNull($ownNotification->fresh()->read_at);
    }

    public function test_user_cannot_delete_nonexistent_notification(): void
    {
        $fakeUuid = '00000000-0000-0000-0000-000000000000';

        $response = $this->actingAs($this->user)
            ->deleteJson("/notifications/{$fakeUuid}");

        $response->assertNotFound();
    }

    public function test_unauthenticated_user_cannot_delete_notification(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'Test',
            'message' => 'Test message',
        ]);

        $response = $this->deleteJson("/notifications/{$notification->id}");

        $response->assertUnauthorized();
    }
}
