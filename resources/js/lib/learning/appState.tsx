import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { Course, Lesson } from "@/lib/learning/mockData";
import { courses as initialCourses } from "@/lib/learning/mockData";

export type CourseStatus = "draft" | "pending_review" | "approved" | "rejected";

export interface ManagedCourse extends Course {
  status: CourseStatus;
  adminFeedback?: string;
}

interface AppState {
  courses: ManagedCourse[];
  addCourse: (course: ManagedCourse) => void;
  updateCourse: (id: string, updates: Partial<ManagedCourse>) => void;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  approveCourse: (id: string) => void;
  rejectCourse: (id: string, feedback: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
};

export const LearningAppProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<ManagedCourse[]>(
    initialCourses.map((c) => ({ ...c, status: "approved" as CourseStatus }))
  );

  const addCourse = (course: ManagedCourse) => {
    setCourses((prev) => [...prev, course]);
  };

  const updateCourse = (id: string, updates: Partial<ManagedCourse>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const updateLesson = (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)),
            };
          }),
        };
      })
    );
  };

  const approveCourse = (id: string) => {
    updateCourse(id, { status: "approved", adminFeedback: undefined });
  };

  const rejectCourse = (id: string, feedback: string) => {
    updateCourse(id, { status: "rejected", adminFeedback: feedback });
  };

  return (
    <AppContext.Provider value={{ courses, addCourse, updateCourse, updateLesson, approveCourse, rejectCourse }}>
      {children}
    </AppContext.Provider>
  );
};
