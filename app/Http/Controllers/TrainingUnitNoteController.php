<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTrainingUnitNoteRequest;
use App\Http\Requests\UpdateTrainingUnitNoteRequest;
use App\Http\Resources\TrainingUnitNoteResource;
use App\Services\TrainingUnitNoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingUnitNoteController extends Controller
{
    public function __construct(
        private TrainingUnitNoteService $noteService,
    ) {}

    /**
     * Get all notes for a trainingUnit.
     */
    public function index(Request $request, int $trainingUnitId): JsonResponse
    {
        $notes = $this->noteService->getNotesForTrainingUnit(
            user: $request->user(),
            trainingUnitId: $trainingUnitId,
        );

        return response()->json([
            'data' => TrainingUnitNoteResource::collection($notes),
        ]);
    }

    /**
     * Get all notes for a trainingPath.
     */
    public function trainingPathNotes(Request $request, int $trainingPathId): JsonResponse
    {
        $notes = $this->noteService->getNotesForTrainingPath(
            user: $request->user(),
            trainingPathId: $trainingPathId,
        );

        return response()->json([
            'data' => TrainingUnitNoteResource::collection($notes),
        ]);
    }

    /**
     * Store a new note.
     */
    public function store(StoreTrainingUnitNoteRequest $request, int $trainingUnitId): JsonResponse
    {
        $note = $this->noteService->createNote(
            user: $request->user(),
            trainingUnitId: $trainingUnitId,
            content: $request->validated('content'),
            timestampSeconds: $request->validated('timestamp_seconds'),
        );

        return response()->json([
            'data' => new TrainingUnitNoteResource($note),
            'message' => 'Note created successfully.',
        ], 201);
    }

    /**
     * Update a note.
     */
    public function update(UpdateTrainingUnitNoteRequest $request, int $trainingUnitId, int $noteId): JsonResponse
    {
        $note = $this->noteService->updateNote(
            user: $request->user(),
            noteId: $noteId,
            content: $request->validated('content'),
            timestampSeconds: $request->validated('timestamp_seconds'),
        );

        return response()->json([
            'data' => new TrainingUnitNoteResource($note),
            'message' => 'Note updated successfully.',
        ]);
    }

    /**
     * Delete a note.
     */
    public function destroy(Request $request, int $trainingUnitId, int $noteId): JsonResponse
    {
        $this->noteService->deleteNote(
            user: $request->user(),
            noteId: $noteId,
        );

        return response()->json([
            'message' => 'Note deleted successfully.',
        ]);
    }
}
