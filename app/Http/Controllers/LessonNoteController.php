<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLessonNoteRequest;
use App\Http\Requests\UpdateLessonNoteRequest;
use App\Http\Resources\LessonNoteResource;
use App\Services\LessonNoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonNoteController extends Controller
{
    public function __construct(
        private LessonNoteService $noteService,
    ) {}

    /**
     * Get all notes for a lesson.
     */
    public function index(Request $request, int $lessonId): JsonResponse
    {
        $notes = $this->noteService->getNotesForLesson(
            user: $request->user(),
            lessonId: $lessonId,
        );

        return response()->json([
            'data' => LessonNoteResource::collection($notes),
        ]);
    }

    /**
     * Get all notes for a course.
     */
    public function courseNotes(Request $request, int $courseId): JsonResponse
    {
        $notes = $this->noteService->getNotesForCourse(
            user: $request->user(),
            courseId: $courseId,
        );

        return response()->json([
            'data' => LessonNoteResource::collection($notes),
        ]);
    }

    /**
     * Store a new note.
     */
    public function store(StoreLessonNoteRequest $request, int $lessonId): JsonResponse
    {
        $note = $this->noteService->createNote(
            user: $request->user(),
            lessonId: $lessonId,
            content: $request->validated('content'),
            timestampSeconds: $request->validated('timestamp_seconds'),
        );

        return response()->json([
            'data' => new LessonNoteResource($note),
            'message' => 'Note created successfully.',
        ], 201);
    }

    /**
     * Update a note.
     */
    public function update(UpdateLessonNoteRequest $request, int $lessonId, int $noteId): JsonResponse
    {
        $note = $this->noteService->updateNote(
            user: $request->user(),
            noteId: $noteId,
            content: $request->validated('content'),
            timestampSeconds: $request->validated('timestamp_seconds'),
        );

        return response()->json([
            'data' => new LessonNoteResource($note),
            'message' => 'Note updated successfully.',
        ]);
    }

    /**
     * Delete a note.
     */
    public function destroy(Request $request, int $lessonId, int $noteId): JsonResponse
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
