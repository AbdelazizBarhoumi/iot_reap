<?php

namespace App\Repositories;

use App\Models\VMTemplate;
use Illuminate\Database\Eloquent\Collection;

class VMTemplateRepository
{
    /**
     * Get all active VM templates.
     */
    public function findActive(): Collection
    {
        return VMTemplate::active()
            ->with(['proxmoxServer', 'node'])
            ->orderBy('name')
            ->get();
    }

    /**
     * Get all available VM templates (active and not in maintenance).
     */
    public function findAvailable(): Collection
    {
        return VMTemplate::available()
            ->with(['proxmoxServer', 'node'])
            ->orderBy('name')
            ->get();
    }

    /**
     * Get templates in maintenance.
     */
    public function findInMaintenance(): Collection
    {
        return VMTemplate::inMaintenance()
            ->with(['proxmoxServer', 'node'])
            ->orderBy('name')
            ->get();
    }

    /**
     * Find a template by ID.
     */
    public function findById(int $id): ?VMTemplate
    {
        return VMTemplate::with(['proxmoxServer', 'node'])->find($id);
    }

    /**
     * Find a template by ID or fail.
     */
    public function findByIdOrFail(int $id): VMTemplate
    {
        return VMTemplate::with(['proxmoxServer', 'node'])->findOrFail($id);
    }

    /**
     * Find templates by server and VMID.
     */
    public function findByServerAndVmid(int $serverId, int $vmid): ?VMTemplate
    {
        return VMTemplate::where('proxmox_server_id', $serverId)
            ->where('vmid', $vmid)
            ->first();
    }

    /**
     * Create a new VM template.
     */
    public function create(array $data): VMTemplate
    {
        return VMTemplate::create($data);
    }

    /**
     * Update a VM template.
     */
    public function update(VMTemplate $template, array $data): VMTemplate
    {
        $template->update($data);

        return $template->fresh();
    }

    /**
     * Delete a VM template.
     */
    public function delete(VMTemplate $template): bool
    {
        return $template->delete();
    }

    /**
     * Get templates assigned to a lesson (approved only).
     */
    public function findForLesson(int $lessonId): Collection
    {
        return VMTemplate::whereHas('lessonAssignments', function ($q) use ($lessonId) {
            $q->where('lesson_id', $lessonId)
                ->where('status', 'approved');
        })
            ->with(['proxmoxServer', 'node'])
            ->get();
    }

    /**
     * Get templates with their current session status.
     */
    public function findWithSessionStatus(): Collection
    {
        return VMTemplate::active()
            ->with(['proxmoxServer', 'node', 'queueEntries.user'])
            ->get()
            ->map(function ($template) {
                $template->current_session = $template->getCurrentSession();
                $template->queue_count = $template->queueEntries->count();

                return $template;
            });
    }
}
