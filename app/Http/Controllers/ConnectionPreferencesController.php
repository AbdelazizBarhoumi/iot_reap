<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreConnectionProfileRequest;
use App\Http\Requests\UpdateConnectionPreferencesRequest;
use App\Repositories\UserConnectionPreferenceRepository;
use App\Repositories\UserVMConnectionDefaultProfileRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

/**
 * Manages a user's saved Guacamole connection profiles per protocol.
 *
 * Users can have multiple named profiles per protocol (rdp / vnc / ssh),
 * with one marked as default that gets applied automatically.
 */
class ConnectionPreferencesController extends Controller
{
    private const VALID_PROTOCOLS = ['rdp', 'vnc', 'ssh'];

    public function __construct(
        private readonly UserConnectionPreferenceRepository $preferenceRepository,
        private readonly UserVMConnectionDefaultProfileRepository $vmDefaultRepository,
    ) {}

    /**
     * GET /connection-preferences
     *
     * Show the connection preferences management page (Inertia),
     * or return all profiles grouped by protocol as JSON when requested via XHR.
     */
    public function index(Request $request): InertiaResponse|JsonResponse
    {
        $user = $request->user();

        // Get all profiles for user, grouped by protocol
        $allProfiles = $this->preferenceRepository->findAllProfilesForUser($user);

        $profiles = [
            'rdp' => [],
            'vnc' => [],
            'ssh' => [],
        ];

        foreach ($allProfiles as $profile) {
            $profiles[$profile->vm_session_type][] = [
                'profile_name' => $profile->profile_name,
                'is_default' => (bool) $profile->is_default,
                'parameters' => $profile->parameters ?? (object) [],
            ];
        }

        if ($request->wantsJson()) {
            return response()->json(['data' => $profiles]);
        }

        return Inertia::render('ConnectionPreferences', [
            'profiles' => $profiles,
        ]);
    }

    /**
     * GET /connection-preferences/{protocol}
     *
     * Return all profiles for a specific protocol.
     */
    public function show(Request $request, string $protocol): JsonResponse
    {
        $protocol = strtolower($protocol);
        $this->validateProtocol($protocol);

        $profiles = $this->preferenceRepository->findAllByUser($request->user(), $protocol);

        return response()->json([
            'data' => [
                'protocol' => $protocol,
                'profiles' => $profiles->map(fn ($p) => [
                    'profile_name' => $p->profile_name,
                    'is_default' => (bool) $p->is_default,
                    'parameters' => $p->parameters ?? (object) [],
                ])->values(),
            ],
        ]);
    }

    /**
     * POST /connection-preferences/{protocol}
     *
     * Create a new profile for a protocol.
     */
    public function store(StoreConnectionProfileRequest $request, string $protocol): JsonResponse
    {
        Gate::authorize('admin-only');

        $protocol = strtolower($protocol);
        $this->validateProtocol($protocol);

        $profileName = $request->validated('profile_name');
        $isDefault = $request->validated('is_default', false);

        // Check if profile name already exists
        $existing = $this->preferenceRepository->findByProfile($request->user(), $protocol, $profileName);
        if ($existing) {
            abort(422, "A profile named '{$profileName}' already exists for {$protocol}.");
        }

        $profile = $this->preferenceRepository->save(
            user: $request->user(),
            sessionType: $protocol,
            params: $request->validated('parameters', []),
            profileName: $profileName,
            isDefault: $isDefault,
        );

        return response()->json([
            'data' => [
                'protocol' => $protocol,
                'profile_name' => $profile->profile_name,
                'is_default' => (bool) $profile->is_default,
                'parameters' => $profile->parameters,
            ],
        ], 201);
    }

    /**
     * PUT /connection-preferences/{protocol}/{profile}
     *
     * Update an existing profile's parameters.
     */
    public function update(UpdateConnectionPreferencesRequest $request, string $protocol, string $profile = 'Default'): JsonResponse
    {
        Gate::authorize('admin-only');

        $protocol = strtolower($protocol);
        $this->validateProtocol($protocol);

        $existing = $this->preferenceRepository->findByProfile($request->user(), $protocol, $profile);
        if (! $existing) {
            abort(404, "Profile '{$profile}' not found for {$protocol}.");
        }

        $isDefault = $request->has('is_default')
            ? $request->validated('is_default')
            : $existing->is_default;

        $preference = $this->preferenceRepository->save(
            user: $request->user(),
            sessionType: $protocol,
            params: $request->validated('parameters'),
            profileName: $profile,
            isDefault: $isDefault,
        );

        return response()->json([
            'data' => [
                'protocol' => $protocol,
                'profile_name' => $preference->profile_name,
                'is_default' => (bool) $preference->is_default,
                'parameters' => $preference->parameters,
            ],
        ]);
    }

