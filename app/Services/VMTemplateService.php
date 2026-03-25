<?php

namespace App\Services;

use App\Models\VMTemplate;
use App\Repositories\VMTemplateRepository;
use Illuminate\Database\Eloquent\Collection;

class VMTemplateService
{
    public function __construct(
        private VMTemplateRepository $repository,
        private ProxmoxClientFactory $proxmoxClientFactory,
    ) {}

    /**
     * Get all active VM templates.
     */
    public function getActiveTemplates(): Collection
    {
        return $this->repository->findActive();
    }

    /**
     * Get available templates (not in maintenance).
     */
    public function getAvailableTemplates(): Collection
    {
        return $this->repository->findAvailable();
    }

    /**
     * Get templates with their current session and queue status.
     */
    public function getTemplatesWithStatus(): Collection
    {
        return $this->repository->findWithSessionStatus();
    }

    /**
     * Get templates assigned to a lesson.
     */
    public function getTemplatesForLesson(int $lessonId): Collection
    {
        return $this->repository->findForLesson($lessonId);
    }

    /**
     * Create a new VM template from a Proxmox VM.
     */
    public function createTemplate(array $data): VMTemplate
    {
        return $this->repository->create($data);
    }

    /**
     * Update a VM template.
     */
    public function updateTemplate(VMTemplate $template, array $data): VMTemplate
    {
        return $this->repository->update($template, $data);
    }

    /**
     * Delete a VM template.
     */
    public function deleteTemplate(VMTemplate $template): bool
    {
        if ($template->hasActiveSession()) {
            throw new \RuntimeException('Cannot delete template with active sessions.');
        }

        if ($template->lessonAssignments()->exists()) {
            throw new \RuntimeException('Cannot delete template assigned to lessons. Remove assignments first.');
        }

        return $this->repository->delete($template);
    }

    /**
     * Set maintenance mode on a template.
     */
    public function setMaintenance(VMTemplate $template, string $notes, ?\DateTime $until = null): VMTemplate
    {
        $template->setMaintenance($notes, $until);

        return $template;
    }

    /**
     * Clear maintenance mode.
     */
    public function clearMaintenance(VMTemplate $template): VMTemplate
    {
        $template->clearMaintenance();

        return $template;
    }

    /**
     * Sync VM templates from Proxmox servers.
     */
    public function syncFromProxmox(?int $serverId = null): array
    {
        $synced = [];
        $servers = $serverId
            ? [\App\Models\ProxmoxServer::findOrFail($serverId)]
            : \App\Models\ProxmoxServer::where('is_active', true)->get();

        foreach ($servers as $server) {
            try {
                $client = $this->proxmoxClientFactory->make($server);

                foreach ($server->nodes as $node) {
                    $vms = $client->listVMs($node->name);

                    foreach ($vms as $vm) {
                        if (! $this->isTemplate($vm)) {
                            continue;
                        }

                        $existing = $this->repository->findByServerAndVmid($server->id, $vm['vmid']);

                        if ($existing) {
                            $this->repository->update($existing, [
                                'name' => $vm['name'] ?? "VM-{$vm['vmid']}",
                            ]);
                            $synced[] = $existing;
                        } else {
                            $synced[] = $this->repository->create([
                                'proxmox_server_id' => $server->id,
                                'node_id' => $node->id,
                                'vmid' => $vm['vmid'],
                                'name' => $vm['name'] ?? "VM-{$vm['vmid']}",
                                'os_type' => $this->detectOsType($vm),
                                'protocol' => $this->detectProtocol($vm),
                            ]);
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::error("Failed to sync templates from server {$server->id}", [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $synced;
    }

    /**
     * Check if a VM should be treated as a template (based on naming or config).
     */
    private function isTemplate(array $vm): bool
    {
        // Consider VMs with 'template' in name or marked as templates
        if (isset($vm['template']) && $vm['template']) {
            return true;
        }

        $name = strtolower($vm['name'] ?? '');

        return str_contains($name, 'template') || str_contains($name, 'base');
    }

    /**
     * Detect OS type from VM info.
     */
    private function detectOsType(array $vm): string
    {
        $name = strtolower($vm['name'] ?? '');
        if (str_contains($name, 'windows') || str_contains($name, 'win')) {
            return 'windows';
        }

        return 'linux';
    }

    /**
     * Detect default protocol based on OS type.
     */
    private function detectProtocol(array $vm): string
    {
        $osType = $this->detectOsType($vm);

        return $osType === 'windows' ? 'rdp' : 'ssh';
    }
}
