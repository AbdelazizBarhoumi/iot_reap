/**
 * Learning App State Types and Context
 *
 * NOTE: This file provides backward-compatible types and a passthrough provider.
 * The actual data comes from Inertia props, not from this state management.
 * Components should migrate to using usePage().props directly.
 */
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
// Status types for courses
export type CourseStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
// Managed course interface (for admin views)
export interface ManagedCourse {
    id: string;
    title: string;
    description: string;
    status: CourseStatus;
    instructor: {
        name: string;
        avatar?: string;
    };
    thumbnail?: string;
    enrollmentCount: number;
    rating?: number;
    submittedAt?: string;
    isFeatured?: boolean;
    modules?: Array<{
        id?: string;
        title?: string;
        lessons?: Array<{
            id: string;
            title: string;
            type: string;
            duration?: string;
            content?: string;
        }>;
    }>;
    category?: string;
    level?: string;
    duration?: string;
    students?: number;
    adminFeedback?: string;
}
// Context for backward compatibility (passthrough)
interface LearningAppContextType {
    courses: ManagedCourse[];
    approveCourse: (id: string) => void;
    rejectCourse: (id: string, feedback: string) => void;
}
/**
 * Provider that wraps children but doesn't manage state.
 * Components should use Inertia props directly.
 */
export function LearningAppProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
/**
 * Hook for backward compatibility.
 * Returns empty state - components should migrate to usePage().props
 */
export function useAppState(): LearningAppContextType {
    const { props } = usePage<{
        pendingCourses?: ManagedCourse[];
        featuredCourses?: ManagedCourse[];
        courses?: ManagedCourse[];
    }>();
    // Combine courses from different prop sources
    const courses = props.courses ?? props.pendingCourses ?? [];
    return {
        courses: courses as ManagedCourse[],
        approveCourse: () => {
            console.warn('approveCourse: Use Inertia router.post() instead');
        },
        rejectCourse: () => {
            console.warn('rejectCourse: Use Inertia router.post() instead');
        },
    };
}

