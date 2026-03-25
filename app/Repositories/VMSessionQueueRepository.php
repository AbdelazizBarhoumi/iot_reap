<?php

namespace App\Repositories;

use App\Models\VMSessionQueue;
use App\Models\VMTemplate;
use Illuminate\Database\Eloquent\Collection;

class VMSessionQueueRepository
{
    /**
     * Get queue entries for a template.
     */
    public function findByTemplate(int $templateId): Collection
    {
        return VMSessionQueue::where('vm_template_id', $templateId)
            ->with(['user', 'lesson'])
            ->orderBy('position')
            ->get();
    }

    /**
     * Get queue entry for a user on a template.
     */
    public function findByTemplateAndUser(int $templateId, string $userId): ?VMSessionQueue
    {
        return VMSessionQueue::where('vm_template_id', $templateId)
            ->where('user_id', $userId)
            ->with(['vmTemplate', 'lesson'])
            ->first();
    }

    /**
     * Get the first (next) entry in queue.
     */
    public function findFirst(int $templateId): ?VMSessionQueue
    {
        return VMSessionQueue::where('vm_template_id', $templateId)
            ->orderBy('position')
            ->with(['user', 'lesson'])
            ->first();
    }

    /**
     * Get user's queue entries across all templates.
     */
    public function findByUser(string $userId): Collection
    {
        return VMSessionQueue::where('user_id', $userId)
            ->with(['vmTemplate', 'lesson'])
            ->orderBy('queued_at')
            ->get();
    }

    /**
     * Add user to queue.
     */
    public function enqueue(int $templateId, string $userId, ?string $sessionId = null, ?int $lessonId = null): VMSessionQueue
    {
        $maxPosition = VMSessionQueue::where('vm_template_id', $templateId)->max('position') ?? 0;
        $template = VMTemplate::find($templateId);

        $entry = VMSessionQueue::create([
            'vm_template_id' => $templateId,
            'user_id' => $userId,
            'session_id' => $sessionId,
            'lesson_id' => $lessonId,
            'position' => $maxPosition + 1,
            'queued_at' => now(),
            'estimated_available_at' => now()->addMinutes($template?->getEstimatedWaitMinutes($maxPosition + 1) ?? 60),
        ]);

        return $entry->load(['vmTemplate', 'user', 'lesson']);
    }

    /**
     * Remove user from queue.
     */
    public function dequeue(int $templateId, string $userId): bool
    {
        $entry = VMSessionQueue::where('vm_template_id', $templateId)
            ->where('user_id', $userId)
            ->first();

        if (! $entry) {
            return false;
        }

        $position = $entry->position;
        $entry->delete();

        // Reorder remaining entries
        VMSessionQueue::where('vm_template_id', $templateId)
            ->where('position', '>', $position)
            ->decrement('position');

        return true;
    }

    /**
     * Remove the first entry from queue (when template becomes available).
     */
    public function dequeueFirst(int $templateId): ?VMSessionQueue
    {
        $entry = $this->findFirst($templateId);

        if (! $entry) {
            return null;
        }

        $entry->delete();

        // Reorder remaining entries
        VMSessionQueue::where('vm_template_id', $templateId)
            ->decrement('position');

        // Update estimated times for all remaining
        $this->recalculateEstimates($templateId);

        return $entry;
    }

    /**
     * Get queue position for a user.
     */
    public function getPosition(int $templateId, string $userId): ?int
    {
        $entry = VMSessionQueue::where('vm_template_id', $templateId)
            ->where('user_id', $userId)
            ->first();

        return $entry?->position;
    }

    /**
     * Check if user is in queue.
     */
    public function isInQueue(int $templateId, string $userId): bool
    {
        return VMSessionQueue::where('vm_template_id', $templateId)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Get queue count for a template.
     */
    public function getQueueCount(int $templateId): int
    {
        return VMSessionQueue::where('vm_template_id', $templateId)->count();
    }

    /**
     * Mark queue entry as notified.
     */
    public function markNotified(VMSessionQueue $entry): void
    {
        $entry->update(['notified_at' => now()]);
    }

    /**
     * Recalculate estimated available times for all queue entries.
     */
    public function recalculateEstimates(int $templateId): void
    {
        $template = VMTemplate::find($templateId);
        if (! $template) {
            return;
        }

        $entries = VMSessionQueue::where('vm_template_id', $templateId)
            ->orderBy('position')
            ->get();

        foreach ($entries as $entry) {
            $waitMinutes = $template->getEstimatedWaitMinutes($entry->position);
            $entry->update(['estimated_available_at' => now()->addMinutes($waitMinutes)]);
        }
    }

    /**
     * Clean up queue entries for ended sessions.
     */
    public function cleanupEndedSessions(): int
    {
        $count = VMSessionQueue::whereHas('session', function ($q) {
            $q->whereIn('status', ['expired', 'terminated', 'failed']);
        })->delete();

        return $count;
    }

    /**
     * Get queue entries with expired estimated times (ready for notification).
     */
    public function findReadyForNotification(): Collection
    {
        return VMSessionQueue::whereNull('notified_at')
            ->where('position', 1)
            ->whereDoesntHave('vmTemplate', function ($q) {
                $q->whereHas('activeSessions');
            })
            ->with(['vmTemplate', 'user', 'lesson'])
            ->get();
    }
}
