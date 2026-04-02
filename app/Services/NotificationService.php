<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use App\Repositories\NotificationRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * Service for managing user notifications.
 */
class NotificationService
{
    public function __construct(
        private readonly NotificationRepository $notificationRepository,
    ) {}

    /**
     * Create a new notification for a user.
     */
    public function notify(
        User $user,
        NotificationType $type,
        string $title,
        string $message,
        ?string $actionUrl = null,
        ?array $data = null,
    ): Notification {
        $notification = $this->notificationRepository->create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
            'data' => $data,
        ]);

        Log::info('Notification created', [
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'type' => $type->value,
        ]);

        event(new NotificationCreated($notification));

        return $notification;
    }

    /**
     * Send notification to multiple users.
     *
     * @param  array<User>|Collection<int, User>  $users
     */
    public function notifyMany(
        iterable $users,
        NotificationType $type,
        string $title,
        string $message,
        ?string $actionUrl = null,
        ?array $data = null,
    ): int {
        $count = 0;
        foreach ($users as $user) {
            $this->notify($user, $type, $title, $message, $actionUrl, $data);
            $count++;
        }

        return $count;
    }

    /**
     * Get paginated notifications for a user.
     */
    public function getUserNotifications(
        User $user,
        int $perPage = 20,
        ?bool $unreadOnly = null,
    ): LengthAwarePaginator {
        return $this->notificationRepository->getPaginatedForUser($user, $perPage, $unreadOnly);
    }

    /**
     * Get recent notifications for dropdown/bell.
     */
    public function getRecentNotifications(User $user, int $limit = 10): Collection
    {
        return $this->notificationRepository->getRecentForUser($user, $limit);
    }

    /**
     * Get unread notification count.
     */
    public function getUnreadCount(User $user): int
    {
        return $this->notificationRepository->countUnreadForUser($user);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(User $user, string $notificationId): ?Notification
    {
        $notification = $this->notificationRepository->findByIdForUser($notificationId, $user->id);

        if (! $notification) {
            return null;
        }

        return $this->notificationRepository->markAsRead($notification);
    }

    /**
     * Mark multiple notifications as read.
     *
     * @param  array<string>  $notificationIds
     */
    public function markManyAsRead(User $user, array $notificationIds): int
    {
        return $this->notificationRepository->markManyAsRead($notificationIds, $user->id);
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(User $user): int
    {
        $count = $this->notificationRepository->markAllAsReadForUser($user);

        Log::info('All notifications marked as read', [
            'user_id' => $user->id,
            'count' => $count,
        ]);

        return $count;
    }

    /**
     * Delete a notification.
     */
    public function deleteNotification(User $user, string $notificationId): bool
    {
        $notification = $this->notificationRepository->findByIdForUser($notificationId, $user->id);

        if (! $notification) {
            return false;
        }

        return $this->notificationRepository->delete($notification);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Convenience methods for specific notification types
    // NOTE: These methods are ready for use but not yet integrated into event listeners.
    // They will be connected when implementing Sprint 11 real-time notifications.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Notify teacher that their course was approved.
     *
     * @planned Not yet integrated - will be called from CourseService::approveCourse event listener
     */
    public function notifyCourseApproved(User $teacher, string $courseTitle, int $courseId): Notification
    {
        return $this->notify(
            user: $teacher,
            type: NotificationType::COURSE_APPROVED,
            title: 'Course Approved!',
            message: "Your course \"{$courseTitle}\" has been approved and is now live.",
            actionUrl: "/courses/{$courseId}",
            data: ['course_id' => $courseId, 'course_title' => $courseTitle],
        );
    }

    /**
     * Notify teacher that their course was rejected.
     *
     * @planned Not yet integrated - will be called from CourseService::rejectCourse event listener
     */
    public function notifyCourseRejected(User $teacher, string $courseTitle, int $courseId, string $feedback): Notification
    {
        return $this->notify(
            user: $teacher,
            type: NotificationType::COURSE_REJECTED,
            title: 'Course Needs Revision',
            message: "Your course \"{$courseTitle}\" requires changes: {$feedback}",
            actionUrl: "/teaching/{$courseId}/edit",
            data: ['course_id' => $courseId, 'course_title' => $courseTitle, 'feedback' => $feedback],
        );
    }

    /**
     * Notify teacher of a new enrollment.
     *
     * @planned Not yet integrated - will be called from EnrollmentService::enroll event listener
     */
    public function notifyNewEnrollment(User $teacher, string $studentName, string $courseTitle, int $courseId): Notification
    {
        return $this->notify(
            user: $teacher,
            type: NotificationType::NEW_ENROLLMENT,
            title: 'New Student Enrolled',
            message: "{$studentName} enrolled in \"{$courseTitle}\".",
            actionUrl: "/teaching/{$courseId}/edit",
            data: ['course_id' => $courseId, 'student_name' => $studentName],
        );
    }

    /**
     * Notify user of a forum reply.
     */
    public function notifyForumReply(User $user, string $replierName, int $threadId, int $lessonId): Notification
    {
        return $this->notify(
            user: $user,
            type: NotificationType::FORUM_REPLY,
            title: 'New Reply to Your Post',
            message: "{$replierName} replied to your discussion.",
            actionUrl: "/lessons/{$lessonId}?thread={$threadId}",
            data: ['thread_id' => $threadId, 'replier_name' => $replierName],
        );
    }

    /**
     * Notify user that their certificate is ready.
     *
     * @planned Not yet integrated - will be called from CertificateService::issueCertificate event listener
     */
    public function notifyCertificateReady(User $user, string $courseTitle, string $certificateHash): Notification
    {
        return $this->notify(
            user: $user,
            type: NotificationType::CERTIFICATE_READY,
            title: 'Certificate Earned!',
            message: "Congratulations! You completed \"{$courseTitle}\".",
            actionUrl: "/certificates/{$certificateHash}/download",
            data: ['certificate_hash' => $certificateHash, 'course_title' => $courseTitle],
        );
    }

    /**
     * Send a system notification.
     *
     * @planned Utility method for admin announcements - not yet integrated
     */
    public function notifySystem(User $user, string $title, string $message, ?string $actionUrl = null): Notification
    {
        return $this->notify(
            user: $user,
            type: NotificationType::SYSTEM,
            title: $title,
            message: $message,
            actionUrl: $actionUrl,
        );
    }

    /**
     * Send an announcement to multiple users.
     *
     * @planned Admin broadcast feature - not yet integrated in admin panel
     *
     * @param  array<User>|Collection<int, User>  $users
     */
    public function sendAnnouncement(iterable $users, string $title, string $message, ?string $actionUrl = null): int
    {
        return $this->notifyMany(
            users: $users,
            type: NotificationType::ANNOUNCEMENT,
            title: $title,
            message: $message,
            actionUrl: $actionUrl,
        );
    }
}
