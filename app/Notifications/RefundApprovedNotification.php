<?php

namespace App\Notifications;

use App\Channels\CustomDatabaseChannel;
use App\Models\RefundRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to a user when their refund request is approved and processed.
 */
class RefundApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly RefundRequest $refund,
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
        $amount = $this->refund->payment
            ? number_format($this->refund->payment->amount / 100, 2)
            : 'N/A';

        return (new MailMessage)
            ->subject('Refund Approved - IoT-REAP')
            ->greeting("Hello {$notifiable->name},")
            ->line('Good news! Your refund request has been approved and processed.')
            ->line("**Amount:** \${$amount} USD")
            ->line('The funds will be returned to your original payment method within 5-10 business days.')
            ->action('View Payment History', url('/checkout/payments'))
            ->salutation('— IoT-REAP');
    }

    /**
     * Get the data for the custom database channel.
     */
    public function toCustomDatabase(object $notifiable): array
    {
        $amount = $this->refund->payment
            ? number_format($this->refund->payment->amount / 100, 2)
            : 'N/A';

        return [
            'type' => 'refund_approved',
            'title' => 'Refund Approved',
            'message' => "Your refund of \${$amount} has been approved and processed.",
            'refund_id' => $this->refund->id,
            'payment_id' => $this->refund->payment_id,
            'processed_at' => $this->refund->processed_at?->toIso8601String(),
            'action_url' => '/checkout/payments',
        ];
    }

    /**
     * Get the array representation of the notification for other channels.
     */
    public function toArray(object $notifiable): array
    {
        $amount = $this->refund->payment
            ? number_format($this->refund->payment->amount / 100, 2)
            : 'N/A';

        return [
            'type' => 'refund_approved',
            'refund_id' => $this->refund->id,
            'payment_id' => $this->refund->payment_id,
            'processed_at' => $this->refund->processed_at?->toIso8601String(),
            'message' => "Your refund of \${$amount} has been approved and processed.",
        ];
    }
}
