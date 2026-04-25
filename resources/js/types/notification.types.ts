/**
 * Notification types for the notification system
 */
export type NotificationType =
    | 'training_path_approved'
    | 'training_path_rejected'
    | 'new_enrollment'
    | 'forum_reply'
    | 'forum_mention'
    | 'quiz_graded'
    | 'certificate_ready'
    | 'system'
    | 'announcement'
    | 'reservation_approved'
    | 'reservation_rejected'
    | 'session_started'
    | 'session_ending'
    | 'session_activation_failed'
    | 'usb_device_available'
    | 'payout_approved'
    | 'payout_rejected'
    | 'refund_approved'
    | 'refund_rejected';
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    created_at: string;
    data?: Record<string, unknown>;
}
export interface NotificationGroup {
    date: string;
    label: string;
    notifications: Notification[];
}
