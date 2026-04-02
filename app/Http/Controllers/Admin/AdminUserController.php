<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SuspendUserRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminUserController extends Controller
{
    public function __construct(
        private readonly UserManagementService $userManagementService,
    ) {}

    /**
     * List all users with filtering and pagination.
     */
    public function index(Request $request): JsonResponse|InertiaResponse
    {
        $users = $this->userManagementService->getUsers(
            perPage: $request->integer('per_page', 15),
            search: $request->string('search')->toString() ?: null,
            role: $request->string('role')->toString() ?: null,
            status: $request->string('status')->toString() ?: null,
            sortBy: $request->string('sort_by', 'created_at')->toString(),
            sortDirection: $request->string('sort_direction', 'desc')->toString(),
        );

        if ($request->wantsJson()) {
            return response()->json([
                'data' => UserResource::collection($users),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ]);
        }

        return Inertia::render('admin/UsersPage', [
            'users' => UserResource::collection($users),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'role' => $request->string('role')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'roles' => collect(UserRole::cases())->map(fn ($r) => [
                'value' => $r->value,
                'label' => $r->label(),
            ]),
            'stats' => $this->userManagementService->getStats(),
        ]);
    }

    /**
     * Get user detail.
     */
    public function show(User $user): JsonResponse
    {
        $userWithDetails = $this->userManagementService->getUserDetail($user->id);

        return response()->json([
            'data' => new UserResource($userWithDetails),
        ]);
    }

    /**
     * Suspend a user.
     */
    public function suspend(SuspendUserRequest $request, User $user): JsonResponse
    {
        $suspended = $this->userManagementService->suspend(
            user: $user,
            reason: $request->validated('reason'),
            admin: $request->user(),
        );

        return response()->json([
            'data' => new UserResource($suspended),
            'message' => 'User suspended successfully',
        ]);
    }

    /**
     * Unsuspend a user.
     */
    public function unsuspend(Request $request, User $user): JsonResponse
    {
        $unsuspended = $this->userManagementService->unsuspend(
            user: $user,
            admin: $request->user(),
        );

        return response()->json([
            'data' => new UserResource($unsuspended),
            'message' => 'User unsuspended successfully',
        ]);
    }

    /**
     * Update user role.
     */
    public function updateRole(UpdateUserRoleRequest $request, User $user): JsonResponse
    {
        $updated = $this->userManagementService->updateRole(
            user: $user,
            newRole: UserRole::from($request->validated('role')),
            admin: $request->user(),
        );

        return response()->json([
            'data' => new UserResource($updated),
            'message' => 'User role updated successfully',
        ]);
    }

    /**
     * Start impersonating a user.
     */
    public function impersonate(Request $request, User $user): RedirectResponse
    {
        $this->userManagementService->startImpersonation(
            targetUser: $user,
            admin: $request->user(),
        );

        return redirect()->route('dashboard')->with('info', "Now impersonating {$user->name}");
    }

    /**
     * Stop impersonation.
     */
    public function stopImpersonation(): RedirectResponse
    {
        $admin = $this->userManagementService->stopImpersonation();

        if ($admin) {
            return redirect()->route('admin.users.index')->with('success', 'Impersonation ended');
        }

        return redirect()->route('dashboard');
    }

    /**
     * GDPR delete a user (anonymize PII, keep transaction records).
     */
    public function gdprDelete(Request $request, User $user): JsonResponse
    {
        $this->userManagementService->gdprDelete(
            user: $user,
            admin: $request->user(),
        );

        return response()->json([
            'message' => 'User data anonymized successfully (GDPR deletion)',
        ]);
    }
}
