/**
 * Learning module type definitions
 * Extracted from mockData.ts for use across the application
 */
export interface Course {
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
    status?: CourseStatus;
}
export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}
export interface Lesson {
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
export type CourseStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export interface TeacherStats {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
    pendingReviews: number;
    coursesThisMonth: number;
}

