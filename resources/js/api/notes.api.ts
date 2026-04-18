/**
 * Notes API module for trainingUnit notes CRUD operations.
 */
import client from './client';
export interface TrainingUnitNote {
    id: number;
    training_unit_id: number;
    content: string;
    timestamp_seconds: number | null;
    formatted_timestamp: string | null;
    created_at: string;
    updated_at: string;
    trainingUnit?: {
        id: number;
        title: string;
    };
}
export interface CreateNoteData {
    content: string;
    timestamp_seconds?: number | null;
}
export interface UpdateNoteData {
    content: string;
    timestamp_seconds?: number | null;
}
interface NotesResponse {
    data: TrainingUnitNote[];
}
interface NoteResponse {
    data: TrainingUnitNote;
    message?: string;
}
/**
 * Get all notes for a specific trainingUnit.
 */
export async function getNotesForTrainingUnit(
    trainingUnitId: number,
): Promise<TrainingUnitNote[]> {
    const response = await client.get<NotesResponse>(
        `/trainingUnits/${trainingUnitId}/notes`,
    );
    return response.data.data;
}
/**
 * Get all notes for a trainingPath.
 */
export async function getNotesForTrainingPath(
    trainingPathId: number,
): Promise<TrainingUnitNote[]> {
    const response = await client.get<NotesResponse>(
        `/trainingPaths/${trainingPathId}/notes`,
    );
    return response.data.data;
}
/**
 * Create a new note for a trainingUnit.
 */
export async function createNote(
    trainingUnitId: number,
    data: CreateNoteData,
): Promise<TrainingUnitNote> {
    const response = await client.post<NoteResponse>(
        `/trainingUnits/${trainingUnitId}/notes`,
        data,
    );
    return response.data.data;
}
/**
 * Update an existing note.
 */
export async function updateNote(
    trainingUnitId: number,
    noteId: number,
    data: UpdateNoteData,
): Promise<TrainingUnitNote> {
    const response = await client.put<NoteResponse>(
        `/trainingUnits/${trainingUnitId}/notes/${noteId}`,
        data,
    );
    return response.data.data;
}
/**
 * Delete a note.
 */
export async function deleteNote(
    trainingUnitId: number,
    noteId: number,
): Promise<void> {
    await client.delete(`/trainingUnits/${trainingUnitId}/notes/${noteId}`);
}
export const notesApi = {
    getNotesForTrainingUnit,
    getNotesForTrainingPath,
    createNote,
    updateNote,
    deleteNote,
};

