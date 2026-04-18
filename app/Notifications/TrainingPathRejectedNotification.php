<?php

namespace App\Notifications;

use App\Channels\CustomDatabaseChannel;
use App\Models\TrainingPath;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to a teacher when their trainingPath is rejected by an admin.
 */
class TrainingPathRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly TrainingPath $trainingPath,
        public readonly ?string $feedback = null,
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
        $editUrl = url("/teacher/trainingPaths/{$this->trainingPath->id}/edit");

        $mail = (new MailMessage)
            ->subject('TrainingPath Review Update - IoT-REAP')
            ->greeting("Hello {$notifiable->name},")
            ->line("Your trainingPath \"{$this->trainingPath->title}\" has been reviewed and requires changes before it can be published.")
            ->line("**TrainingPath:** {$this->trainingPath->title}");

        if ($this->feedback) {
            $mail->line("**Feedback:** {$this->feedback}");
        }

        return $mail
            ->action('Edit Your TrainingPath', $editUrl)
            ->line('Please address the feedback and resubmit your trainingPath for review.')
            ->salutation('— IoT-REAP');
    }

    /**
     * Get the data for the custom database channel.
     */
    public function toCustomDatabase(object $notifiable): array
    {
        return [
            'type' => 'training_path_rejected',
            'title' => 'TrainingPath Requires Changes',
            'message' => "Your trainingPath \"{$this->trainingPath->title}\" requires changes.".
                ($this->feedback ? " Feedback: {$this->feedback}" : ''),
            'training_path_id' => $this->trainingPath->id,
            'training_path_title' => $this->trainingPath->title,
            'feedback' => $this->feedback,
            'rejected_at' => $this->trainingPath->updated_at->toIso8601String(),
            'action_url' => "/teaching/{$this->trainingPath->id}/edit",
        ];
    }

    /**
     * Get the array representation of the notification for other channels.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'training_path_rejected',
            'training_path_id' => $this->trainingPath->id,
            'training_path_title' => $this->trainingPath->title,
            'feedback' => $this->feedback,
            'rejected_at' => $this->trainingPath->updated_at->toIso8601String(),
            'message' => "Your trainingPath \"{$this->trainingPath->title}\" requires changes.",
        ];
    }
}
