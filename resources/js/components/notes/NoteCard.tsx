/**
 * NoteCard component displays a single note with edit/delete actions.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { TrainingUnitNote } from '@/api/notes.api';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
interface NoteCardProps {
    note: TrainingUnitNote;
    onUpdate: (
        noteId: number,
        content: string,
        timestampSeconds: number | null,
    ) => Promise<boolean>;
    onDelete: (noteId: number) => Promise<boolean>;
    onTimestampClick?: (seconds: number) => void;
    isUpdating?: boolean;
    isDeleting?: boolean;
}
export function NoteCard({
    note,
    onUpdate,
    onDelete,
    onTimestampClick,
    isUpdating = false,
    isDeleting = false,
}: NoteCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(note.content);
    const handleSave = async () => {
        if (!editContent.trim()) return;
        const success = await onUpdate(
            note.id,
            editContent.trim(),
            note.timestamp_seconds,
        );
        if (success) {
            setIsEditing(false);
        }
    };
    const handleCancel = () => {
        setEditContent(note.content);
        setIsEditing(false);
    };
    const handleDelete = async () => {
        await onDelete(note.id);
    };
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <Card className="group relative p-4 transition-shadow hover:shadow-md">
                {/* Timestamp badge */}
                {note.formatted_timestamp && (
                    <button
                        type="button"
                        onClick={() =>
                            note.timestamp_seconds !== null &&
                            onTimestampClick?.(note.timestamp_seconds)
                        }
                        className={cn(
                            'mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                            'bg-primary/10 text-primary transition-colors hover:bg-primary/20',
                            onTimestampClick && 'cursor-pointer',
                        )}
                    >
                        <Clock className="h-3 w-3" />
                        {note.formatted_timestamp}
                    </button>
                )}
                {/* Note content */}
                <AnimatePresence mode="wait">
                    {isEditing ? (
                        <motion.div
                            key="editing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                        >
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[100px] resize-none"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancel}
                                    disabled={isUpdating}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isUpdating || !editContent.trim()}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="mr-1 h-4 w-4" />
                                    )}
                                    Save
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="viewing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <p className="text-sm whitespace-pre-wrap text-foreground">
                                {note.content}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {new Date(note.created_at).toLocaleDateString(
                                    undefined,
                                    {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    },
                                )}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Action buttons */}
                {!isEditing && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete note?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                        ) : null}
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
