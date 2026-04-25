/**
 * NoteEditor component for creating new notes.
 */
import { motion } from 'framer-motion';
import { Plus, Clock, Send, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
interface NoteEditorProps {
    currentTimestamp?: number | null;
    onSave: (
        content: string,
        timestampSeconds: number | null,
    ) => Promise<boolean>;
    isSaving?: boolean;
}
function formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
export function NoteEditor({
    currentTimestamp = null,
    onSave,
    isSaving = false,
}: NoteEditorProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [content, setContent] = useState('');
    const [includeTimestamp, setIncludeTimestamp] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (isExpanded && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isExpanded]);
    const handleSave = async () => {
        if (!content.trim()) return;
        const timestampToSave =
            includeTimestamp && currentTimestamp !== null
                ? Math.floor(currentTimestamp)
                : null;
        const success = await onSave(content.trim(), timestampToSave);
        if (success) {
            setContent('');
            setIsExpanded(false);
        }
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Ctrl/Cmd + Enter to save
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
        // Escape to collapse
        if (e.key === 'Escape') {
            setIsExpanded(false);
            setContent('');
        }
    };
    if (!isExpanded) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-dashed"
                    onClick={() => setIsExpanded(true)}
                >
                    <Plus className="h-4 w-4" />
                    Add a note
                    {currentTimestamp !== null && (
                        <span className="ml-auto text-xs text-muted-foreground">
                            at {formatTimestamp(Math.floor(currentTimestamp))}
                        </span>
                    )}
                </Button>
            </motion.div>
        );
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="p-4">
                <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write your note... (Ctrl+Enter to save, Esc to cancel)"
                    className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0"
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                    {/* Timestamp toggle */}
                    {currentTimestamp !== null && (
                        <button
                            type="button"
                            onClick={() =>
                                setIncludeTimestamp(!includeTimestamp)
                            }
                            className={cn(
                                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                                includeTimestamp
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                            )}
                        >
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(Math.floor(currentTimestamp))}
                        </button>
                    )}
                    <div className="ml-auto flex gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                setIsExpanded(false);
                                setContent('');
                            }}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || !content.trim()}
                        >
                            {isSaving ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-1 h-4 w-4" />
                            )}
                            Save
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
