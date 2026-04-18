<?php

namespace App\Events;

use App\Models\VMSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event fired when a VM session is ready for user access.
 *
 * Broadcast to:
 * - User's private channel: private-user.{userId}
 * - Session's private channel: private-session.{sessionId}
 *
 * Payload includes VM IP address and connection details.
 */
class VMSessionReady implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public VMSession $session,
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel("user.{$this->session->user_id}"),
            new Channel("session.{$this->session->id}"),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->session->id,
            'status' => $this->session->status,
            'ip_address' => $this->session->ip_address,
            'protocol' => $this->session->getProtocol()->value,
            'guacamole_connection_id' => $this->session->guacamole_connection_id,
            'message' => 'Your VM session is ready. You can now connect.',
        ];
    }

    /**
     * Get the broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'vm-session-ready';
    }
}
