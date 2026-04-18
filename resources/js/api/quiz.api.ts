/**
 * Quiz API Module
 * Handles all quiz-related API calls for both students and teachers
 */

import client from './client';

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correct_answer: string;
  points: number;
  order: number;
}

export interface Quiz {
  id: string;
  training_unit_id: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes: number | null;
  published: boolean;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  answers: Record<string, string>;
  score: number | null;
  started_at: string;
  submitted_at: string | null;
  status: 'in_progress' | 'submitted' | 'graded';
}

export interface QuizStats {
  total_attempts: number;
  average_score: number;
  passing_rate: number;
  median_time_minutes: number;
  question_stats: Array<{
    question_id: string;
    correct_count: number;
    incorrect_count: number;
    success_rate: number;
  }>;
}

// ==================== STUDENT ENDPOINTS ====================

/**
 * Get quiz for a trainingUnit
 */
export const getQuiz = (trainingUnitId: string) =>
  client.get<Quiz>(`/trainingUnits/${trainingUnitId}/quiz`);

/**
 * Start a quiz attempt
 */
export const startQuizAttempt = (quizId: string) =>
  client.post<QuizAttempt>(`/quizzes/${quizId}/start`, {});

/**
 * Submit a quiz attempt
 */
export const submitQuizAttempt = (attemptId: string, answers: Record<string, string>) =>
  client.post<QuizAttempt>(`/quiz-attempts/${attemptId}/submit`, { answers });

/**
 * Get attempt history for a quiz
 */
export const getQuizHistory = (quizId: string) =>
  client.get<QuizAttempt[]>(`/quizzes/${quizId}/history`);

/**
 * Get a specific quiz attempt
 */
export const getQuizAttempt = (attemptId: string) =>
  client.get<QuizAttempt>(`/quiz-attempts/${attemptId}`);

// ==================== TEACHER ENDPOINTS ====================

/**
 * Get or create quiz for a trainingUnit
 */
export const getOrCreateQuiz = (trainingUnitId: string) =>
  client.get<Quiz>(`/teaching/trainingUnits/${trainingUnitId}/quiz`);

/**
 * Create or update a quiz
 */
export const saveQuiz = (trainingUnitId: string, quizData: Partial<Quiz>) =>
  client.post<Quiz>(`/teaching/trainingUnits/${trainingUnitId}/quiz`, quizData);

/**
 * Update quiz
 */
export const updateQuiz = (quizId: string, quizData: Partial<Quiz>) =>
  client.patch<Quiz>(`/teaching/quizzes/${quizId}`, quizData);

/**
 * Delete quiz
 */
export const deleteQuiz = (quizId: string) =>
  client.delete(`/teaching/quizzes/${quizId}`);

/**
 * Publish quiz
 */
export const publishQuiz = (quizId: string) =>
  client.post(`/teaching/quizzes/${quizId}/publish`, {});

/**
 * Unpublish quiz
 */
export const unpublishQuiz = (quizId: string) =>
  client.post(`/teaching/quizzes/${quizId}/unpublish`, {});

/**
 * Add question to quiz
 */
export const addQuizQuestion = (quizId: string, question: Partial<QuizQuestion>) =>
  client.post<QuizQuestion>(`/teaching/quizzes/${quizId}/questions`, question);

/**
 * Update quiz question
 */
export const updateQuizQuestion = (questionId: string, question: Partial<QuizQuestion>) =>
  client.patch<QuizQuestion>(`/teaching/questions/${questionId}`, question);

/**
 * Delete quiz question
 */
export const deleteQuizQuestion = (questionId: string) =>
  client.delete(`/teaching/questions/${questionId}`);

/**
 * Reorder quiz questions
 */
export const reorderQuizQuestions = (quizId: string, order: string[]) =>
  client.post(`/teaching/quizzes/${quizId}/reorder`, { order });

/**
 * Get quiz statistics for teacher
 */
export const getQuizStats = (quizId: string) =>
  client.get<QuizStats>(`/teaching/quizzes/${quizId}/stats`);
