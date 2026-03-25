<?php

namespace App\Services;

use App\Models\User;
use App\Models\VMSession;
use App\Models\VMSessionQueue;
use App\Models\VMTemplate;
use App\Repositories\VMSessionQueueRepository;
use App\Repositories\VMTemplateRepository;
use Illuminate\Database\Eloquent\Collection;

class VMSessionQueueService
{
    public function __construct(
        private VMSessionQueueRepository $queueRepository,
        private VMTemplateRepository $templateRepository,
    ) {}

    /**
     * Join the queue for a VM template.
     */
    public function joinQueue(
        VMTemplate $template,
        User $user,
        ?VMSession $session = null,
        ?int $lessonId = null
    ): VMSessionQueue {
        // Check if user is already in queue
        if ($this->queueRepository->isInQueue($template->id, $user->id)) {
            throw new \RuntimeException('You are already in the queue for this VM.');
        }

        // Check if template is available
        if (! $template->is_active) {
            throw new \RuntimeException('This VM template is not active.');
        }

        if ($template->isInMaintenance()) {
            throw new \RuntimeException(
                'This VM is currently in maintenance. '.
                ($template->maintenance_notes ? "Reason: {$template->maintenance_notes}" : '')
            );
        }

        return $this->queueRepository->enqueue(
            $template->id,
            $user->id,
            $session?->id,
            $lessonId
        );
    }

    /**
     * Leave the queue for a VM template.
     */
    public function leaveQueue(VMTemplate $template, User $user): bool
    {
        return $this->queueRepository->dequeue($template->id, $user->id);
    }

    /**
     * Get queue position for a user.
     */
    public function getQueuePosition(int $templateId, string $userId): ?int
    {
        return $this->queueRepository->getPosition($templateId, $userId);
    }

    /**
     * Get queue status for a template (for display to users).
     */
    public function getQueueStatus(VMTemplate $template): array
    {
        $currentSession = $template->getCurrentSession();
        $queueEntries = $this->queueRepository->findByTemplate($template->id);

        $currentUserInfo = null;
        if ($currentSession) {
            $currentUserInfo = [
                'user_name' => $currentSession->user->name,
                'expires_at' => $currentSession->expires_at?->toIso8601String(),
                'remaining_minutes' => $currentSession->expires_at
                    ? max(0, now()->diffInMinutes($currentSession->expires_at, false))
                    : null,
            ];
        }

        return [
            'template_id' => $template->id,
            'template_name' => $template->name,
            'is_available' => $template->isAvailable(),
            'is_in_use' => $currentSession !== null,
            'current_user' => $currentUserInfo,
            'maintenance_mode' => $template->maintenance_mode,
            'maintenance_notes' => $template->maintenance_notes,
            'maintenance_until' => $template->maintenance_until?->toIso8601String(),
            'queue_count' => $queueEntries->count(),
            'queue' => $queueEntries->map(fn ($entry) => [
                'position' => $entry->position,
                'user_name' => $entry->user->name,
                'queued_at' => $entry->queued_at->toIso8601String(),
                'estimated_available_at' => $entry->estimated_available_at?->toIso8601String(),
                'wait_time_label' => $entry->getWaitTimeLabel(),
            ])->toArray(),
        ];
    }

    /**
     * Get queue entry for a specific user on a template.
     */
    public function getUserQueueEntry(int $templateId, string $userId): ?VMSessionQueue
    {
        return $this->queueRepository->findByTemplateAndUser($templateId, $userId);
    }

    /**
     * Get all queue entries for a user across all templates.
     */
    public function getUserQueues(User $user): Collection
    {
        return $this->queueRepository->findByUser($user->id);
    }

