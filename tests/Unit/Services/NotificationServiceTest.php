<?php

namespace Tests\Unit\Services;

use App\Enums\NotificationType;
use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use App\Repositories\NotificationRepository;
use App\Services\NotificationService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    private NotificationService $service;

    private NotificationRepository $mockRepository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mockRepository = Mockery::mock(NotificationRepository::class);
        $this->service = new NotificationService($this->mockRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Core Notification Methods Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_notify_creates_notification_logs_and_fires_event(): void
    {
        Event::fake();

        $user = User::factory()->make(['id' => 1]);
        $notificationData = [
            'user_id' => 1,
            'type' => NotificationType::SYSTEM,
            'title' => 'Test Notification',
            'message' => 'This is a test message',
            'action_url' => '/test',
            'data' => ['key' => 'value'],
        ];

        $notification = Notification::factory()->make($notificationData);

        $this->mockRepository
            ->shouldReceive('create')
            ->once()
            ->with($notificationData)
            ->andReturn($notification);

        Log::shouldReceive('info')
            ->once()
            ->with('Notification created', [
                'notification_id' => $notification->id,
                'user_id' => 1,
                'type' => NotificationType::SYSTEM->value,
            ]);

        $result = $this->service->notify(
            $user,
            NotificationType::SYSTEM,
            'Test Notification',
            'This is a test message',
            '/test',
            ['key' => 'value']
        );

        $this->assertSame($notification, $result);
        Event::assertDispatched(NotificationCreated::class, function ($event) use ($notification) {
            return $event->notification === $notification;
        });
    }

    public function test_notify_many_sends_notifications_to_multiple_users(): void
    {
        Event::fake();

        $users = User::factory()->count(3)->make();
        $notification = Notification::factory()->make();

        $this->mockRepository
            ->shouldReceive('create')
            ->times(3)
            ->andReturn($notification);

        Log::shouldReceive('info')->times(3);

        $count = $this->service->notifyMany(
            $users,
            NotificationType::ANNOUNCEMENT,
            'Bulk Notification',
            'This is sent to multiple users'
        );

        $this->assertEquals(3, $count);
        Event::assertDispatched(NotificationCreated::class, function ($event) use ($notification) {
            return $event->notification === $notification;
        });
    }

    public function test_get_user_notifications_calls_repository_with_correct_params(): void
    {
        $user = User::factory()->make();
        $mockPaginator = Mockery::mock(LengthAwarePaginator::class);

        $this->mockRepository
            ->shouldReceive('getPaginatedForUser')
            ->once()
            ->with($user, 20, null)
            ->andReturn($mockPaginator);

        $result = $this->service->getUserNotifications($user);

        $this->assertSame($mockPaginator, $result);
    }

    public function test_get_user_notifications_with_custom_params(): void
    {
        $user = User::factory()->create();
        $mockPaginator = Mockery::mock(LengthAwarePaginator::class);

        $this->mockRepository
            ->shouldReceive('getPaginatedForUser')
            ->once()
            ->with($user, 50, true)
            ->andReturn($mockPaginator);

        $result = $this->service->getUserNotifications($user, 50, true);

        $this->assertSame($mockPaginator, $result);
    }

    public function test_get_recent_notifications_calls_repository(): void
    {
        $user = User::factory()->create();
        $mockCollection = Mockery::mock(Collection::class);

        $this->mockRepository
            ->shouldReceive('getRecentForUser')
            ->once()
            ->with($user, 10)
            ->andReturn($mockCollection);

        $result = $this->service->getRecentNotifications($user);

        $this->assertSame($mockCollection, $result);
    }

    public function test_get_recent_notifications_with_custom_limit(): void
    {
        $user = User::factory()->create();
        $mockCollection = Mockery::mock(Collection::class);

        $this->mockRepository
            ->shouldReceive('getRecentForUser')
            ->once()
            ->with($user, 25)
            ->andReturn($mockCollection);

        $result = $this->service->getRecentNotifications($user, 25);

        $this->assertSame($mockCollection, $result);
    }

    public function test_get_unread_count_calls_repository(): void
    {
        $user = User::factory()->create();

        $this->mockRepository
            ->shouldReceive('countUnreadForUser')
            ->once()
            ->with($user)
            ->andReturn(5);

        $result = $this->service->getUnreadCount($user);

        $this->assertEquals(5, $result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mark as Read Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_mark_as_read_returns_null_when_notification_not_found(): void
    {
        $user = User::factory()->create();

        $this->mockRepository
            ->shouldReceive('findByIdForUser')
            ->once()
            ->with('non-existent-id', $user->id)
            ->andReturn(null);

        $result = $this->service->markAsRead($user, 'non-existent-id');

        $this->assertNull($result);
    }

    public function test_mark_as_read_marks_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->unread()->make();
        $readNotification = Notification::factory()->read()->make();

        $this->mockRepository
            ->shouldReceive('findByIdForUser')
            ->once()
            ->with('notification-id', $user->id)
            ->andReturn($notification);

        $this->mockRepository
            ->shouldReceive('markAsRead')
            ->once()
            ->with($notification)
            ->andReturn($readNotification);

        $result = $this->service->markAsRead($user, 'notification-id');

        $this->assertSame($readNotification, $result);
    }

    public function test_mark_many_as_read_calls_repository(): void
    {
        $user = User::factory()->create();
        $notificationIds = ['id1', 'id2', 'id3'];

        $this->mockRepository
            ->shouldReceive('markManyAsRead')
            ->once()
            ->with($notificationIds, $user->id)
            ->andReturn(3);

        $result = $this->service->markManyAsRead($user, $notificationIds);

        $this->assertEquals(3, $result);
    }

    public function test_mark_all_as_read_logs_and_calls_repository(): void
    {
        $user = User::factory()->create();

        $this->mockRepository
            ->shouldReceive('markAllAsReadForUser')
            ->once()
            ->with($user)
            ->andReturn(10);

        Log::shouldReceive('info')
            ->once()
            ->with('All notifications marked as read', [
                'user_id' => $user->id,
                'count' => 10,
            ]);

        $result = $this->service->markAllAsRead($user);

        $this->assertEquals(10, $result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Delete Notification Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_delete_notification_returns_false_when_not_found(): void
    {
        $user = User::factory()->create();

        $this->mockRepository
            ->shouldReceive('findByIdForUser')
            ->once()
            ->with('non-existent-id', $user->id)
            ->andReturn(null);

        $result = $this->service->deleteNotification($user, 'non-existent-id');

        $this->assertFalse($result);
    }

    public function test_delete_notification_deletes_notification(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->make();

        $this->mockRepository
            ->shouldReceive('findByIdForUser')
            ->once()
            ->with('notification-id', $user->id)
            ->andReturn($notification);

        $this->mockRepository
            ->shouldReceive('delete')
            ->once()
            ->with($notification)
            ->andReturn(true);

        $result = $this->service->deleteNotification($user, 'notification-id');

        $this->assertTrue($result);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Convenience Methods Tests
    // ─────────────────────────────────────────────────────────────────────────

    public function test_notify_training_path_approved_creates_correct_notification(): void
    {
        Event::fake();

        $teacher = User::factory()->create();
        $notification = Notification::factory()->trainingPathApproved()->make();

        $expectedData = [
            'user_id' => $teacher->id,
            'type' => NotificationType::COURSE_APPROVED,
            'title' => 'TrainingPath Approved!',
            'message' => 'Your trainingPath "Laravel Basics" has been approved and is now live.',
            'action_url' => '/trainingPaths/123',
            'data' => ['training_path_id' => 123, 'training_path_title' => 'Laravel Basics'],
        ];

        $this->mockRepository
            ->shouldReceive('create')
            ->once()
            ->with($expectedData)
            ->andReturn($notification);

        Log::shouldReceive('info')->once();

        $result = $this->service->notifyTrainingPathApproved($teacher, 'Laravel Basics', 123);

        $this->assertSame($notification, $result);
        Event::assertDispatched(NotificationCreated::class);
    }

    public function test_notify_training_path_rejected_creates_correct_notification(): void
    {
        Event::fake();

        $teacher = User::factory()->create();
        $notification = Notification::factory()->make();

        $expectedData = [
            'user_id' => $teacher->id,
            'type' => NotificationType::COURSE_REJECTED,
            'title' => 'TrainingPath Needs Revision',
            'message' => 'Your trainingPath "Laravel Advanced" requires changes: Content needs more examples',
            'action_url' => '/teaching/123/edit',
            'data' => ['training_path_id' => 123, 'training_path_title' => 'Laravel Advanced', 'feedback' => 'Content needs more examples'],
        ];

        $this->mockRepository
            ->shouldReceive('create')
            ->once()
            ->with($expectedData)
            ->andReturn($notification);

        Log::shouldReceive('info')->once();

        $result = $this->service->notifyTrainingPathRejected($teacher, 'Laravel Advanced', 123, 'Content needs more examples');

        $this->assertSame($notification, $result);
        Event::assertDispatched(NotificationCreated::class);
    }

    public function test_notify_new_enrollment_creates_correct_notification(): void
    {
        Event::fake();

        $teacher = User::factory()->create();
        $notification = Notification::factory()->make();

        $expectedData = [
            'user_id' => $teacher->id,
            'type' => NotificationType::NEW_ENROLLMENT,
            'title' => 'New Student Enrolled',
            'message' => 'John Doe enrolled in "React Fundamentals".',
            'action_url' => '/teaching/456/edit',
            'data' => ['training_path_id' => 456, 'student_name' => 'John Doe'],
        ];

        $this->mockRepository
            ->shouldReceive('create')
            ->once()
            ->with($expectedData)
            ->andReturn($notification);

        Log::shouldReceive('info')->once();

        $result = $this->service->notifyNewEnrollment($teacher, 'John Doe', 'React Fundamentals', 456);

        $this->assertSame($notification, $result);
        Event::assertDispatched(NotificationCreated::class);
    }

    public function test_notify_forum_reply_creates_correct_notification(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $notification = Notification::factory()->forumReply()->make();

        $expectedData = [
            'user_id' => $user->id,
            'type' => NotificationType::FORUM_REPLY,
            'title' => 'New Reply to Your Post',
            'message' => 'Jane Smith replied to your discussion.',
            'action_url' => '/trainingUnits/789?thread=101',
            'data' => ['thread_id' => 101, 'replier_name' => 'Jane Smith'],
        ];

        $this->mockRepository
            ->shouldReceive('create')
            ->once()
            ->with($expectedData)
            ->andReturn($notification);

        Log::shouldReceive('info')->once();

        $result = $this->service->notifyForumReply($user, 'Jane Smith', 101, 789);

        $this->assertSame($notification, $result);
        Event::assertDispatched(NotificationCreated::class);
    }

    public function test_notify_certificate_ready_creates_correct_notification(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $notification = Notification::factory()->make();

        $expectedData = [
            'user_id' => $user->id,
            'type' => NotificationType::CERTIFICATE_READY,
            'title' => 'Certificate Earned!',
            'message' => 'Congratulations! You completed "Vue.js Mastery".',
            'action_url' => '/certificates/abc123/download',
            'data' => ['certificate_hash' => 'abc123', 'training_path_title' => 'Vue.js Mastery'],
        ];

        $this->mockRepository
            ->shouldReceive('create')
            ->once()
            ->with($expectedData)
            ->andReturn($notification);

        Log::shouldReceive('info')->once();

        $result = $this->service->notifyCertificateReady($user, 'Vue.js Mastery', 'abc123');

        $this->assertSame($notification, $result);
        Event::assertDispatched(NotificationCreated::class);
    }

    public function test_notify_system_creates_system_notification(): void
    {
        Event::fake();

        $user = User::factory()->create();
        $notification = Notification::factory()->system()->make();

        $expectedData = [
            'user_id' => $user->id,
            'type' => NotificationType::SYSTEM,
            'title' => 'System Maintenance',
            'message' => 'Platform will be down for maintenance tonight.',
            'action_url' => '/status',
            'data' => null,
        ];

        $this->mockRepository
            ->shouldReceive('create')
            ->once()
            ->with($expectedData)
            ->andReturn($notification);

        Log::shouldReceive('info')->once();

        $result = $this->service->notifySystem($user, 'System Maintenance', 'Platform will be down for maintenance tonight.', '/status');

        $this->assertSame($notification, $result);
        Event::assertDispatched(NotificationCreated::class);
    }

    public function test_send_announcement_sends_to_multiple_users(): void
    {
        Event::fake();

        $users = User::factory()->count(2)->create();
        $notification = Notification::factory()->announcement()->make();

        $this->mockRepository
            ->shouldReceive('create')
            ->times(2)
            ->andReturn($notification);

        Log::shouldReceive('info')->times(2);

        $count = $this->service->sendAnnouncement(
            $users,
            'Important Update',
            'New features have been released.',
            '/updates'
        );

        $this->assertEquals(2, $count);
        Event::assertDispatched(NotificationCreated::class);
    }
}
