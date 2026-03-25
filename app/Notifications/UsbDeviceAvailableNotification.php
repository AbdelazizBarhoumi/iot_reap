<?php

namespace App\Notifications;

use App\Models\UsbDevice;
use App\Models\UsbDeviceQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notification sent when a USB device becomes available for the next user in queue.
 */
class UsbDeviceAvailableNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly UsbDevice $device,
        public readonly UsbDeviceQueue $queueEntry,
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $sessionUrl = url("/sessions/{$this->queueEntry->session_id}");

        return (new MailMessage)
            ->subject('USB Device Available - IoT-REAP')
            ->greeting("Hello {$notifiable->name},")
            ->line("The USB device \"{$this->device->name}\" you were waiting for is now available.")
            ->line("Device: {$this->device->name}")
            ->line("Bus ID: {$this->device->busid}")
            ->line("Gateway: {$this->device->gatewayNode->name}")
            ->action('Attach Device to Your Session', $sessionUrl)
            ->line('Please attach the device within 5 minutes or it may be assigned to the next person in queue.')
            ->salutation('— IoT-REAP');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'usb_device_available',
            'device_id' => $this->device->id,
            'device_name' => $this->device->name,
            'device_busid' => $this->device->busid,
            'gateway_name' => $this->device->gatewayNode->name,
            'session_id' => $this->queueEntry->session_id,
            'message' => "USB device \"{$this->device->name}\" is now available.",
        ];
    }
}
