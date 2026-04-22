<?php

namespace App\Http\Controllers;

use App\Http\Requests\TrainingPath\CreateTrainingPathRequest;
use App\Http\Requests\TrainingPath\ReorderModulesRequest;
use App\Http\Requests\TrainingPath\ReorderTrainingUnitsRequest;
use App\Http\Requests\TrainingPath\StoreModuleRequest;
use App\Http\Requests\TrainingPath\StoreTrainingUnitRequest;
use App\Http\Requests\TrainingPath\UpdateModuleRequest;
use App\Http\Requests\TrainingPath\UpdateTrainingPathRequest;
use App\Http\Requests\TrainingPath\UpdateTrainingUnitRequest;
use App\Http\Resources\TrainingPathModuleResource;
use App\Http\Resources\TrainingPathResource;
use App\Http\Resources\TrainingUnitResource;
use App\Http\Resources\TrainingUnitVMAssignmentResource;
use App\Models\TrainingPath;
use App\Models\TrainingPathModule;
use App\Models\TrainingUnit;
use App\Models\TrainingUnitVMAssignment;
use App\Repositories\TrainingPathRepository;
use App\Services\TrainingPathService;
use App\Services\TrainingUnitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Controller for teaching/trainingPath management (instructor-facing).
 */
class TeachingController extends Controller
{
    public function __construct(
        private readonly TrainingPathService $trainingPathService,
        private readonly TrainingUnitService $trainingUnitService,
        private readonly TrainingPathRepository $trainingPathRepository,
    ) {}

