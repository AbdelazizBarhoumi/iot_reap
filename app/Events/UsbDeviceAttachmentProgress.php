<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event broadcasted during USB device attachment progress.
 *
 * Allows the frontend to show real-time feedback during the
 * potentially long Windows USB/IP driver loading process.
 */
class UsbDeviceAttachmentProgress implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  int  $deviceId  The USB device being attached
     * @param  string  $sessionId  The session receiving the device
     * @param  string  $status  One of: started, binding, attaching, completed, failed
     * @param  string  $message  Human-readable progress message
     * @param  array  $extra  Additional data (e.g., port number on completion)
     */
    public function __construct(
        public readonly int $deviceId,
        public readonly string $sessionId,
        public readonly string $status,
        public readonly string $message,
        public readonly array $extra = [],
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("session.{$this->sessionId}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'usb.attachment.progress';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'device_id' => $this->deviceId,
            'session_id' => $this->sessionId,
            'status' => $this->status,
            'message' => $this->message,
            'extra' => $this->extra,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
