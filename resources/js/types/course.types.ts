/**
 * Course types matching the backend API resources
 */

export type CourseStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type LessonType = 'video' | 'reading' | 'practice' | 'vm-lab';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string | null;
  content: string | null;
  objectives: string[] | null;
  vmEnabled: boolean;
  videoUrl: string | null;
  resources: string[] | null;
  sort_order: number;
  completed?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  instructor_id: number;
  thumbnail: string | null;
  category: string;
  level: CourseLevel;
  duration: string | null;
  rating: number;
  students: number;
  hasVirtualMachine: boolean;
  status: CourseStatus;
  adminFeedback: string | null;
  modules?: CourseModule[];
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface CourseEnrollment {
  id: number;
  course: Course;
  enrolled_at: string;
}

export interface TeacherStats {
  totalCourses: number;
  totalStudents: number;
  avgRating: number;
  totalRevenue: string;
}
