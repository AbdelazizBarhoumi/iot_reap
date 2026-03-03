import { Check, Play, BookOpen, Terminal, FileText } from "lucide-react";
import React from "react";
import type { Module } from "@/lib/learning/mockData";
import { cn } from "@/lib/utils";

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

const LessonSidebar = ({ modules, currentLessonId, onSelectLesson }: LessonSidebarProps) => {
  return (
    <div className="w-full border-r border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-heading text-sm font-semibold text-foreground">Course Content</h3>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-10rem)]">
        {modules.map((module, mi) => (
          <div key={module.id}>
            <div className="px-4 py-3 bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Module {mi + 1}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{module.title}</p>
            </div>
            <ul>
              {module.lessons.map((lesson) => {
                const Icon = lessonIcons[lesson.type] || BookOpen;
                const isActive = lesson.id === currentLessonId;
                return (
                  <li key={lesson.id}>
                    <button
                      onClick={() => onSelectLesson(lesson.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50",
                        isActive && "bg-primary/10 border-l-2 border-primary",
                        lesson.completed && "text-muted-foreground"
                      )}
                    >
                      <div className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                        lesson.completed ? "bg-success border-success text-success-foreground" :
                        isActive ? "border-primary text-primary" : "border-border text-muted-foreground"
                      )}>
                        {lesson.completed ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("truncate font-medium", isActive && "text-primary")}>{lesson.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                          {lesson.duration}
                          {lesson.vmEnabled && (
                            <span className="inline-flex items-center gap-0.5 text-primary">
                              <Terminal className="h-3 w-3" /> VM
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
