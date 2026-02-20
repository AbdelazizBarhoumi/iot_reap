<?php

namespace App\Notifications;

use App\Models\VMSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to admins when a VM session activation fails (IP resolution / Guacamole creation).
 */
class SessionActivationFailed extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly VMSession $session,
        public readonly string $context,
        public readonly string $errorMessage,
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Mail representation for operators.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->error()
            ->subject("[IoT-REAP] VM session activation failed: session {$this->session->id}")
            ->line("Session ID: {$this->session->id}")
            ->line("User ID: {$this->session->user_id}")
            ->line("VM ID: {$this->session->vm_id}")
            ->line("Node: {$this->session->node?->name}")
            ->line("Reason: {$this->context}")
            ->line("Error: {$this->errorMessage}")
            ->line('Please investigate the Proxmox / Guacamole logs for more details.');
    }

    /**
     * Array representation stored in the database notification channel.
     */
    public function toArray($notifiable): array
    {
        return [
            'session_id' => $this->session->id,
            'user_id' => $this->session->user_id,
            'vm_id' => $this->session->vm_id,
            'node' => $this->session->node?->name,
            'context' => $this->context,
            'error' => $this->errorMessage,
        ];
    }
}
