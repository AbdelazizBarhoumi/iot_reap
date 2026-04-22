<?php

namespace App\Repositories;

use App\Models\TrainingUnitNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TrainingUnitNoteRepository
{
    /**
     * Get all notes for a user on a specific trainingUnit.
     */
    public function getNotesForTrainingUnit(User $user, int $trainingUnitId): Collection
    {
        return TrainingUnitNote::where('user_id', $user->id)
            ->where('training_unit_id', $trainingUnitId)
            ->orderBy('timestamp_seconds')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get all notes for a user across all trainingUnits in a trainingPath.
     */
    public function getNotesForTrainingPath(User $user, int $trainingPathId): Collection
    {
        return TrainingUnitNote::where('user_id', $user->id)
            ->whereHas('trainingUnit.module', fn ($q) => $q->where('training_path_id', $trainingPathId))
            ->with('trainingUnit:id,title')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create a new note.
     */
    public function create(array $data): TrainingUnitNote
    {
        return TrainingUnitNote::create($data);
    }

    /**
     * Update an existing note.
     */
    public function update(TrainingUnitNote $note, array $data): TrainingUnitNote
    {
        $note->update($data);

        return $note->fresh();
    }

    /**
     * Delete a note.
     */
    public function delete(TrainingUnitNote $note): bool
    {
        return $note->delete();
    }

    /**
     * Find a note by ID (scoped to user for security).
     *
     * @throws ModelNotFoundException
     */
    public function find(int $id, User $user): TrainingUnitNote
    {
        return TrainingUnitNote::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
    }

    /**
     * Find a note owned by a specific user (alias for find).
     *
     * @deprecated Use find() instead - it now requires user scoping
     */
    public function findByUser(int $id, User $user): ?TrainingUnitNote
    {
        return TrainingUnitNote::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
    }
}
