<?php

namespace App\Enums;

enum NotificationType: string
{
    case COURSE_APPROVED = 'training_path_approved';
    case COURSE_REJECTED = 'training_path_rejected';
    case NEW_ENROLLMENT = 'new_enrollment';
    case FORUM_REPLY = 'forum_reply';
    case FORUM_MENTION = 'forum_mention';
    case QUIZ_GRADED = 'quiz_graded';
    case CERTIFICATE_READY = 'certificate_ready';
    case SYSTEM = 'system';
    case ANNOUNCEMENT = 'announcement';
    case RESERVATION_APPROVED = 'reservation_approved';
    case RESERVATION_REJECTED = 'reservation_rejected';
    case SESSION_STARTED = 'session_started';
    case SESSION_ENDING = 'session_ending';
    case SESSION_ACTIVATION_FAILED = 'session_activation_failed';
    case USB_DEVICE_AVAILABLE = 'usb_device_available';
    case PAYOUT_APPROVED = 'payout_approved';
    case PAYOUT_REJECTED = 'payout_rejected';
    case REFUND_APPROVED = 'refund_approved';
    case REFUND_REJECTED = 'refund_rejected';

    /**
     * Get the icon name for this notification type.
     */
    public function icon(): string
    {
        return match ($this) {
            self::COURSE_APPROVED => 'check-circle',
            self::COURSE_REJECTED => 'x-circle',
            self::NEW_ENROLLMENT => 'user-plus',
            self::FORUM_REPLY => 'message-circle',
            self::FORUM_MENTION => 'at-sign',
            self::QUIZ_GRADED => 'file-text',
            self::CERTIFICATE_READY => 'award',
            self::SYSTEM => 'bell',
            self::ANNOUNCEMENT => 'megaphone',
            self::RESERVATION_APPROVED => 'calendar-check',
            self::RESERVATION_REJECTED => 'calendar-x',
            self::SESSION_STARTED => 'play-circle',
            self::SESSION_ENDING => 'clock',
            self::SESSION_ACTIVATION_FAILED => 'alert-triangle',
            self::USB_DEVICE_AVAILABLE => 'usb',
            self::PAYOUT_APPROVED => 'dollar-sign',
            self::PAYOUT_REJECTED => 'x-circle',
            self::REFUND_APPROVED => 'refresh-cw',
            self::REFUND_REJECTED => 'x-circle',
        };
    }

    /**
     * Get a human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::COURSE_APPROVED => 'TrainingPath Approved',
            self::COURSE_REJECTED => 'TrainingPath Rejected',
            self::NEW_ENROLLMENT => 'New Enrollment',
            self::FORUM_REPLY => 'Forum Reply',
            self::FORUM_MENTION => 'Forum Mention',
            self::QUIZ_GRADED => 'Quiz Graded',
            self::CERTIFICATE_READY => 'Certificate Ready',
            self::SYSTEM => 'System Notification',
            self::ANNOUNCEMENT => 'Announcement',
            self::RESERVATION_APPROVED => 'Reservation Approved',
            self::RESERVATION_REJECTED => 'Reservation Rejected',
            self::SESSION_STARTED => 'Session Started',
            self::SESSION_ENDING => 'Session Ending',
            self::SESSION_ACTIVATION_FAILED => 'Session Activation Failed',
            self::USB_DEVICE_AVAILABLE => 'USB Device Available',
            self::PAYOUT_APPROVED => 'Payout Approved',
            self::PAYOUT_REJECTED => 'Payout Rejected',
            self::REFUND_APPROVED => 'Refund Approved',
            self::REFUND_REJECTED => 'Refund Rejected',
        };
    }
}
