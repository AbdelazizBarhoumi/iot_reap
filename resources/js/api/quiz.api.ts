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
    pass_rate: number;
}

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
export const submitQuizAttempt = (
    attemptId: string,
    answers: Record<string, string>,
) =>
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
export const addQuizQuestion = (
    quizId: string,
    question: Partial<QuizQuestion>,
) =>
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
    question: Partial<QuizQuestion>,
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
export const reorderQuizQuestions = (quizId: string, order: string[]) =>
    client.post(`/teaching/quizzes/${quizId}/reorder`, {
        items: order.map((id, index) => ({
            id,
            order: index + 1,
        })),
    });

/**
 * Get quiz statistics for teacher
 */
export const getQuizStats = (quizId: string) =>
    client
        .get<TeacherQuizStatsResponse>(`/teaching/quizzes/${quizId}/stats`)
        .then((response) => response.data.stats);
