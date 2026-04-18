<?php

namespace App\Notifications;

use App\Channels\CustomDatabaseChannel;
use App\Models\TrainingPath;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to a teacher when their trainingPath is approved by an admin.
 */
class TrainingPathApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly TrainingPath $trainingPath,
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
        $trainingPathUrl = url("/trainingPaths/{$this->trainingPath->id}");

        return (new MailMessage)
            ->subject('TrainingPath Approved - IoT-REAP')
            ->greeting("Hello {$notifiable->name},")
            ->line('Great news! Your trainingPath has been approved and is now live on IoT-REAP.')
            ->line("**TrainingPath:** {$this->trainingPath->title}")
            ->line("**Approved on:** {$this->trainingPath->updated_at->format('F j, Y')}")
            ->action('View Your TrainingPath', $trainingPathUrl)
            ->line('Students can now enroll in your trainingPath. Good luck!')
            ->salutation('— IoT-REAP');
    }

    /**
     * Get the data for the custom database channel.
     */
    public function toCustomDatabase(object $notifiable): array
    {
        return [
            'type' => 'training_path_approved',
            'title' => 'TrainingPath Approved',
            'message' => "Your trainingPath \"{$this->trainingPath->title}\" has been approved.",
            'training_path_id' => $this->trainingPath->id,
            'training_path_title' => $this->trainingPath->title,
            'approved_at' => $this->trainingPath->updated_at->toIso8601String(),
            'action_url' => "/trainingPaths/{$this->trainingPath->id}",
        ];
    }

    /**
     * Get the array representation of the notification for other channels.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'training_path_approved',
            'training_path_id' => $this->trainingPath->id,
            'training_path_title' => $this->trainingPath->title,
            'approved_at' => $this->trainingPath->updated_at->toIso8601String(),
            'message' => "Your trainingPath \"{$this->trainingPath->title}\" has been approved.",
        ];
    }
}
