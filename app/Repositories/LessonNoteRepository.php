<?php

namespace App\Repositories;

use App\Models\LessonNote;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class LessonNoteRepository
{
    /**
     * Get all notes for a user on a specific lesson.
     */
    public function getNotesForLesson(User $user, int $lessonId): Collection
    {
        return LessonNote::where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->orderBy('timestamp_seconds')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get all notes for a user across all lessons in a course.
     */
    public function getNotesForCourse(User $user, int $courseId): Collection
    {
        return LessonNote::where('user_id', $user->id)
            ->whereHas('lesson.module', fn ($q) => $q->where('course_id', $courseId))
            ->with('lesson:id,title')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Create a new note.
     */
    public function create(array $data): LessonNote
    {
        return LessonNote::create($data);
    }

    /**
     * Update an existing note.
     */
    public function update(LessonNote $note, array $data): LessonNote
    {
        $note->update($data);

        return $note->fresh();
    }

    /**
     * Delete a note.
     */
    public function delete(LessonNote $note): bool
    {
        return $note->delete();
    }

    /**
     * Find a note by ID (scoped to user for security).
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function find(int $id, User $user): LessonNote
    {
        return LessonNote::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
    }

    /**
     * Find a note owned by a specific user (alias for find).
     *
     * @deprecated Use find() instead - it now requires user scoping
     */
    public function findByUser(int $id, User $user): ?LessonNote
    {
        return LessonNote::where('id', $id)
            ->where('user_id', $user->id)
            ->first();
    }
}
