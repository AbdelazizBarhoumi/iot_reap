import { Check, Play, BookOpen, Terminal, FileText } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import type { Module } from '@/types/learning';
const lessonIcons: Record<string, React.ElementType> = {
    video: Play,
    reading: FileText,
    practice: BookOpen,
    'vm-lab': Terminal,
};
interface LessonSidebarProps {
    modules: Module[];
    currentLessonId?: string;
    onSelectLesson: (lessonId: string) => void;
}
const LessonSidebar = ({
    modules,
    currentLessonId,
    onSelectLesson,
}: LessonSidebarProps) => {
    return (
        <div className="w-full border-r border-border bg-card">
            <div className="border-b border-border p-4">
                <h3 className="font-heading text-sm font-semibold text-foreground">
                    Course Content
                </h3>
            </div>
            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
                {modules.map((module, mi) => (
                    <div key={module.id}>
                        <div className="bg-muted/50 px-4 py-3">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Module {mi + 1}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-foreground">
                                {module.title}
                            </p>
                        </div>
                        <ul>
                            {module.lessons.map((lesson) => {
                                const Icon =
                                    lessonIcons[lesson.type] || BookOpen;
                                const isActive = lesson.id === currentLessonId;
                                return (
                                    <li key={lesson.id}>
                                        <button
                                            onClick={() =>
                                                onSelectLesson(lesson.id)
                                            }
                                            className={cn(
                                                'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50',
                                                isActive &&
                                                    'border-l-2 border-primary bg-primary/10',
                                                lesson.completed &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                                                    lesson.completed
                                                        ? 'border-success bg-success text-success-foreground'
                                                        : isActive
                                                          ? 'border-primary text-primary'
                                                          : 'border-border text-muted-foreground',
                                                )}
                                            >
                                                {lesson.completed ? (
                                                    <Check className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Icon className="h-3.5 w-3.5" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={cn(
                                                        'truncate font-medium',
                                                        isActive &&
                                                            'text-primary',
                                                    )}
                                                >
                                                    {lesson.title}
                                                </p>
                                                <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                                    {lesson.duration}
                                                    {lesson.vmEnabled && (
                                                        <span className="inline-flex items-center gap-0.5 text-primary">
                                                            <Terminal className="h-3 w-3" />{' '}
                                                            VM
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default LessonSidebar;


