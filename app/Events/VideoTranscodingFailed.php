<?php

namespace App\Events;

use App\Models\Video;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Event fired when video transcoding fails.
 *
 * @planned ORPHAN EVENT - Fired but has no listeners. Needs listener for:
 *          - Notifying admins/video owner of transcoding failure
 *          - Triggering cleanup of partial output
 */
class VideoTranscodingFailed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Video $video,
        public readonly string $errorMessage,
    ) {}
}
