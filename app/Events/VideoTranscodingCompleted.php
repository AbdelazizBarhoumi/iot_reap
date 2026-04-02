<?php

namespace App\Events;

use App\Models\Video;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event fired when video transcoding completes successfully.
 *
 * @planned ORPHAN EVENT - Fired but has no listeners. Needs listener for:
 *          - Notifying video uploader of completion
 *          - Webhook notifications to external systems
 */
class VideoTranscodingCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Video $video,
    ) {}
}
