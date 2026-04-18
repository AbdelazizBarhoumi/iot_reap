import axios from 'axios';
import type {
    TrainingPath,
    TrainingPathModule,
    TrainingUnit,
    TrainingPathProgress,
    TeacherStats,
} from '@/types/TrainingPath.types';
const apiClient = axios.create({
    baseURL: '/',
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});
export const trainingPathApi = {
    /**
     * List all approved trainingPaths
     */
    list: async (params?: {
        category?: string;
        search?: string;
    }): Promise<{ data: TrainingPath[]; categories: string[] }> => {
        const response = await apiClient.get('/trainingPaths', { params });
        return response.data;
    },
    /**
     * Get a single trainingPath with full content
     */
    get: async (
        id: number,
    ): Promise<{
        data: TrainingPath;
        is_enrolled: boolean;
        progress: TrainingPathProgress | null;
        completed_training_unit_ids: number[];
    }> => {
        const response = await apiClient.get(`/trainingPaths/${id}`);
        return response.data;
    },
    /**
     * Get trainingUnit data
     */
    getTrainingUnit: async (
        trainingPathId: number,
        trainingUnitId: number,
    ): Promise<{
        trainingPath: TrainingPath;
        trainingUnit: TrainingPath['modules'] extends (infer M)[]
            ? M extends { trainingUnits: (infer L)[] }
                ? L
                : never
            : never;
        completed_training_unit_ids: number[];
    }> => {
        const response = await apiClient.get(
            `/trainingPaths/${trainingPathId}/trainingUnit/${trainingUnitId}`,
        );
        return response.data;
    },
    /**
     * Enroll in a trainingPath
     */
    enroll: async (trainingPathId: number): Promise<void> => {
        await apiClient.post(`/trainingPaths/${trainingPathId}/enroll`);
    },
    /**
     * Unenroll from a trainingPath
     */
    unenroll: async (trainingPathId: number): Promise<void> => {
        await apiClient.delete(`/trainingPaths/${trainingPathId}/enroll`);
    },
    /**
     * Mark a trainingUnit as complete
     */
    markTrainingUnitComplete: async (
        trainingPathId: number,
        trainingUnitId: number,
    ): Promise<{ progress: TrainingPathProgress }> => {
        const response = await apiClient.post(
            `/trainingPaths/${trainingPathId}/trainingUnits/${trainingUnitId}/complete`,
        );
        return response.data;
    },
    /**
     * Mark a trainingUnit as incomplete
     */
    markTrainingUnitIncomplete: async (
        trainingPathId: number,
        trainingUnitId: number,
    ): Promise<{ progress: TrainingPathProgress }> => {
        const response = await apiClient.delete(
            `/trainingPaths/${trainingPathId}/trainingUnits/${trainingUnitId}/complete`,
        );
        return response.data;
    },
};
export const teachingApi = {
    /**
     * Get teaching dashboard data
     */
    getDashboard: async (): Promise<{
        data: TrainingPath[];
        stats: TeacherStats;
    }> => {
        const response = await apiClient.get('/teaching');
        return response.data;
    },
    /**
     * Create a new trainingPath
     */
    create: async (data: {
        title: string;
        description: string;
        category: string;
        level: string;
        modules?: Array<{
            title: string;
            trainingUnits?: Array<{
                title: string;
                type: string;
                duration?: string;
                vmEnabled?: boolean;
            }>;
        }>;
    }): Promise<{ data: TrainingPath }> => {
        const response = await apiClient.post('/teaching', data);
        return response.data;
    },
    /**
     * Get a trainingPath for editing
     */
    getForEdit: async (id: number): Promise<{ data: TrainingPath }> => {
        const response = await apiClient.get(`/teaching/${id}/edit`);
        return response.data;
    },
    /**
     * Update a trainingPath
     */
    update: async (
        id: number,
        data: Partial<TrainingPath>,
    ): Promise<{ data: TrainingPath }> => {
        const response = await apiClient.patch(`/teaching/${id}`, data);
        return response.data;
    },
    /**
     * Delete a trainingPath
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/teaching/${id}`);
    },
    /**
     * Submit trainingPath for review
     */
    submitForReview: async (id: number): Promise<{ data: TrainingPath }> => {
        const response = await apiClient.post(`/teaching/${id}/submit`);
        return response.data;
    },
    /**
     * Add a module to a trainingPath
     */
    addModule: async (
        trainingPathId: number,
        data: { title: string },
    ): Promise<{ data: TrainingPathModule }> => {
        const response = await apiClient.post(
            `/teaching/${trainingPathId}/modules`,
            data,
        );
        return response.data;
    },
    /**
     * Update a module
     */
    updateModule: async (
        trainingPathId: number,
        moduleId: number,
        data: { title: string },
    ): Promise<void> => {
        await apiClient.patch(
            `/teaching/${trainingPathId}/modules/${moduleId}`,
            data,
        );
    },
    /**
     * Delete a module
     */
    deleteModule: async (trainingPathId: number, moduleId: number): Promise<void> => {
        await apiClient.delete(`/teaching/${trainingPathId}/modules/${moduleId}`);
    },
    /**
     * Add a trainingUnit to a module
     */
    addTrainingUnit: async (
        trainingPathId: number,
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
    ): Promise<{ data: TrainingUnit }> => {
        const response = await apiClient.post(
            `/teaching/${trainingPathId}/modules/${moduleId}/trainingUnits`,
            data,
        );
        return response.data;
    },
    /**
     * Update a trainingUnit
     */
    updateTrainingUnit: async (
        trainingPathId: number,
        moduleId: number,
        trainingUnitId: number,
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
            `/teaching/${trainingPathId}/modules/${moduleId}/trainingUnits/${trainingUnitId}`,
            data,
        );
    },
    /**
     * Delete a trainingUnit
     */
    deleteTrainingUnit: async (
        trainingPathId: number,
        moduleId: number,
        trainingUnitId: number,
    ): Promise<void> => {
        await apiClient.delete(
            `/teaching/${trainingPathId}/modules/${moduleId}/trainingUnits/${trainingUnitId}`,
        );
    },
    /**
     * Reorder modules within a trainingPath
     */
    reorderModules: async (
        trainingPathId: number,
        order: number[],
    ): Promise<void> => {
        await apiClient.patch(`/teaching/${trainingPathId}/modules/reorder`, {
            order,
        });
    },
    /**
     * Reorder trainingUnits within a module
     */
    reorderTrainingUnits: async (
        trainingPathId: number,
        moduleId: number,
        order: number[],
    ): Promise<void> => {
        await apiClient.patch(
            `/teaching/${trainingPathId}/modules/${moduleId}/trainingUnits/reorder`,
            { order },
        );
    },
    /**
     * Archive a trainingPath (soft-delete)
     */
    archive: async (trainingPathId: number): Promise<{ data: TrainingPath }> => {
        const response = await apiClient.post(`/teaching/${trainingPathId}/archive`);
        return response.data;
    },
    /**
     * Restore an archived trainingPath
     */
    restore: async (trainingPathId: number): Promise<{ data: TrainingPath }> => {
        const response = await apiClient.post(`/teaching/${trainingPathId}/restore`);
        return response.data;
    },
};
export const adminTrainingPathApi = {
    /**
     * Get pending trainingPaths for approval
     */
    getPending: async (): Promise<{ data: TrainingPath[] }> => {
        const response = await apiClient.get('/admin/trainingPaths');
        return response.data;
    },
    /**
     * Approve a trainingPath
     */
    approve: async (id: number): Promise<{ data: TrainingPath }> => {
        const response = await apiClient.post(`/admin/trainingPaths/${id}/approve`);
        return response.data;
    },
    /**
     * Reject a trainingPath
     */
    reject: async (id: number, feedback: string): Promise<{ data: TrainingPath }> => {
        const response = await apiClient.post(`/admin/trainingPaths/${id}/reject`, {
            feedback,
        });
        return response.data;
    },
};

