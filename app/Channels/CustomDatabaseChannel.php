<?php

namespace App\Channels;

use App\Models\Notification as NotificationModel;
use Illuminate\Notifications\Notification;

/**
 * Custom database notification channel that uses the app's Notification model.
 *
 * Standard Laravel database notifications use a different schema (notifiable_id/type).
 * This channel writes to the custom notifications table with user_id, title, message, etc.
 */
class CustomDatabaseChannel
{
    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        $data = $this->getData($notifiable, $notification);

        NotificationModel::create([
            'user_id' => $notifiable->getKey(),
            'type' => $data['type'] ?? 'system',
            'title' => $data['title'] ?? 'Notification',
            'message' => $data['message'] ?? '',
            'data' => $data,
            'action_url' => $data['action_url'] ?? null,
        ]);
    }

    /**
     * Get the data array for the notification.
     */
    protected function getData(object $notifiable, Notification $notification): array
    {
        if (method_exists($notification, 'toCustomDatabase')) {
            return $notification->toCustomDatabase($notifiable);
        }

        if (method_exists($notification, 'toArray')) {
            return $notification->toArray($notifiable);
        }

        return [];
    }
}
