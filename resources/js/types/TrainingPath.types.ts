/**
 * TrainingPath types matching the backend API resources
 */
export type TrainingPathStatus =
    | 'draft'
    | 'pending_review'
    | 'approved'
    | 'rejected'
    | 'archived';
export type TrainingPathLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type TrainingUnitType =
    | 'video'
    | 'reading'
    | 'practice'
    | 'vm-lab'
    | 'quiz';
export type VideoType = 'upload' | 'youtube';
export interface TrainingUnit {
    id: string;
    title: string;
    type: TrainingUnitType;
    duration: string | null;
    content: string | null;
    objectives: string[] | null;
    vmEnabled: boolean;
    videoUrl: string | null;
    resources: string[] | null;
    sort_order: number;
    completed?: boolean;
}
export interface TrainingPathModule {
    id: string;
    title: string;
    sort_order: number;
    trainingUnits: TrainingUnit[];
}
export interface TrainingPath {
    id: number;
    title: string;
    description: string;
    instructor: string;
    instructor_id: number;
    thumbnail: string | null;
    thumbnail_url?: string | null;
    video_type: VideoType | null;
    video_url: string | null;
    category: string;
    level: TrainingPathLevel;
    duration: string | null;
    price: number;
    formattedPrice?: string;
    currency: string;
    rating: number;
    students: number;
    hasVirtualMachine: boolean;
    isFree: boolean;
    status: TrainingPathStatus;
    adminFeedback: string | null;
    modules?: TrainingPathModule[];
    created_at: string;
    updated_at: string;
}
export interface TrainingPathProgress {
    completed: number;
    total: number;
    percentage: number;
}
export interface TrainingPathEnrollment {
    id: number;
    trainingPath: TrainingPath;
    enrolled_at: string;
}
export interface TeacherStats {
    totalTrainingPaths: number;
    totalStudents: number;
    avgRating: number;
    completionRate: number;
    totalRevenue: string;
}
