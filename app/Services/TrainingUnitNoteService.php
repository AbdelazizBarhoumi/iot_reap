<?php

namespace App\Services;

use App\Models\TrainingUnitNote;
use App\Models\User;
use App\Repositories\TrainingUnitNoteRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;

class TrainingUnitNoteService
{
    public function __construct(
        private TrainingUnitNoteRepository $noteRepository,
        private EnrollmentService $enrollmentService,
    ) {}

    /**
     * Get all notes for a user on a specific trainingUnit.
     */
    public function getNotesForTrainingUnit(User $user, int $trainingUnitId): Collection
    {
        return $this->noteRepository->getNotesForTrainingUnit($user, $trainingUnitId);
    }

    /**
     * Get all notes for a user across a trainingPath.
     */
    public function getNotesForTrainingPath(User $user, int $trainingPathId): Collection
    {
        return $this->noteRepository->getNotesForTrainingPath($user, $trainingPathId);
    }

    /**
     * Create a new note for a trainingUnit.
     *
     * @throws AuthorizationException
     */
    public function createNote(
        User $user,
        int $trainingUnitId,
        string $content,
        ?int $timestampSeconds = null,
    ): TrainingUnitNote {
        return $this->noteRepository->create([
            'user_id' => $user->id,
            'training_unit_id' => $trainingUnitId,
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
    ): TrainingUnitNote {
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
