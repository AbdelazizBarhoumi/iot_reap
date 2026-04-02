/**
 * Notes API module for lesson notes CRUD operations.
 */
import client from './client';
export interface LessonNote {
    id: number;
    lesson_id: number;
    content: string;
    timestamp_seconds: number | null;
    formatted_timestamp: string | null;
    created_at: string;
    updated_at: string;
    lesson?: {
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
    data: LessonNote[];
}
interface NoteResponse {
    data: LessonNote;
    message?: string;
}
/**
 * Get all notes for a specific lesson.
 */
export async function getNotesForLesson(
    lessonId: number,
): Promise<LessonNote[]> {
    const response = await client.get<NotesResponse>(
        `/lessons/${lessonId}/notes`,
    );
    return response.data.data;
}
/**
 * Get all notes for a course.
 */
export async function getNotesForCourse(
    courseId: number,
): Promise<LessonNote[]> {
    const response = await client.get<NotesResponse>(
        `/courses/${courseId}/notes`,
    );
    return response.data.data;
}
/**
 * Create a new note for a lesson.
 */
export async function createNote(
    lessonId: number,
    data: CreateNoteData,
): Promise<LessonNote> {
    const response = await client.post<NoteResponse>(
        `/lessons/${lessonId}/notes`,
        data,
    );
    return response.data.data;
}
/**
 * Update an existing note.
 */
export async function updateNote(
    lessonId: number,
    noteId: number,
    data: UpdateNoteData,
): Promise<LessonNote> {
    const response = await client.put<NoteResponse>(
        `/lessons/${lessonId}/notes/${noteId}`,
        data,
    );
    return response.data.data;
}
/**
 * Delete a note.
 */
export async function deleteNote(
    lessonId: number,
    noteId: number,
): Promise<void> {
    await client.delete(`/lessons/${lessonId}/notes/${noteId}`);
}
export const notesApi = {
    getNotesForLesson,
    getNotesForCourse,
    createNote,
    updateNote,
    deleteNote,
};

