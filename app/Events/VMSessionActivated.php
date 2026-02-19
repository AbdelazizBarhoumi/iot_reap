<?php

namespace App\Events;

use App\Models\VMSession;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a VM session is fully active and ready for remote access.
 * Fired by ProvisionVMJob after the VM has been started and is running.
 * Used to trigger Guacamole connection creation.
 */
class VMSessionActivated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly VMSession $session,
    ) {}
}
