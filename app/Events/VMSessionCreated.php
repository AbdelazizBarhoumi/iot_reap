<?php

namespace App\Events;

use App\Models\VMSession;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event dispatched when a VM session is successfully provisioned.
 * Used to trigger downstream processes (Guacamole setup, notifications, etc.)
 *
 * @deprecated ORPHAN EVENT - Fired but has no listeners. Consider adding listeners for
 *             logging, notifications, or analytics, or remove the dispatch points.
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
