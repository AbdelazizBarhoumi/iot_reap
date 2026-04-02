<?php

namespace App\Services;

use App\Models\LessonNote;
use App\Models\User;
use App\Repositories\LessonNoteRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;

class LessonNoteService
{
    public function __construct(
        private LessonNoteRepository $noteRepository,
        private EnrollmentService $enrollmentService,
    ) {}

    /**
     * Get all notes for a user on a specific lesson.
     */
    public function getNotesForLesson(User $user, int $lessonId): Collection
    {
        return $this->noteRepository->getNotesForLesson($user, $lessonId);
    }

    /**
     * Get all notes for a user across a course.
     */
    public function getNotesForCourse(User $user, int $courseId): Collection
    {
        return $this->noteRepository->getNotesForCourse($user, $courseId);
    }

    /**
     * Create a new note for a lesson.
     *
     * @throws AuthorizationException
     */
    public function createNote(
        User $user,
        int $lessonId,
        string $content,
        ?int $timestampSeconds = null,
    ): LessonNote {
        return $this->noteRepository->create([
            'user_id' => $user->id,
            'lesson_id' => $lessonId,
            'content' => $content,
            'timestamp_seconds' => $timestampSeconds,
        ]);
    }

    /**
     * Update an existing note.
     *
     * @throws AuthorizationException
     */
    public function updateNote(
        User $user,
        int $noteId,
        string $content,
        ?int $timestampSeconds = null,
    ): LessonNote {
        $note = $this->noteRepository->findByUser($noteId, $user);

        if (! $note) {
            throw new AuthorizationException('Note not found or access denied.');
        }

        return $this->noteRepository->update($note, [
            'content' => $content,
            'timestamp_seconds' => $timestampSeconds,
        ]);
    }

    /**
     * Delete a note.
     *
     * @throws AuthorizationException
     */
    public function deleteNote(User $user, int $noteId): bool
    {
        $note = $this->noteRepository->findByUser($noteId, $user);

        if (! $note) {
            throw new AuthorizationException('Note not found or access denied.');
        }

        return $this->noteRepository->delete($note);
    }
}
