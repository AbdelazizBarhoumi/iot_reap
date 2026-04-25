/**
 * Learning App State Types and Context
 *
 * NOTE: This file provides backward-compatible types and a passthrough provider.
 * The actual data comes from Inertia props, not from this state management.
 * Components should migrate to using usePage().props directly.
 */
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
// Status types for trainingPaths
export type TrainingPathStatus =
    | 'draft'
    | 'pending_review'
    | 'approved'
    | 'rejected';
// Managed trainingPath interface (for admin views)
export interface ManagedTrainingPath {
    id: string;
    title: string;
    description: string;
    status: TrainingPathStatus;
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
        trainingUnits?: Array<{
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
    trainingPaths: ManagedTrainingPath[];
    approveTrainingPath: (id: string) => void;
    rejectTrainingPath: (id: string, feedback: string) => void;
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
        pendingTrainingPaths?: ManagedTrainingPath[];
        featuredTrainingPaths?: ManagedTrainingPath[];
        trainingPaths?: ManagedTrainingPath[];
    }>();
    // Combine trainingPaths from different prop sources
    const trainingPaths =
        props.trainingPaths ?? props.pendingTrainingPaths ?? [];
    return {
        trainingPaths: trainingPaths as ManagedTrainingPath[],
        approveTrainingPath: () => {
            console.warn(
                'approveTrainingPath: Use Inertia router.post() instead',
            );
        },
        rejectTrainingPath: () => {
            console.warn(
                'rejectTrainingPath: Use Inertia router.post() instead',
            );
        },
    };
}
