<?php

namespace App\Http\Controllers;

use App\Http\Resources\VMSessionQueueResource;
use App\Http\Resources\VMTemplateResource;
use App\Models\VMTemplate;
use App\Services\VMSessionQueueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VMQueueController extends Controller
{
    public function __construct(
        private VMSessionQueueService $queueService,
    ) {}

    /**
     * Get queue status for a VM template.
     */
    public function status(Request $request, VMTemplate $template): JsonResponse
    {
        $status = $this->queueService->getQueueStatus($template);

        // Add user's specific queue info
        $userEntry = $this->queueService->getUserQueueEntry($template->id, $request->user()->id);
        $status['my_position'] = $userEntry?->position;
        $status['my_estimated_wait'] = $userEntry?->getWaitTimeLabel();
        $status['am_in_queue'] = $userEntry !== null;

        return response()->json(['data' => $status]);
    }

    /**
     * Join the queue for a VM template.
     */
    public function join(Request $request, VMTemplate $template): JsonResponse
    {
        $request->validate([
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
        ]);

        try {
            $entry = $this->queueService->joinQueue(
                $template,
                $request->user(),
                null,
                $request->input('lesson_id')
            );

            return response()->json([
                'data' => new VMSessionQueueResource($entry),
                'message' => "You are now in position {$entry->position} in the queue.",
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Leave the queue for a VM template.
     */
    public function leave(Request $request, VMTemplate $template): JsonResponse
    {
        $removed = $this->queueService->leaveQueue($template, $request->user());

        if (! $removed) {
            return response()->json(['error' => 'You are not in the queue for this VM.'], 404);
        }

        return response()->json(['message' => 'You have left the queue.']);
    }

    /**
     * Get user's queue entries across all templates.
     */
    public function myQueues(Request $request): JsonResponse
    {
        $entries = $this->queueService->getUserQueues($request->user());

        return response()->json([
            'data' => VMSessionQueueResource::collection($entries),
        ]);
    }

    /**
     * Check if user can start a session on a template.
     */
    public function canStart(Request $request, VMTemplate $template): JsonResponse
    {
        $result = $this->queueService->canUserStartSession($template, $request->user());

        return response()->json(['data' => $result]);
    }

    /**
     * Get availability windows (schedule) for a template.
     */
    public function availability(Request $request, VMTemplate $template): JsonResponse
    {
        $hoursAhead = $request->input('hours', 24);
        $windows = $this->queueService->getAvailabilityWindows($template, min($hoursAhead, 72));

        return response()->json([
            'data' => [
                'template' => new VMTemplateResource($template->load(['proxmoxServer', 'node'])),
                'windows' => $windows,
            ],
        ]);
    }
}
