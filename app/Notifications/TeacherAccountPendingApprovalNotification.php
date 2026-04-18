<?php

namespace App\Notifications;

use App\Channels\CustomDatabaseChannel;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to a newly registered teacher about pending admin approval.
 * Explains the approval process and what they can do while waiting.
 */
class TeacherAccountPendingApprovalNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly User $teacher,
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return [CustomDatabaseChannel::class, 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to IoT-REAP - Account Pending Approval')
            ->greeting("Welcome {$notifiable->name}!")
            ->line('Thank you for registering as a teacher on IoT-REAP.')
            ->line('Your account has been created successfully, but teaching features require admin approval.')
            ->line('')
            ->line('**What happens next:**')
            ->line('1. An administrator will review your application')
            ->line('2. You\'ll receive an approval notification when ready')
            ->line('3. Once approved, you can access the teaching dashboard')
            ->line('')
            ->line('**In the meantime:**')
            ->line('You can explore learning resources and training paths to familiarize yourself with the platform.')
            ->line('')
            ->line('If you have any questions, please contact us at support@iot-reap.edu')
            ->salutation('Best regards, IoT-REAP Team');
    }

    /**
     * Get the array representation of the notification (for database channel).
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Account Pending Approval',
            'message' => 'Your teacher account is pending admin approval. You can access learning resources while awaiting review.',
            'type' => 'info',
        ];
    }
}
