<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateVMTemplateRequest;
use App\Http\Resources\VMTemplateResource;
use App\Models\VMTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controller for admin VM template management.
 */
class VMTemplateController extends Controller
{
    /**
     * Get all templates.
     */
    public function index(Request $request)
    {
        $templates = VMTemplate::orderBy('name')->get();

        if ($request->wantsJson()) {
            return response()->json([
                'data' => VMTemplateResource::collection($templates),
            ]);
        }

        // Normal browser visit -> render Inertia page (client will call API to fetch data)
        return Inertia::render('admin/TemplatesPage');
    }

    /**
     * Create a new template.
     */
    public function store(CreateVMTemplateRequest $request): JsonResponse
    {
        $template = VMTemplate::create($request->validated());

        return response()->json(
            new VMTemplateResource($template),
            201
        );
    }

    /**
     * Get a specific template.
     */
    public function show(int $templateId): JsonResponse
    {
        $template = VMTemplate::findOrFail($templateId);

        return response()->json(
            new VMTemplateResource($template)
        );
    }

    /**
     * Update a template.
     */
    public function update(CreateVMTemplateRequest $request, int $templateId): JsonResponse
    {
        $template = VMTemplate::findOrFail($templateId);
        $template->update($request->validated());

        return response()->json(
            new VMTemplateResource($template->fresh())
        );
    }

    /**
     * Delete a template.
     */
    public function destroy(int $templateId): JsonResponse
    {
        $template = VMTemplate::findOrFail($templateId);
        $template->delete();

        return response()->json(['message' => 'Template deleted'], 200);
    }
}
