<?php

namespace App\Notifications;

use App\Channels\CustomDatabaseChannel;
use App\Models\RefundRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to a user when their refund request is rejected.
 */
class RefundRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly RefundRequest $refund,
        public readonly string $reason,
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
            ->subject('Refund Request Update - IoT-REAP')
            ->greeting("Hello {$notifiable->name},")
            ->line('Your refund request has been reviewed.')
            ->line('**Status:** Not approved')
            ->line("**Reason:** {$this->reason}")
            ->line('If you have questions, please contact support.')
            ->action('View Payment History', url('/checkout/payments'))
            ->salutation('— IoT-REAP');
    }

    /**
     * Get the data for the custom database channel.
     */
    public function toCustomDatabase(object $notifiable): array
    {
        return [
            'type' => 'refund_rejected',
            'title' => 'Refund Request Update',
            'message' => "Your refund request was not approved. Reason: {$this->reason}",
            'refund_id' => $this->refund->id,
            'payment_id' => $this->refund->payment_id,
            'reason' => $this->reason,
            'rejected_at' => now()->toIso8601String(),
            'action_url' => '/checkout/payments',
        ];
    }

    /**
     * Get the array representation of the notification for other channels.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'refund_rejected',
            'refund_id' => $this->refund->id,
            'payment_id' => $this->refund->payment_id,
            'reason' => $this->reason,
            'rejected_at' => now()->toIso8601String(),
            'message' => 'Your refund request was not approved.',
        ];
    }
}
