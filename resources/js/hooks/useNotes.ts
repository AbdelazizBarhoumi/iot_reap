/**
 * useNotes hook for managing trainingUnit notes.
 */
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type {
    TrainingUnitNote,
    CreateNoteData,
    UpdateNoteData,
} from '@/api/notes.api';
import { notesApi } from '@/api/notes.api';
interface UseNotesOptions {
    trainingUnitId: number;
    autoFetch?: boolean;
}
interface UseNotesReturn {
    notes: TrainingUnitNote[];
    loading: boolean;
    error: string | null;
    fetchNotes: () => Promise<void>;
    createNote: (data: CreateNoteData) => Promise<TrainingUnitNote | null>;
    updateNote: (
        noteId: number,
        data: UpdateNoteData,
    ) => Promise<TrainingUnitNote | null>;
    deleteNote: (noteId: number) => Promise<boolean>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}
export function useNotes({
    trainingUnitId,
    autoFetch = true,
}: UseNotesOptions): UseNotesReturn {
    const [notes, setNotes] = useState<TrainingUnitNote[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fetchNotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await notesApi.getNotesForTrainingUnit(trainingUnitId);
            setNotes(data);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to load notes';
            setError(message);
            console.error('Error fetching notes:', err);
        } finally {
            setLoading(false);
        }
    }, [trainingUnitId]);
    useEffect(() => {
        if (autoFetch && trainingUnitId) {
            fetchNotes();
        }
    }, [autoFetch, trainingUnitId, fetchNotes]);
    const createNote = useCallback(
        async (data: CreateNoteData): Promise<TrainingUnitNote | null> => {
            setIsCreating(true);
            try {
                const newNote = await notesApi.createNote(trainingUnitId, data);
                setNotes((prev) =>
                    [...prev, newNote].sort((a, b) => {
                        // Sort by timestamp if both have one, otherwise by created_at
                        if (
                            a.timestamp_seconds !== null &&
                            b.timestamp_seconds !== null
                        ) {
                            return a.timestamp_seconds - b.timestamp_seconds;
                        }
                        return (
                            new Date(a.created_at).getTime() -
                            new Date(b.created_at).getTime()
                        );
                    }),
                );
                toast.success('Note saved');
                return newNote;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Failed to save note';
                toast.error(message);
                return null;
            } finally {
                setIsCreating(false);
            }
        },
        [trainingUnitId],
    );
    const updateNote = useCallback(
        async (
            noteId: number,
            data: UpdateNoteData,
        ): Promise<TrainingUnitNote | null> => {
            setIsUpdating(true);
            try {
                const updatedNote = await notesApi.updateNote(
                    trainingUnitId,
                    noteId,
                    data,
                );
                setNotes((prev) =>
                    prev.map((n) => (n.id === noteId ? updatedNote : n)),
                );
                toast.success('Note updated');
                return updatedNote;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to update note';
                toast.error(message);
                return null;
            } finally {
                setIsUpdating(false);
            }
        },
        [trainingUnitId],
    );
    const deleteNote = useCallback(
        async (noteId: number): Promise<boolean> => {
            setIsDeleting(true);
            try {
                await notesApi.deleteNote(trainingUnitId, noteId);
                setNotes((prev) => prev.filter((n) => n.id !== noteId));
                toast.success('Note deleted');
                return true;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Failed to delete note';
                toast.error(message);
                return false;
            } finally {
                setIsDeleting(false);
            }
        },
        [trainingUnitId],
    );
    return {
        notes,
        loading,
        error,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
        isCreating,
        isUpdating,
        isDeleting,
    };
}