    /**
     * Teaching dashboard - show instructor's trainingPaths.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $trainingPaths = $this->trainingPathService->getTrainingPathsByInstructor($request->user());

        // Calculate stats
        $stats = [
            'totalTrainingPaths' => $trainingPaths->count(),
            'totalStudents' => $trainingPaths->sum('student_count'),
            'avgRating' => $trainingPaths->avg('rating') ? round($trainingPaths->avg('rating'), 1) : 0,
            'completionRate' => $this->trainingPathService->getInstructorCompletionRate($request->user()),
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'data' => TrainingPathResource::collection($trainingPaths),
                'stats' => $stats,
            ]);
        }

        return Inertia::render('teaching/index', [
            'trainingPaths' => TrainingPathResource::collection($trainingPaths),
            'stats' => $stats,
        ]);
    }

    /**
     * Create trainingPath form.
     */
    public function create(): InertiaResponse
    {
        // Get unique categories from existing trainingPaths
        $categories = TrainingPath::query()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values()
            ->toArray();

        // Add default categories if none exist
        if (empty($categories)) {
            $categories = [
                'Smart Manufacturing',
                'Industrial IoT',
                'Predictive Maintenance',
                'OT Cybersecurity',
                'Robotics & Automation',
                'Edge AI & Digital Twins',
            ];
        }

        return Inertia::render('teaching/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new trainingPath.
     */
    public function store(CreateTrainingPathRequest $request): RedirectResponse
    {
        try {
            Log::info('Creating trainingPath', ['user' => $request->user()->id, 'data_keys' => array_keys($request->validated())]);

            $trainingPath = $this->trainingPathService->createTrainingPath(
                instructor: $request->user(),
                data: $request->validated(),
                modules: $request->validated('modules', []),
            );

            Log::info('TrainingPath created successfully', ['id' => $trainingPath->id]);

            return redirect()->route('teaching.edit', $trainingPath->id)
                ->with('success', 'TrainingPath created successfully! Now add content to your trainingUnits.');
        } catch (\Exception $e) {
            Log::error('TrainingPath creation failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create trainingPath: '.$e->getMessage()]);
        }
    }

    /**
     * Edit trainingPath form.
     */
    public function edit(Request $request, int $id): JsonResponse|InertiaResponse
    {
        $trainingPath = $this->trainingPathService->getTrainingPathWithContent($id);

        if (! $trainingPath) {
            abort(404);
        }

        // Only owner or admin can edit
        if (! $trainingPath->isOwnedBy($request->user()) && ! $request->user()->isAdmin()) {
            abort(403);
        }

        // Get unique categories from existing trainingPaths
        $categories = TrainingPath::query()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values()
            ->toArray();

        // Add default categories if none exist
        if (empty($categories)) {
            $categories = [
                'Smart Manufacturing',
                'Industrial IoT',
                'Predictive Maintenance',
                'OT Cybersecurity',
                'Robotics & Automation',
                'Edge AI & Digital Twins',
            ];
        }

        if ($request->wantsJson()) {
            return response()->json([
                'data' => new TrainingPathResource($trainingPath),
                'categories' => $categories,
            ]);
        }

        return Inertia::render('teaching/edit', [
            'id' => (string) $id,
            'trainingPath' => new TrainingPathResource($trainingPath),
            'categories' => $categories,
        ]);
    }

    /**
     * Update a trainingPath.
     */
    public function update(UpdateTrainingPathRequest $request, TrainingPath $trainingPath): JsonResponse
    {
        $updated = $this->trainingPathService->updateTrainingPath($trainingPath, $request->validated());

        return response()->json([
            'data' => new TrainingPathResource($updated),
            'message' => 'TrainingPath updated successfully',
        ]);
    }

    /**
     * Delete a trainingPath.
     */
    public function destroy(Request $request, TrainingPath $trainingPath): JsonResponse
    {
        // Only owner or admin can delete
        if (! $trainingPath->isOwnedBy($request->user()) && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $this->trainingPathService->deleteTrainingPath($trainingPath);

        return response()->json(['message' => 'TrainingPath deleted successfully']);
    }

    /**
     * Archive a trainingPath (soft-delete).
     */
    public function archive(Request $request, TrainingPath $trainingPath): JsonResponse
    {
        // Only owner or admin can archive
        if (! $trainingPath->isOwnedBy($request->user()) && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $updated = $this->trainingPathService->archiveTrainingPath($trainingPath);

        return response()->json([
            'data' => new TrainingPathResource($updated),
            'message' => 'TrainingPath archived successfully',
        ]);
    }

    /**
     * Restore an archived trainingPath.
     */
    public function restore(Request $request, TrainingPath $trainingPath): JsonResponse
    {
        // Only owner or admin can restore
        if (! $trainingPath->isOwnedBy($request->user()) && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $updated = $this->trainingPathService->restoreTrainingPath($trainingPath);

        return response()->json([
            'data' => new TrainingPathResource($updated),
            'message' => 'TrainingPath restored successfully',
        ]);
    }

    /**
     * Submit trainingPath for review.
     */
    public function submitForReview(Request $request, TrainingPath $trainingPath): JsonResponse
    {
        // Only owner can submit
        if (! $trainingPath->isOwnedBy($request->user())) {
            abort(403);
        }

        $updated = $this->trainingPathService->submitForReview($trainingPath);

        return response()->json([
            'data' => new TrainingPathResource($updated),
            'message' => 'TrainingPath submitted for review',
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Module Management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Add a module to a trainingPath.
     */
    public function storeModule(StoreModuleRequest $request, TrainingPath $trainingPath): JsonResponse
    {
        // Authorization is handled in StoreModuleRequest
        $module = $this->trainingUnitService->addModule($trainingPath->id, $request->validated());

        return response()->json([
            'data' => new TrainingPathModuleResource($module->load('trainingUnits')),
            'message' => 'Module added successfully',
        ], 201);
    }

    /**
     * Update a module.
     */
    public function updateModule(UpdateModuleRequest $request, TrainingPath $trainingPath, TrainingPathModule $module): JsonResponse
    {
        // Authorization is handled in UpdateModuleRequest
        $updated = $this->trainingUnitService->updateModule($module, $request->validated());

        return response()->json([
            'data' => new TrainingPathModuleResource($updated->load('trainingUnits')),
            'message' => 'Module updated successfully',
        ]);
    }

    /**
     * Delete a module.
     */
    public function destroyModule(Request $request, TrainingPath $trainingPath, TrainingPathModule $module): JsonResponse
    {
        if (! $trainingPath->isOwnedBy($request->user()) && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $this->trainingUnitService->deleteModule($module);

        return response()->json(['message' => 'Module deleted successfully']);
    }

    /**
     * Reorder modules within a trainingPath.
     */
    public function reorderModules(ReorderModulesRequest $request, TrainingPath $trainingPath): JsonResponse
    {
        $this->trainingUnitService->reorderModules($trainingPath->id, $request->validated('order'));

        return response()->json(['message' => 'Modules reordered successfully']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TrainingUnit Management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * TrainingUnit edit page.
     */
    public function editTrainingUnit(Request $request, int $trainingPathId, int $moduleId, int $trainingUnitId): JsonResponse|InertiaResponse
    {
        $trainingUnit = $this->trainingUnitService->getTrainingUnitWithContext($trainingUnitId);

        if (! $trainingUnit || $trainingUnit->module->training_path_id !== $trainingPathId) {
            abort(404);
        }

        $trainingPath = $trainingUnit->module->trainingPath;
        $vmAssignment = TrainingUnitVMAssignment::query()
            ->where('training_unit_id', $trainingUnitId)
            ->with(['node', 'assignedByUser', 'approvedByUser'])
            ->latest('created_at')
            ->first();

        if (! $trainingPath->isOwnedBy($request->user()) && ! $request->user()->isAdmin()) {
            abort(403);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'trainingUnit' => new TrainingUnitResource($trainingUnit),
                'trainingPath' => new TrainingPathResource($trainingPath->load('modules.trainingUnits')),
                'vmAssignment' => $vmAssignment ? new TrainingUnitVMAssignmentResource($vmAssignment) : null,
            ]);
        }

        return Inertia::render('teaching/trainingUnit-edit', [
            'trainingPathId' => (string) $trainingPathId,
            'moduleId' => (string) $moduleId,
            'trainingUnitId' => (string) $trainingUnitId,
            'trainingUnit' => new TrainingUnitResource($trainingUnit),
            'trainingPath' => new TrainingPathResource($trainingPath->load('modules.trainingUnits')),
            'vmAssignment' => $vmAssignment ? new TrainingUnitVMAssignmentResource($vmAssignment) : null,
        ]);
    }

    /**
     * Add a trainingUnit to a module.
     */
    public function storeTrainingUnit(StoreTrainingUnitRequest $request, TrainingPath $trainingPath, TrainingPathModule $module): JsonResponse
    {
        // Authorization is handled in StoreTrainingUnitRequest
        $trainingUnit = $this->trainingUnitService->addTrainingUnit($module->id, $request->validated());

        return response()->json([
            'data' => new TrainingUnitResource($trainingUnit),
            'message' => 'TrainingUnit added successfully',
        ], 201);
    }

    /**
     * Update a trainingUnit.
     */
    public function updateTrainingUnit(UpdateTrainingUnitRequest $request, TrainingPath $trainingPath, TrainingPathModule $module, TrainingUnit $trainingUnit): JsonResponse
    {
        // Authorization is handled in UpdateTrainingUnitRequest
        $updated = $this->trainingUnitService->updateTrainingUnit($trainingUnit, $request->validated());

        return response()->json([
            'data' => new TrainingUnitResource($updated),
            'message' => 'TrainingUnit updated successfully',
        ]);
    }

    /**
     * Delete a trainingUnit.
     */
    public function destroyTrainingUnit(Request $request, TrainingPath $trainingPath, TrainingPathModule $module, TrainingUnit $trainingUnit): JsonResponse
    {
        if (! $trainingPath->isOwnedBy($request->user()) && ! $request->user()->isAdmin()) {
            abort(403);
        }

        $this->trainingUnitService->deleteTrainingUnit($trainingUnit);

        return response()->json(['message' => 'TrainingUnit deleted successfully']);
    }

    /**
     * Reorder trainingUnits within a module.
     */
    public function reorderTrainingUnits(ReorderTrainingUnitsRequest $request, TrainingPath $trainingPath, TrainingPathModule $module): JsonResponse
    {
        $this->trainingUnitService->reorderTrainingUnits($module->id, $request->validated('order'));

        return response()->json(['message' => 'TrainingUnits reordered successfully']);
    }
}
