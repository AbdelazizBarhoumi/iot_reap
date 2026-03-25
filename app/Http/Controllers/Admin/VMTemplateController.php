<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVMTemplateRequest;
use App\Http\Requests\UpdateVMTemplateRequest;
use App\Http\Resources\VMTemplateResource;
use App\Models\VMTemplate;
use App\Services\VMTemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VMTemplateController extends Controller
{
    public function __construct(
        private VMTemplateService $templateService,
    ) {}

    /**
     * List all VM templates.
     */
    public function index(Request $request): JsonResponse|Response
    {
        Gate::authorize('admin-only');

        $templates = $this->templateService->getTemplatesWithStatus();

        if ($request->wantsJson()) {
            return response()->json([
                'data' => VMTemplateResource::collection($templates),
            ]);
        }

        return Inertia::render('admin/VMTemplatesPage', [
            'templates' => VMTemplateResource::collection($templates),
        ]);
    }

    /**
     * Get available templates (for assignment dropdowns).
     */
    public function available(Request $request): JsonResponse
    {
        $templates = $this->templateService->getAvailableTemplates();

        return response()->json([
            'data' => VMTemplateResource::collection($templates),
        ]);
    }

    /**
     * Show a single template.
     */
    public function show(Request $request, VMTemplate $template): JsonResponse
    {
        Gate::authorize('admin-only');

        $template->load(['proxmoxServer', 'node']);
        $template->current_session = $template->getCurrentSession();
        $template->queue_count = $template->queueEntries()->count();

        return response()->json([
            'data' => new VMTemplateResource($template),
        ]);
    }

    /**
     * Create a new VM template.
     */
    public function store(StoreVMTemplateRequest $request): JsonResponse
    {
        $template = $this->templateService->createTemplate($request->validated());

        return response()->json([
            'data' => new VMTemplateResource($template->load(['proxmoxServer', 'node'])),
            'message' => 'VM template created successfully.',
        ], 201);
    }

    /**
     * Update a VM template.
     */
    public function update(UpdateVMTemplateRequest $request, VMTemplate $template): JsonResponse
    {
        $data = $request->validated();

        // Handle maintenance mode updates
        if (isset($data['maintenance_mode'])) {
            if ($data['maintenance_mode']) {
                $until = isset($data['maintenance_until']) ? new \DateTime($data['maintenance_until']) : null;
                $this->templateService->setMaintenance($template, $data['maintenance_notes'] ?? '', $until);
                unset($data['maintenance_mode'], $data['maintenance_notes'], $data['maintenance_until']);
            } else {
                $this->templateService->clearMaintenance($template);
                unset($data['maintenance_mode'], $data['maintenance_notes'], $data['maintenance_until']);
            }
        }

        if (! empty($data)) {
            $template = $this->templateService->updateTemplate($template, $data);
        }

        return response()->json([
            'data' => new VMTemplateResource($template->fresh(['proxmoxServer', 'node'])),
            'message' => 'VM template updated successfully.',
        ]);
    }

    /**
     * Delete a VM template.
     */
    public function destroy(VMTemplate $template): JsonResponse
    {
        Gate::authorize('admin-only');

        try {
            $this->templateService->deleteTemplate($template);

            return response()->json(['message' => 'VM template deleted successfully.']);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Sync templates from Proxmox.
     */
    public function sync(Request $request): JsonResponse
    {
        Gate::authorize('admin-only');

        $serverId = $request->input('server_id');
        $synced = $this->templateService->syncFromProxmox($serverId);

        return response()->json([
            'data' => VMTemplateResource::collection(collect($synced)),
            'message' => count($synced).' template(s) synced.',
        ]);
    }

    /**
     * Set maintenance mode.
     */
    public function setMaintenance(Request $request, VMTemplate $template): JsonResponse
    {
        Gate::authorize('admin-only');

        $request->validate([
            'notes' => ['required', 'string', 'max:2000'],
            'until' => ['nullable', 'date', 'after:now'],
        ]);

        $until = $request->input('until') ? new \DateTime($request->input('until')) : null;
        $this->templateService->setMaintenance($template, $request->input('notes'), $until);

        return response()->json([
            'data' => new VMTemplateResource($template->fresh()),
            'message' => 'Maintenance mode enabled.',
        ]);
    }

    /**
     * Clear maintenance mode.
     */
    public function clearMaintenance(VMTemplate $template): JsonResponse
    {
        Gate::authorize('admin-only');

        $this->templateService->clearMaintenance($template);

        return response()->json([
            'data' => new VMTemplateResource($template->fresh()),
            'message' => 'Maintenance mode cleared.',
        ]);
    }
}
