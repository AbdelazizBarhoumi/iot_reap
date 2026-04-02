<?php

namespace App\Notifications;

use App\Channels\CustomDatabaseChannel;
use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to a teacher when their course is rejected by an admin.
 */
class CourseRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Course $course,
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
        $editUrl = url("/teacher/courses/{$this->course->id}/edit");

        $mail = (new MailMessage)
            ->subject('Course Review Update - IoT-REAP')
            ->greeting("Hello {$notifiable->name},")
            ->line("Your course \"{$this->course->title}\" has been reviewed and requires changes before it can be published.")
            ->line("**Course:** {$this->course->title}");

        if ($this->feedback) {
            $mail->line("**Feedback:** {$this->feedback}");
        }

        return $mail
            ->action('Edit Your Course', $editUrl)
            ->line('Please address the feedback and resubmit your course for review.')
            ->salutation('— IoT-REAP');
    }

    /**
     * Get the data for the custom database channel.
     */
    public function toCustomDatabase(object $notifiable): array
    {
        return [
            'type' => 'course_rejected',
            'title' => 'Course Requires Changes',
            'message' => "Your course \"{$this->course->title}\" requires changes.".
                ($this->feedback ? " Feedback: {$this->feedback}" : ''),
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'feedback' => $this->feedback,
            'rejected_at' => $this->course->updated_at->toIso8601String(),
            'action_url' => "/teaching/{$this->course->id}/edit",
        ];
    }

    /**
     * Get the array representation of the notification for other channels.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'course_rejected',
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'feedback' => $this->feedback,
            'rejected_at' => $this->course->updated_at->toIso8601String(),
            'message' => "Your course \"{$this->course->title}\" requires changes.",
        ];
    }
}
