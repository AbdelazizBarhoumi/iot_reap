<?php

namespace App\Events;

use App\Models\VMSession;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a VM session is successfully provisioned.
 * Used to trigger downstream processes (Guacamole setup, notifications, etc.)
 */
class VMSessionCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly VMSession $session,
    ) {}
}
