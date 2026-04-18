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
    | 'announcement';
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

