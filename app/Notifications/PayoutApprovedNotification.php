<?php

namespace App\Notifications;

use App\Channels\CustomDatabaseChannel;
use App\Models\PayoutRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to a teacher when their payout request is approved.
 */
class PayoutApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly PayoutRequest $payout,
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
        $amount = number_format($this->payout->amount_cents / 100, 2);

        return (new MailMessage)
            ->subject('Payout Approved - IoT-REAP')
            ->greeting("Hello {$notifiable->name},")
            ->line('Great news! Your payout request has been approved.')
            ->line("**Amount:** \${$amount} USD")
            ->line('**Status:** Approved and processing')
            ->line('The funds will be transferred to your account within 2-5 business days.')
            ->action('View Earnings', url('/teaching/earnings'))
            ->salutation('— IoT-REAP');
    }

    /**
     * Get the data for the custom database channel.
     */
    public function toCustomDatabase(object $notifiable): array
    {
        $amount = number_format($this->payout->amount_cents / 100, 2);

        return [
            'type' => 'payout_approved',
            'title' => 'Payout Approved',
            'message' => "Your payout request for \${$amount} has been approved.",
            'payout_id' => $this->payout->id,
            'amount_cents' => $this->payout->amount_cents,
            'approved_at' => $this->payout->approved_at?->toIso8601String(),
            'action_url' => '/teaching/earnings',
        ];
    }

    /**
     * Get the array representation of the notification for other channels.
     */
    public function toArray(object $notifiable): array
    {
        $amount = number_format($this->payout->amount_cents / 100, 2);

        return [
            'type' => 'payout_approved',
            'payout_id' => $this->payout->id,
            'amount_cents' => $this->payout->amount_cents,
            'approved_at' => $this->payout->approved_at?->toIso8601String(),
            'message' => "Your payout request for \${$amount} has been approved.",
        ];
    }
}
