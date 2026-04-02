<?php

namespace App\Notifications;

use App\Channels\CustomDatabaseChannel;
use App\Models\Course;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent to a teacher when their course is approved by an admin.
 */
class CourseApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Course $course,
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
        $courseUrl = url("/courses/{$this->course->id}");

        return (new MailMessage)
            ->subject('Course Approved - IoT-REAP')
            ->greeting("Hello {$notifiable->name},")
            ->line('Great news! Your course has been approved and is now live on IoT-REAP.')
            ->line("**Course:** {$this->course->title}")
            ->line("**Approved on:** {$this->course->updated_at->format('F j, Y')}")
            ->action('View Your Course', $courseUrl)
            ->line('Students can now enroll in your course. Good luck!')
            ->salutation('— IoT-REAP');
    }

    /**
     * Get the data for the custom database channel.
     */
    public function toCustomDatabase(object $notifiable): array
    {
        return [
            'type' => 'course_approved',
            'title' => 'Course Approved',
            'message' => "Your course \"{$this->course->title}\" has been approved.",
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'approved_at' => $this->course->updated_at->toIso8601String(),
            'action_url' => "/courses/{$this->course->id}",
        ];
    }

    /**
     * Get the array representation of the notification for other channels.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'course_approved',
            'course_id' => $this->course->id,
            'course_title' => $this->course->title,
            'approved_at' => $this->course->updated_at->toIso8601String(),
            'message' => "Your course \"{$this->course->title}\" has been approved.",
        ];
    }
}