    /**
     * Process queue when a session ends (notify next user).
     */
    public function processQueueOnSessionEnd(VMTemplate $template): ?VMSessionQueue
    {
        $nextEntry = $this->queueRepository->findFirst($template->id);

        if (! $nextEntry) {
            return null;
        }

        // Mark as notified
        $this->queueRepository->markNotified($nextEntry);

        // TODO: Send notification (email, websocket broadcast)
        // event(new VMQueueTurnNotification($nextEntry));

        return $nextEntry;
    }

    /**
     * Check if user can start a session (first in queue or no queue).
     */
    public function canUserStartSession(VMTemplate $template, User $user): array
    {
        // Check maintenance
        if ($template->isInMaintenance()) {
            return [
                'allowed' => false,
                'reason' => 'VM is in maintenance mode.',
                'maintenance_notes' => $template->maintenance_notes,
            ];
        }

        // Check if VM is in use
        $currentSession = $template->getCurrentSession();
        if ($currentSession) {
            $queuePosition = $this->getQueuePosition($template->id, $user->id);
            $remainingMinutes = max(0, now()->diffInMinutes($currentSession->expires_at, false));

            return [
                'allowed' => false,
                'reason' => 'VM is currently in use.',
                'current_user' => $currentSession->user->name,
                'remaining_minutes' => $remainingMinutes,
                'queue_position' => $queuePosition,
                'in_queue' => $queuePosition !== null,
            ];
        }

        // Check queue
        $queueCount = $this->queueRepository->getQueueCount($template->id);
        if ($queueCount > 0) {
            $firstEntry = $this->queueRepository->findFirst($template->id);

            // User is first in queue - can start
            if ($firstEntry && $firstEntry->user_id === $user->id) {
                return [
                    'allowed' => true,
                    'reason' => 'You are next in queue and VM is available.',
                    'will_dequeue' => true,
                ];
            }

            // User is not first
            $position = $this->getQueuePosition($template->id, $user->id);

            return [
                'allowed' => false,
                'reason' => $position
                    ? "You are position {$position} in the queue."
                    : 'Others are waiting in the queue. Please join the queue.',
                'queue_position' => $position,
                'in_queue' => $position !== null,
            ];
        }

        // No one using, no queue - allowed
        return [
            'allowed' => true,
            'reason' => 'VM is available.',
            'will_dequeue' => false,
        ];
    }

    /**
     * Called when a user successfully starts a session.
     * Removes them from the queue if they were in it.
     */
    public function onSessionStarted(VMTemplate $template, User $user): void
    {
        $this->queueRepository->dequeue($template->id, $user->id);
        $this->queueRepository->recalculateEstimates($template->id);
    }

    /**
     * Called when a session ends.
     * Processes the queue and notifies the next user.
     */
    public function onSessionEnded(VMTemplate $template): void
    {
        $this->processQueueOnSessionEnd($template);
    }

    /**
     * Get time availability windows for a template.
     */
    public function getAvailabilityWindows(VMTemplate $template, int $hoursAhead = 24): array
    {
        $windows = [];
        $currentSession = $template->getCurrentSession();
        $queue = $this->queueRepository->findByTemplate($template->id);

        $nextAvailable = now();

        if ($currentSession && $currentSession->expires_at) {
            $nextAvailable = $currentSession->expires_at;
        }

        // Add estimated times for each queue entry
        foreach ($queue as $entry) {
            $windows[] = [
                'user_name' => $entry->user->name,
                'starts_at' => $nextAvailable->toIso8601String(),
                'estimated_duration' => 60, // Default 60 minutes
            ];
            $nextAvailable = $nextAvailable->addMinutes(60);
        }

        // Show available slot after queue
        if ($nextAvailable->diffInHours(now()) < $hoursAhead) {
            $windows[] = [
                'user_name' => null,
                'starts_at' => $nextAvailable->toIso8601String(),
                'estimated_duration' => null,
                'available' => true,
            ];
        }

        return $windows;
    }

    /**
     * Cleanup expired queue entries.
     */
    public function cleanup(): int
    {
        return $this->queueRepository->cleanupEndedSessions();
    }
}
