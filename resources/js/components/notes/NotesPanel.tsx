/**
 * NotesPanel - Collapsible sidebar panel for lesson notes.
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
    StickyNote,
    ChevronRight,
    ChevronLeft,
    Loader2,
    BookOpen,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotes } from '@/hooks/useNotes';
import { cn } from '@/lib/utils';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
interface NotesPanelProps {
    lessonId: number;
    currentTimestamp?: number | null;
    onSeekToTimestamp?: (seconds: number) => void;
    className?: string;
}
export function NotesPanel({
    lessonId,
    currentTimestamp = null,
    onSeekToTimestamp,
    className,
}: NotesPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const {
        notes,
        loading,
        error,
        createNote,
        updateNote,
        deleteNote,
        isCreating,
        isUpdating,
        isDeleting,
    } = useNotes({ lessonId });
    const handleCreate = async (
        content: string,
        timestampSeconds: number | null,
    ) => {
        const result = await createNote({
            content,
            timestamp_seconds: timestampSeconds,
        });
        return result !== null;
    };
    const handleUpdate = async (
        noteId: number,
        content: string,
        timestampSeconds: number | null,
    ) => {
        const result = await updateNote(noteId, {
            content,
            timestamp_seconds: timestampSeconds,
        });
        return result !== null;
    };
    const handleDelete = async (noteId: number) => {
        return await deleteNote(noteId);
    };
    return (
        <>
            {/* Toggle button */}
            <Button
                variant="outline"
                size="sm"
                className={cn(
                    'fixed top-1/2 right-0 z-40 -translate-y-1/2 rounded-l-lg rounded-r-none transition-transform',
                    isOpen && 'translate-x-80',
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <StickyNote className="h-4 w-4" />
                <span className="ml-1.5 text-xs font-medium">
                    {notes.length}
                </span>
                {isOpen ? (
                    <ChevronRight className="ml-1 h-4 w-4" />
                ) : (
                    <ChevronLeft className="ml-1 h-4 w-4" />
                )}
            </Button>
            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                        }}
                        className={cn(
                            'fixed top-0 right-0 z-30 flex h-full w-80 flex-col border-l bg-background shadow-lg',
                            className,
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div className="flex items-center gap-2">
                                <StickyNote className="h-5 w-5 text-primary" />
                                <h2 className="font-semibold">Notes</h2>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    {notes.length}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setIsOpen(false)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-hidden">
                            {loading ? (
                                <div className="flex h-full items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : error ? (
                                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                                    <p className="text-sm text-destructive">
                                        {error}
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="h-full">
                                    <div className="space-y-4 p-4">
                                        {/* Note editor */}
                                        <NoteEditor
                                            currentTimestamp={currentTimestamp}
                                            onSave={handleCreate}
                                            isSaving={isCreating}
                                        />
                                        {/* Notes list */}
                                        {notes.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                                <div className="rounded-full bg-muted p-3">
                                                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        No notes yet
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Start taking notes as
                                                        you learn
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <AnimatePresence mode="popLayout">
                                                    {notes.map((note) => (
                                                        <NoteCard
                                                            key={note.id}
                                                            note={note}
                                                            onUpdate={
                                                                handleUpdate
                                                            }
                                                            onDelete={
                                                                handleDelete
                                                            }
                                                            onTimestampClick={
                                                                onSeekToTimestamp
                                                            }
                                                            isUpdating={
                                                                isUpdating
                                                            }
                                                            isDeleting={
                                                                isDeleting
                                                            }
                                                        />
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-20 bg-black/20 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}


