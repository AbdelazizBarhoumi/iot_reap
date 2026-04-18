<?php

namespace Tests\Unit\Services;

use App\Enums\NotificationType;
use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class NotificationServiceIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private NotificationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(NotificationService::class);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // notify() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_creates_notification(): void
    {
        Event::fake([NotificationCreated::class]);

        $user = User::factory()->create();

        $notification = $this->service->notify(
            user: $user,
            type: NotificationType::SYSTEM,
            title: 'Test Title',
            message: 'Test message content',
            actionUrl: '/test/url',
            data: ['key' => 'value'],
        );

        $this->assertInstanceOf(Notification::class, $notification);
        $this->assertEquals($user->id, $notification->user_id);
        $this->assertEquals(NotificationType::SYSTEM, $notification->type);
        $this->assertEquals('Test Title', $notification->title);
        $this->assertEquals('Test message content', $notification->message);
        $this->assertEquals('/test/url', $notification->action_url);
        $this->assertEquals(['key' => 'value'], $notification->data);
        $this->assertNull($notification->read_at);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'user_id' => $user->id,
            'title' => 'Test Title',
        ]);

        Event::assertDispatched(NotificationCreated::class, function ($event) use ($notification) {
            return $event->notification->id === $notification->id;
        });
    }

    public function test_creates_notification_without_optional_params(): void
    {
        Event::fake([NotificationCreated::class]);

        $user = User::factory()->create();

        $notification = $this->service->notify(
            user: $user,
            type: NotificationType::ANNOUNCEMENT,
            title: 'Minimal Notification',
            message: 'Just the basics',
        );

        $this->assertInstanceOf(Notification::class, $notification);
        $this->assertNull($notification->action_url);
        $this->assertNull($notification->data);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // notifyMany() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_notifies_multiple_users(): void
    {
        Event::fake([NotificationCreated::class]);

        $users = User::factory()->count(3)->create();

        $count = $this->service->notifyMany(
            users: $users,
            type: NotificationType::ANNOUNCEMENT,
            title: 'Broadcast',
            message: 'Message to all users',
        );

        $this->assertEquals(3, $count);
        $this->assertDatabaseCount('notifications', 3);

        foreach ($users as $user) {
            $this->assertDatabaseHas('notifications', [
                'user_id' => $user->id,
                'title' => 'Broadcast',
            ]);
        }

        Event::assertDispatchedTimes(NotificationCreated::class, 3);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getUserNotifications() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_user_notifications_unread_first(): void
    {
        $user = User::factory()->create();

        // Create read notifications (older)
        $read1 = Notification::factory()->read()->create([
            'user_id' => $user->id,
            'title' => 'Read 1',
            'created_at' => now()->subHours(3),
        ]);
        $read2 = Notification::factory()->read()->create([
            'user_id' => $user->id,
            'title' => 'Read 2',
            'created_at' => now()->subHours(2),
        ]);

        // Create unread notifications (newer)
        $unread1 = Notification::factory()->unread()->create([
            'user_id' => $user->id,
            'title' => 'Unread 1',
            'created_at' => now()->subHour(),
        ]);
        $unread2 = Notification::factory()->unread()->create([
            'user_id' => $user->id,
            'title' => 'Unread 2',
            'created_at' => now(),
        ]);

        $result = $this->service->getUserNotifications($user);

        $this->assertCount(4, $result);

        // Unread should come first, ordered by created_at desc
        $this->assertEquals('Unread 2', $result->items()[0]->title);
        $this->assertEquals('Unread 1', $result->items()[1]->title);
        // Read notifications come after
        $this->assertEquals('Read 2', $result->items()[2]->title);
        $this->assertEquals('Read 1', $result->items()[3]->title);
    }

    public function test_paginates_notifications(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(25)->create(['user_id' => $user->id]);

        $page1 = $this->service->getUserNotifications($user, perPage: 10);

        $this->assertCount(10, $page1);
        $this->assertEquals(25, $page1->total());
        $this->assertEquals(3, $page1->lastPage());
        $this->assertTrue($page1->hasMorePages());
    }

    public function test_filters_unread_only_notifications(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(3)->unread()->create(['user_id' => $user->id]);
        Notification::factory()->count(2)->read()->create(['user_id' => $user->id]);

        $unreadOnly = $this->service->getUserNotifications($user, unreadOnly: true);

        $this->assertCount(3, $unreadOnly);
        foreach ($unreadOnly as $notification) {
            $this->assertNull($notification->read_at);
        }
    }

    public function test_filters_read_only_notifications(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(3)->unread()->create(['user_id' => $user->id]);
        Notification::factory()->count(2)->read()->create(['user_id' => $user->id]);

        $readOnly = $this->service->getUserNotifications($user, unreadOnly: false);

        $this->assertCount(2, $readOnly);
        foreach ($readOnly as $notification) {
            $this->assertNotNull($notification->read_at);
        }
    }

    public function test_does_not_return_other_users_notifications(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Notification::factory()->count(2)->create(['user_id' => $user->id]);
        Notification::factory()->count(3)->create(['user_id' => $otherUser->id]);

        $result = $this->service->getUserNotifications($user);

        $this->assertCount(2, $result);
        foreach ($result as $notification) {
            $this->assertEquals($user->id, $notification->user_id);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getRecentNotifications() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_recent_notifications_limited(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(15)->create(['user_id' => $user->id]);

        $recent = $this->service->getRecentNotifications($user, limit: 5);

        $this->assertCount(5, $recent);
    }

    public function test_recent_notifications_unread_first(): void
    {
        $user = User::factory()->create();

        Notification::factory()->read()->create([
            'user_id' => $user->id,
            'title' => 'Read Old',
            'created_at' => now()->subHour(),
        ]);
        Notification::factory()->unread()->create([
            'user_id' => $user->id,
            'title' => 'Unread Recent',
            'created_at' => now(),
        ]);

        $recent = $this->service->getRecentNotifications($user, limit: 10);

        $this->assertEquals('Unread Recent', $recent->first()->title);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // getUnreadCount() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_gets_unread_count(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(5)->unread()->create(['user_id' => $user->id]);
        Notification::factory()->count(3)->read()->create(['user_id' => $user->id]);

        $count = $this->service->getUnreadCount($user);

        $this->assertEquals(5, $count);
    }

    public function test_unread_count_is_zero_when_all_read(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(3)->read()->create(['user_id' => $user->id]);

        $count = $this->service->getUnreadCount($user);

        $this->assertEquals(0, $count);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // markAsRead() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_marks_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->unread()->create(['user_id' => $user->id]);

        $this->assertNull($notification->read_at);

        $result = $this->service->markAsRead($user, $notification->id);

        $this->assertNotNull($result);
        $this->assertNotNull($result->read_at);
        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
        ]);
        $this->assertNotNull(Notification::find($notification->id)->read_at);
    }

    public function test_mark_as_read_returns_null_for_other_users_notification(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $notification = Notification::factory()->unread()->create(['user_id' => $otherUser->id]);

        $result = $this->service->markAsRead($user, $notification->id);

        $this->assertNull($result);
        // Original notification remains unread
        $this->assertNull(Notification::find($notification->id)->read_at);
    }

    public function test_mark_as_read_returns_null_for_nonexistent_notification(): void
    {
        $user = User::factory()->create();

        $result = $this->service->markAsRead($user, 'nonexistent-uuid');

        $this->assertNull($result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // markManyAsRead() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_marks_many_notifications_as_read(): void
    {
        $user = User::factory()->create();
        $notifications = Notification::factory()->count(3)->unread()->create(['user_id' => $user->id]);
        $ids = $notifications->pluck('id')->toArray();

        $count = $this->service->markManyAsRead($user, $ids);

        $this->assertEquals(3, $count);
        foreach ($notifications as $notification) {
            $this->assertNotNull($notification->fresh()->read_at);
        }
    }

    public function test_mark_many_ignores_other_users_notifications(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $userNotification = Notification::factory()->unread()->create(['user_id' => $user->id]);
        $otherNotification = Notification::factory()->unread()->create(['user_id' => $otherUser->id]);

        $count = $this->service->markManyAsRead($user, [
            $userNotification->id,
            $otherNotification->id,
        ]);

        $this->assertEquals(1, $count);
        $this->assertNotNull($userNotification->fresh()->read_at);
        $this->assertNull($otherNotification->fresh()->read_at);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // markAllAsRead() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_marks_all_notifications_as_read(): void
    {
        $user = User::factory()->create();
        $notifications = Notification::factory()->count(5)->unread()->create(['user_id' => $user->id]);

        $count = $this->service->markAllAsRead($user);

        $this->assertEquals(5, $count);
        foreach ($notifications as $notification) {
            $this->assertNotNull($notification->fresh()->read_at);
        }
    }

    public function test_mark_all_only_affects_unread(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(3)->unread()->create(['user_id' => $user->id]);
        Notification::factory()->count(2)->read()->create(['user_id' => $user->id]);

        $count = $this->service->markAllAsRead($user);

        $this->assertEquals(3, $count);
    }

    public function test_mark_all_does_not_affect_other_users(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Notification::factory()->count(2)->unread()->create(['user_id' => $user->id]);
        $otherNotification = Notification::factory()->unread()->create(['user_id' => $otherUser->id]);

        $this->service->markAllAsRead($user);

        $this->assertNull($otherNotification->fresh()->read_at);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // deleteNotification() tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_deletes_notification(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->create(['user_id' => $user->id]);

        $result = $this->service->deleteNotification($user, $notification->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_delete_returns_false_for_other_users_notification(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $notification = Notification::factory()->create(['user_id' => $otherUser->id]);

        $result = $this->service->deleteNotification($user, $notification->id);

        $this->assertFalse($result);
        $this->assertDatabaseHas('notifications', ['id' => $notification->id]);
    }

    public function test_delete_returns_false_for_nonexistent_notification(): void
    {
        $user = User::factory()->create();

        $result = $this->service->deleteNotification($user, 'nonexistent-uuid');

        $this->assertFalse($result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Convenience method tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_notify_training_path_approved(): void
    {
        Event::fake([NotificationCreated::class]);

        $teacher = User::factory()->teacher()->create();

        $notification = $this->service->notifyTrainingPathApproved($teacher, 'Laravel 101', 42);

        $this->assertEquals(NotificationType::COURSE_APPROVED, $notification->type);
        $this->assertEquals('TrainingPath Approved!', $notification->title);
        $this->assertStringContainsString('Laravel 101', $notification->message);
        $this->assertEquals('/trainingPaths/42', $notification->action_url);
        $this->assertEquals(42, $notification->data['training_path_id']);
    }

    public function test_notify_training_path_rejected(): void
    {
        Event::fake([NotificationCreated::class]);

        $teacher = User::factory()->teacher()->create();

        $notification = $this->service->notifyTrainingPathRejected(
            $teacher,
            'My TrainingPath',
            10,
            'Needs better content',
        );

        $this->assertEquals(NotificationType::COURSE_REJECTED, $notification->type);
        $this->assertStringContainsString('My TrainingPath', $notification->message);
        $this->assertStringContainsString('Needs better content', $notification->message);
        $this->assertEquals('Needs better content', $notification->data['feedback']);
    }

    public function test_notify_new_enrollment(): void
    {
        Event::fake([NotificationCreated::class]);

        $teacher = User::factory()->teacher()->create();

        $notification = $this->service->notifyNewEnrollment(
            $teacher,
            'John Doe',
            'React TrainingPath',
            5,
        );

        $this->assertEquals(NotificationType::NEW_ENROLLMENT, $notification->type);
        $this->assertStringContainsString('John Doe', $notification->message);
        $this->assertEquals('John Doe', $notification->data['student_name']);
    }

    public function test_notify_forum_reply(): void
    {
        Event::fake([NotificationCreated::class]);

        $user = User::factory()->create();

        $notification = $this->service->notifyForumReply($user, 'Jane', 99, 50);

        $this->assertEquals(NotificationType::FORUM_REPLY, $notification->type);
        $this->assertStringContainsString('Jane', $notification->message);
        $this->assertEquals(99, $notification->data['thread_id']);
        $this->assertStringContainsString('thread=99', $notification->action_url);
    }

    public function test_notify_certificate_ready(): void
    {
        Event::fake([NotificationCreated::class]);

        $user = User::factory()->create();

        $notification = $this->service->notifyCertificateReady(
            $user,
            'Advanced IoT',
            'abc123hash',
        );

        $this->assertEquals(NotificationType::CERTIFICATE_READY, $notification->type);
        $this->assertStringContainsString('Advanced IoT', $notification->message);
        $this->assertEquals('/certificates/abc123hash/download', $notification->action_url);
    }

    public function test_notify_system(): void
    {
        Event::fake([NotificationCreated::class]);

        $user = User::factory()->create();

        $notification = $this->service->notifySystem(
            $user,
            'Maintenance',
            'System will be down',
            '/maintenance',
        );

        $this->assertEquals(NotificationType::SYSTEM, $notification->type);
        $this->assertEquals('Maintenance', $notification->title);
        $this->assertEquals('/maintenance', $notification->action_url);
    }

    public function test_send_announcement(): void
    {
        Event::fake([NotificationCreated::class]);

        $users = User::factory()->count(3)->create();

        $count = $this->service->sendAnnouncement(
            $users,
            'Big News',
            'Important announcement',
            '/news',
        );

        $this->assertEquals(3, $count);
        $this->assertDatabaseCount('notifications', 3);

        foreach ($users as $user) {
            $this->assertDatabaseHas('notifications', [
                'user_id' => $user->id,
                'type' => NotificationType::ANNOUNCEMENT->value,
                'title' => 'Big News',
            ]);
        }
    }
}
