<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateConnectionPreferencesRequest;
use App\Models\VMSession;
use App\Repositories\UserConnectionPreferenceRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Manages a user's saved Guacamole connection preferences per VM session type.
 *
 * Preferences are protocol-scoped (rdp / vnc / ssh) and belong to the session owner.
 * They are applied when building the Guacamole connection to the actual running VM.
 */
class ConnectionPreferencesController extends Controller
{
    public function __construct(
        private readonly UserConnectionPreferenceRepository $preferenceRepository,
    ) {}

    /**
     * GET /vm-sessions/{session}/connection-preferences
     *
     * Return the current user's saved Guacamole settings for this session's protocol.
     * Returns an empty 'parameters' object (not 404) when no preferences have been saved.
     */
    public function show(Request $request, VMSession $session): JsonResponse
    {
        // Only the session owner may read their preferences
        if ($session->user_id !== $request->user()->id) {
            abort(403, 'You are not the owner of this session.');
        }

        $protocol   = $session->template->protocol->value;
        $preference = $this->preferenceRepository->findByUser($request->user(), $protocol);

        return response()->json([
            'data' => [
                'vm_session_type' => $protocol,
                'parameters'      => $preference?->parameters ?? (object) [],
            ],
        ]);
    }

    /**
     * PATCH /vm-sessions/{session}/connection-preferences
     *
     * Save (create or update) the current user's Guacamole settings for this session's protocol.
     * Authorization is handled by UpdateConnectionPreferencesRequest::authorize().
     */
    public function update(UpdateConnectionPreferencesRequest $request, VMSession $session): JsonResponse
    {
        $protocol   = $session->template->protocol->value;
        $preference = $this->preferenceRepository->save(
            user:        $request->user(),
            sessionType: $protocol,
            params:      $request->validated('parameters'),
        );

        return response()->json([
            'data' => [
                'vm_session_type' => $protocol,
                'parameters'      => $preference->parameters,
            ],
        ]);
    }
}
