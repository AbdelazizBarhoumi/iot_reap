/**
 * Quiz API Module
 * Handles all quiz-related API calls for both engineers and teachers
 */

import type {
    Quiz,
    QuizQuestion,
    QuizAttempt,
    QuizStats,
    QuizAnswerInput,
    CreateQuestionData,
    QuizSubmitResponse,
    QuizResult,
} from '@/types/quiz.types';

export type {
    Quiz,
    QuizQuestion,
    QuizAttempt,
    QuizStats,
    QuizAnswerInput,
    QuizSubmitResponse,
    QuizResult,
};

import client from './client';

interface TeacherQuizResponse {
    quiz: Quiz | null;
}

interface TeacherQuizMutationResponse {
    message: string;
    quiz: Quiz;
}

interface TeacherQuestionMutationResponse {
    message: string;
    question: QuizQuestion;
}

interface TeacherQuizStatsResponse {
    stats: QuizStats;
}

export interface StartQuizResponse {
    message: string;
    attempt: QuizAttempt;
    quiz: Quiz;
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
    client.post<StartQuizResponse>(`/quizzes/${quizId}/start`, {});

/**
 * Submit a quiz attempt
 */
export const submitQuizAttempt = (
    attemptId: string,
    answers: QuizAnswerInput[],
) =>
    client.post<QuizSubmitResponse>(`/quiz-attempts/${attemptId}/submit`, {
        answers,
    });

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
    client
        .get<TeacherQuizResponse>(
            `/teaching/trainingUnits/${trainingUnitId}/quiz`,
        )
        .then((response) => response.data.quiz);

/**
 * Create or update a quiz
 */
export const saveQuiz = (trainingUnitId: string, quizData: Partial<Quiz>) =>
    client
        .post<TeacherQuizMutationResponse>(
            `/teaching/trainingUnits/${trainingUnitId}/quiz`,
            quizData,
        )
        .then((response) => response.data.quiz);

/**
 * Update quiz
 */
export const updateQuiz = (quizId: string, quizData: Partial<Quiz>) =>
    client
        .patch<TeacherQuizMutationResponse>(
            `/teaching/quizzes/${quizId}`,
            quizData,
        )
        .then((response) => response.data.quiz);

/**
 * Delete quiz
 */
export const deleteQuiz = (quizId: string) =>
    client.delete(`/teaching/quizzes/${quizId}`);

/**
 * Publish quiz
 */
export const publishQuiz = (quizId: string) =>
    client
        .post<TeacherQuizMutationResponse>(
            `/teaching/quizzes/${quizId}/publish`,
            {},
        )
        .then((response) => response.data.quiz);

/**
 * Unpublish quiz
 */
export const unpublishQuiz = (quizId: string) =>
    client
        .post<TeacherQuizMutationResponse>(
            `/teaching/quizzes/${quizId}/unpublish`,
            {},
        )
        .then((response) => response.data.quiz);

/**
 * Add question to quiz
 */
export const addQuizQuestion = (quizId: string, question: CreateQuestionData) =>
    client
        .post<TeacherQuestionMutationResponse>(
            `/teaching/quizzes/${quizId}/questions`,
            question,
        )
        .then((response) => response.data.question);

/**
 * Update quiz question
 */
export const updateQuizQuestion = (
    questionId: string,
    question: Partial<Omit<QuizQuestion, 'options'>> & {
        options?: Partial<QuizQuestion['options'][number]>[];
    },
) =>
    client
        .patch<TeacherQuestionMutationResponse>(
            `/teaching/questions/${questionId}`,
            question,
        )
        .then((response) => response.data.question);

/**
 * Delete quiz question
 */
export const deleteQuizQuestion = (questionId: string) =>
    client.delete(`/teaching/questions/${questionId}`);

/**
 * Reorder quiz questions
 */
export const reorderQuizQuestions = (
    quizId: string,
    order: { id: number; sort_order: number }[],
) =>
    client.post(`/teaching/quizzes/${quizId}/reorder`, {
        items: order,
    });

/**
 * Get quiz statistics for teacher
 */
export const getQuizStats = (quizId: string) =>
    client
        .get<TeacherQuizStatsResponse>(`/teaching/quizzes/${quizId}/stats`)
        .then((response) => response.data.stats);
