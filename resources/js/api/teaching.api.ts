/**
 * Teaching API Module
 * Handles trainingPath and trainingUnit management for teachers
 */

import client from './client';

export interface Module {
  id: string;
  training_path_id: string;
  title: string;
  description: string;
  order: number;
  trainingUnits?: TrainingUnit[];
  created_at: string;
}

export interface TrainingUnit {
  id: string;
  module_id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'interactive';
  order: number;
  duration_minutes?: number | null;
  duration?: string;
  content?: string;
  objectives?: string[];
  resources?: string[];
  vmEnabled?: boolean;
  vm_enabled?: boolean;
  videoUrl?: string;
  video_url?: string;
  created_at: string;
}

export interface ManagedTrainingPath {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  instructor?: { name: string } | string;
  category: string;
  modules?: Array<{ trainingUnits?: Array<Record<string, unknown>> }>;
  students?: number;
  rating: number;
}

export interface TrainingPathEditing {
  id: string | number;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  price: number;
  currency: string;
  status: 'draft' | 'submitted' | 'approved' | 'published' | 'archived' | 'pending_review';
  image_url: string;
  modules: Module[];
  hasVirtualMachine?: boolean;
  students?: number;
  rating?: number;
  adminFeedback?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get all trainingPaths for the authenticated teacher
 */
export const getMyTrainingPaths = () =>
  client.get<TrainingPathEditing[]>(`/teaching`);

/**
 * Create a new trainingPath
 */
export const createTrainingPath = (trainingPathData: Partial<TrainingPathEditing>) =>
  client.post<TrainingPathEditing>(`/teaching`, trainingPathData);

/**
 * Get trainingPath for editing
 */
export const getTrainingPathForEditing = (trainingPathId: string | number) =>
  client.get<TrainingPathEditing>(`/teaching/${trainingPathId}/edit`);

/**
 * Update trainingPath
 */
export const updateTrainingPath = (trainingPathId: string | number, trainingPathData: Partial<TrainingPathEditing>) =>
  client.patch<TrainingPathEditing>(`/teaching/${trainingPathId}`, trainingPathData);

/**
 * Delete trainingPath
 */
export const deleteTrainingPath = (trainingPathId: string | number) =>
  client.delete(`/teaching/${trainingPathId}`);

/**
 * Submit trainingPath for review
 */
export const submitTrainingPathForReview = (trainingPathId: string | number) =>
  client.post(`/teaching/${trainingPathId}/submit`, {});

/**
 * Archive trainingPath
 */
export const archiveTrainingPath = (trainingPathId: string | number) =>
  client.post(`/teaching/${trainingPathId}/archive`, {});

/**
 * Restore archived trainingPath
 */
export const restoreTrainingPath = (trainingPathId: string) =>
  client.post(`/teaching/${trainingPathId}/restore`, {});

// ==================== MODULE MANAGEMENT ====================

/**
 * Create module in a trainingPath
 */
export const createModule = (trainingPathId: string, moduleData: Partial<Module>) =>
  client.post<Module>(`/teaching/${trainingPathId}/modules`, moduleData);

/**
 * Update module
 */
export const updateModule = (trainingPathId: string, moduleId: string, moduleData: Partial<Module>) =>
  client.patch<Module>(`/teaching/${trainingPathId}/modules/${moduleId}`, moduleData);

/**
 * Delete module
 */
export const deleteModule = (trainingPathId: string, moduleId: string) =>
  client.delete(`/teaching/${trainingPathId}/modules/${moduleId}`);

/**
 * Reorder modules
 */
export const reorderModules = (trainingPathId: string, order: string[]) =>
  client.patch(`/teaching/${trainingPathId}/modules/reorder`, { order });

// ==================== LESSON MANAGEMENT ====================

/**
 * Get trainingUnit for editing
 */
export const getTrainingUnitForEditing = (trainingPathId: string, moduleId: string, trainingUnitId: string) =>
  client.get<TrainingUnit>(`/teaching/${trainingPathId}/module/${moduleId}/trainingUnit/${trainingUnitId}`);

/**
 * Create trainingUnit in a module
 */
export const createTrainingUnit = (trainingPathId: string, moduleId: string, trainingUnitData: Partial<TrainingUnit>) =>
  client.post<TrainingUnit>(`/teaching/${trainingPathId}/modules/${moduleId}/trainingUnits`, trainingUnitData);

/**
 * Update trainingUnit
 */
export const updateTrainingUnit = (trainingPathId: string, moduleId: string, trainingUnitId: string, trainingUnitData: Partial<TrainingUnit>) =>
  client.patch<TrainingUnit>(`/teaching/${trainingPathId}/modules/${moduleId}/trainingUnits/${trainingUnitId}`, trainingUnitData);

/**
 * Delete trainingUnit
 */
export const deleteTrainingUnit = (trainingPathId: string, moduleId: string, trainingUnitId: string) =>
  client.delete(`/teaching/${trainingPathId}/modules/${moduleId}/trainingUnits/${trainingUnitId}`);

/**
 * Reorder trainingUnits in a module
 */
export const reorderTrainingUnits = (trainingPathId: string, moduleId: string, order: string[]) =>
  client.patch(`/teaching/${trainingPathId}/modules/${moduleId}/trainingUnits/reorder`, { order });