    /**
     * DELETE /connection-preferences/{protocol}/{profile}
     *
     * Delete a specific profile.
     */
    public function destroy(Request $request, string $protocol, string $profile): JsonResponse
    {
        Gate::authorize('admin-only');

        $protocol = strtolower($protocol);
        $this->validateProtocol($protocol);

        $deleted = $this->preferenceRepository->delete($request->user(), $protocol, $profile);

        if (! $deleted) {
            abort(404, "Profile '{$profile}' not found for {$protocol}.");
        }

        return response()->json(['message' => 'Profile deleted.']);
    }

    /**
     * PATCH /connection-preferences/{protocol}/{profile}/default
     *
     * Set a profile as the default for its protocol.
     */
    public function setDefault(Request $request, string $protocol, string $profile): JsonResponse
    {
        Gate::authorize('admin-only');

        $protocol = strtolower($protocol);
        $this->validateProtocol($protocol);

        $updated = $this->preferenceRepository->setDefault($request->user(), $protocol, $profile);

        if (! $updated) {
            abort(404, "Profile '{$profile}' not found for {$protocol}.");
        }

        return response()->json(['message' => "'{$profile}' set as default for {$protocol}."]);
    }

    /**
     * GET /connection-preferences/vm/{vmId}/{protocol}
     *
     * Get the per-VM preferred profile for a specific VM and protocol.
     */
    public function getPerVMDefault(Request $request, int $vmId, string $protocol): JsonResponse
    {
        $protocol = strtolower($protocol);
        $this->validateProtocol($protocol);

        $vmDefault = $this->vmDefaultRepository->findPerVMDefault(
            user: $request->user(),
            vmId: $vmId,
            protocol: $protocol,
        );

        if (! $vmDefault) {
            return response()->json([
                'data' => [
                    'vm_id' => $vmId,
                    'protocol' => $protocol,
                    'preferred_profile_name' => null,
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'vm_id' => $vmId,
                'protocol' => $protocol,
                'preferred_profile_name' => $vmDefault->preferred_profile_name,
            ],
        ]);
    }

    /**
     * POST/PATCH /connection-preferences/vm/{vmId}/{protocol}/default
     *
     * Set the preferred profile for a specific VM and protocol.
     */
    public function setPerVMDefault(Request $request, int $vmId, string $protocol): JsonResponse
    {
        Gate::authorize('admin-only');

        $protocol = strtolower($protocol);
        $this->validateProtocol($protocol);

        $request->validate([
            'profile_name' => ['required', 'string', 'max:100'],
        ]);

        $profileName = $request->validated('profile_name');

        // Verify that the profile exists for the user + protocol
        $profile = $this->preferenceRepository->findByProfile(
            $request->user(),
            $protocol,
            $profileName,
        );

        if (! $profile) {
            abort(404, "Profile '{$profileName}' not found for {$protocol}.");
        }

        $vmDefault = $this->vmDefaultRepository->setPerVMDefault(
            user: $request->user(),
            vmId: $vmId,
            protocol: $protocol,
            profileName: $profileName,
        );

        return response()->json([
            'data' => [
                'vm_id' => $vmId,
                'protocol' => $protocol,
                'preferred_profile_name' => $vmDefault->preferred_profile_name,
            ],
        ]);
    }

    /**
     * PATCH /connection-preferences/vm/{vmId}/{protocol}/default
     *
     * Alias for setPerVMDefault to keep POST/PATCH routes explicit for
     * frontend action type generation.
     */
    public function updatePerVMDefault(Request $request, int $vmId, string $protocol): JsonResponse
    {
        Gate::authorize('admin-only');

        return $this->setPerVMDefault($request, $vmId, $protocol);
    }

    /**
     * DELETE /connection-preferences/vm/{vmId}/{protocol}/default
     *
     * Clear the per-VM preferred profile (revert to protocol default).
     */
    public function deletePerVMDefault(Request $request, int $vmId, string $protocol): JsonResponse
    {
        Gate::authorize('admin-only');

        $protocol = strtolower($protocol);
        $this->validateProtocol($protocol);

        $deleted = $this->vmDefaultRepository->deletePerVMDefault(
            user: $request->user(),
            vmId: $vmId,
            protocol: $protocol,
        );

        if (! $deleted) {
            // It's okay if it doesn't exist; return success anyway
        }

        return response()->json(['message' => 'Per-VM default cleared for VM '.$vmId]);
    }

    /**
     * Validate that the protocol is one of the allowed values.
     */
    private function validateProtocol(string $protocol): void
    {
        if (! in_array($protocol, self::VALID_PROTOCOLS)) {
            abort(422, 'Invalid protocol. Must be rdp, vnc, or ssh.');
        }
    }
}
