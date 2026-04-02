/**
 * Notification API Module
 *
 * Provides API calls for the notification system.
 */
import axios from 'axios';
import type { Notification } from '@/types/notification.types';
interface NotificationResponse {
    notifications: Notification[];
    unread_count: number;
}
interface PaginatedNotificationResponse extends NotificationResponse {
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
export const notificationApi = {
    /**
     * Get recent notifications for the bell dropdown.
     */
    async getRecent(limit: number = 10): Promise<NotificationResponse> {
        const response = await axios.get<NotificationResponse>(
            '/notifications/recent',
            {
                params: { limit },
            },
        );
        return response.data;
    },
    /**
     * Get all notifications with pagination.
     */
    async getAll(params?: {
        page?: number;
        per_page?: number;
        unread_only?: boolean;
    }): Promise<PaginatedNotificationResponse> {
        const response = await axios.get<PaginatedNotificationResponse>(
            '/notifications',
            {
                params,
                headers: { Accept: 'application/json' },
            },
        );
        return response.data;
    },
    /**
     * Get unread notification count.
     */
    async getUnreadCount(): Promise<number> {
        const response = await axios.get<{ count: number }>(
            '/notifications/unread-count',
        );
        return response.data.count;
    },
    /**
     * Mark a single notification as read.
     */
    async markAsRead(id: string): Promise<Notification> {
        const response = await axios.post<{ notification: Notification }>(
            `/notifications/${id}/read`,
        );
        return response.data.notification;
    },
    /**
     * Mark multiple notifications as read.
     */
    async markManyAsRead(
        ids: string[],
    ): Promise<{ marked_count: number; unread_count: number }> {
        const response = await axios.post<{
            marked_count: number;
            unread_count: number;
        }>('/notifications/mark-many-read', { ids });
        return response.data;
    },
    /**
     * Mark all notifications as read.
     */
    async markAllAsRead(): Promise<{
        marked_count: number;
        unread_count: number;
    }> {
        const response = await axios.post<{
            marked_count: number;
            unread_count: number;
        }>('/notifications/mark-all-read');
        return response.data;
    },
    /**
     * Delete a notification.
     */
    async delete(id: string): Promise<void> {
        await axios.delete(`/notifications/${id}`);
    },
};

