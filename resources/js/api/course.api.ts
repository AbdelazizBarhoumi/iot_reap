import axios from 'axios';
import type {
    Course,
    CourseModule,
    Lesson,
    CourseProgress,
    TeacherStats,
} from '@/types/course.types';
const apiClient = axios.create({
    baseURL: '/',
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});
export const courseApi = {
    /**
     * List all approved courses
     */
    list: async (params?: {
        category?: string;
        search?: string;
    }): Promise<{ data: Course[]; categories: string[] }> => {
        const response = await apiClient.get('/courses', { params });
        return response.data;
    },
    /**
     * Get a single course with full content
     */
    get: async (
        id: number,
    ): Promise<{
        data: Course;
        is_enrolled: boolean;
        progress: CourseProgress | null;
        completed_lesson_ids: number[];
    }> => {
        const response = await apiClient.get(`/courses/${id}`);
        return response.data;
    },
    /**
     * Get lesson data
     */
    getLesson: async (
        courseId: number,
        lessonId: number,
    ): Promise<{
        course: Course;
        lesson: Course['modules'] extends (infer M)[]
            ? M extends { lessons: (infer L)[] }
                ? L
                : never
            : never;
        completed_lesson_ids: number[];
    }> => {
        const response = await apiClient.get(
            `/courses/${courseId}/lesson/${lessonId}`,
        );
        return response.data;
    },
    /**
     * Enroll in a course
     */
    enroll: async (courseId: number): Promise<void> => {
        await apiClient.post(`/courses/${courseId}/enroll`);
    },
    /**
     * Unenroll from a course
     */
    unenroll: async (courseId: number): Promise<void> => {
        await apiClient.delete(`/courses/${courseId}/enroll`);
    },
    /**
     * Mark a lesson as complete
     */
    markLessonComplete: async (
        courseId: number,
        lessonId: number,
    ): Promise<{ progress: CourseProgress }> => {
        const response = await apiClient.post(
            `/courses/${courseId}/lessons/${lessonId}/complete`,
        );
        return response.data;
    },
    /**
     * Mark a lesson as incomplete
     */
    markLessonIncomplete: async (
        courseId: number,
        lessonId: number,
    ): Promise<{ progress: CourseProgress }> => {
        const response = await apiClient.delete(
            `/courses/${courseId}/lessons/${lessonId}/complete`,
        );
        return response.data;
    },
};
export const teachingApi = {
    /**
     * Get teaching dashboard data
     */
    getDashboard: async (): Promise<{
        data: Course[];
        stats: TeacherStats;
    }> => {
        const response = await apiClient.get('/teaching');
        return response.data;
    },
    /**
     * Create a new course
     */
    create: async (data: {
        title: string;
        description: string;
        category: string;
        level: string;
        modules?: Array<{
            title: string;
            lessons?: Array<{
                title: string;
                type: string;
                duration?: string;
                vmEnabled?: boolean;
            }>;
        }>;
    }): Promise<{ data: Course }> => {
        const response = await apiClient.post('/teaching', data);
        return response.data;
    },
    /**
     * Get a course for editing
     */
    getForEdit: async (id: number): Promise<{ data: Course }> => {
        const response = await apiClient.get(`/teaching/${id}/edit`);
        return response.data;
    },
    /**
     * Update a course
     */
    update: async (
        id: number,
        data: Partial<Course>,
    ): Promise<{ data: Course }> => {
        const response = await apiClient.patch(`/teaching/${id}`, data);
        return response.data;
    },
    /**
     * Delete a course
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/teaching/${id}`);
    },
    /**
     * Submit course for review
     */
    submitForReview: async (id: number): Promise<{ data: Course }> => {
        const response = await apiClient.post(`/teaching/${id}/submit`);
        return response.data;
    },
    /**
     * Add a module to a course
     */
    addModule: async (
        courseId: number,
        data: { title: string },
    ): Promise<{ data: CourseModule }> => {
        const response = await apiClient.post(
            `/teaching/${courseId}/modules`,
            data,
        );
        return response.data;
    },
    /**
     * Update a module
     */
    updateModule: async (
        courseId: number,
        moduleId: number,
        data: { title: string },
    ): Promise<void> => {
        await apiClient.patch(
            `/teaching/${courseId}/modules/${moduleId}`,
            data,
        );
    },
    /**
     * Delete a module
     */
    deleteModule: async (courseId: number, moduleId: number): Promise<void> => {
        await apiClient.delete(`/teaching/${courseId}/modules/${moduleId}`);
    },
    /**
     * Add a lesson to a module
     */
    addLesson: async (
        courseId: number,
        moduleId: number,
        data: {
            title: string;
            type: string;
            duration?: string;
            content?: string;
            objectives?: string[];
            vm_enabled?: boolean;
            video_url?: string;
            resources?: string[];
        },
    ): Promise<{ data: Lesson }> => {
        const response = await apiClient.post(
            `/teaching/${courseId}/modules/${moduleId}/lessons`,
            data,
        );
        return response.data;
    },
    /**
     * Update a lesson
     */
    updateLesson: async (
        courseId: number,
        moduleId: number,
        lessonId: number,
        data: Partial<{
            title: string;
            type: string;
            duration: string;
            content: string;
            objectives: string[];
            vm_enabled: boolean;
            video_url: string;
            resources: string[];
        }>,
    ): Promise<void> => {
        await apiClient.patch(
            `/teaching/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
            data,
        );
    },
    /**
     * Delete a lesson
     */
    deleteLesson: async (
        courseId: number,
        moduleId: number,
        lessonId: number,
    ): Promise<void> => {
        await apiClient.delete(
            `/teaching/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
        );
    },
    /**
     * Reorder modules within a course
     */
    reorderModules: async (
        courseId: number,
        order: number[],
    ): Promise<void> => {
        await apiClient.patch(`/teaching/${courseId}/modules/reorder`, {
            order,
        });
    },
    /**
     * Reorder lessons within a module
     */
    reorderLessons: async (
        courseId: number,
        moduleId: number,
        order: number[],
    ): Promise<void> => {
        await apiClient.patch(
            `/teaching/${courseId}/modules/${moduleId}/lessons/reorder`,
            { order },
        );
    },
    /**
     * Archive a course (soft-delete)
     */
    archive: async (courseId: number): Promise<{ data: Course }> => {
        const response = await apiClient.post(`/teaching/${courseId}/archive`);
        return response.data;
    },
    /**
     * Restore an archived course
     */
    restore: async (courseId: number): Promise<{ data: Course }> => {
        const response = await apiClient.post(`/teaching/${courseId}/restore`);
        return response.data;
    },
};
export const adminCourseApi = {
    /**
     * Get pending courses for approval
     */
    getPending: async (): Promise<{ data: Course[] }> => {
        const response = await apiClient.get('/admin/courses');
        return response.data;
    },
    /**
     * Approve a course
     */
    approve: async (id: number): Promise<{ data: Course }> => {
        const response = await apiClient.post(`/admin/courses/${id}/approve`);
        return response.data;
    },
    /**
     * Reject a course
     */
    reject: async (id: number, feedback: string): Promise<{ data: Course }> => {
        const response = await apiClient.post(`/admin/courses/${id}/reject`, {
            feedback,
        });
        return response.data;
    },
};

