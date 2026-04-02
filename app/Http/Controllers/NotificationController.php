<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for notification management.
 */
class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    /**
     * List all notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $user = $request->user();
        $unreadOnly = $request->boolean('unread_only', false) ?: null;
        $perPage = min((int) $request->query('per_page', 20), 50);

        $notifications = $this->notificationService->getUserNotifications($user, $perPage, $unreadOnly);
        $unreadCount = $this->notificationService->getUnreadCount($user);

        $responseData = [
            'notifications' => NotificationResource::collection($notifications),
            'unread_count' => $unreadCount,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ];

        if ($request->wantsJson()) {
            return response()->json($responseData);
        }

        return Inertia::render('notifications/index', $responseData);
    }

    /**
     * Get recent notifications (for bell dropdown).
     */
    public function recent(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = min((int) $request->query('limit', 10), 20);

        $notifications = $this->notificationService->getRecentNotifications($user, $limit);
        $unreadCount = $this->notificationService->getUnreadCount($user);

        return response()->json([
            'notifications' => NotificationResource::collection($notifications),
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get unread notification count.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = $this->notificationService->getUnreadCount($user);

        return response()->json(['count' => $count]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $notification = $this->notificationService->markAsRead($user, $id);

        if (! $notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        return response()->json([
            'notification' => new NotificationResource($notification),
        ]);
    }

    /**
     * Mark multiple notifications as read.
     */
    public function markManyAsRead(\App\Http\Requests\Notification\MarkManyNotificationsAsReadRequest $request): JsonResponse
    {
        $user = $request->user();
        $count = $this->notificationService->markManyAsRead($user, $request->validated('notification_ids'));

        return response()->json([
            'marked_count' => $count,
            'unread_count' => $this->notificationService->getUnreadCount($user),
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = $this->notificationService->markAllAsRead($user);

        return response()->json([
            'marked_count' => $count,
            'unread_count' => 0,
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $deleted = $this->notificationService->deleteNotification($user, $id);

        if (! $deleted) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        return response()->json(['message' => 'Notification deleted']);
    }
}
