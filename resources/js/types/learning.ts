/**
 * Learning module type definitions
 * Extracted from mockData.ts for use across the application
 */
export interface TrainingPath {
    id: string;
    title: string;
    description: string;
    instructor: string;
    thumbnail: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    students: number;
    rating: number;
    modules: Module[];
    hasVirtualMachine?: boolean;
    status?: TrainingPathStatus;
}
export interface Module {
    id: string;
    title: string;
    trainingUnits: TrainingUnit[];
}
export interface TrainingUnit {
    id: string;
    title: string;
    type: 'video' | 'reading' | 'practice' | 'vm-lab';
    duration: string;
    completed?: boolean;
    content?: string;
    objectives?: string[];
    vmEnabled?: boolean;
    videoUrl?: string;
    resources?: string[];
}
export type TrainingPathStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export interface TeacherStats {
    totalTrainingPaths: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
    pendingReviews: number;
    trainingPathsThisMonth: number;
}

