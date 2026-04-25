/**
 * Quiz types matching the backend API resources
 */
export type QuizQuestionType =
    | 'multiple_choice'
    | 'true_false'
    | 'short_answer';
export interface QuizQuestionOption {
    id: number;
    option_text: string;
    is_correct: boolean | null;
    sort_order: number;
}
export interface QuizQuestion {
    id: number;
    quiz_id: number;
    type: QuizQuestionType;
    type_label: string;
    question: string;
    explanation: string | null;
    points: number;
    sort_order: number;
    options: QuizQuestionOption[];
    created_at: string;
    updated_at: string;
}
export interface Quiz {
    id: number;
    training_unit_id: number;
    title: string;
    description: string | null;
    passing_score: number;
    time_limit_minutes: number | null;
    max_attempts: number | null;
    shuffle_questions: boolean;
    shuffle_options: boolean;
    show_correct_answers: boolean;
    is_published: boolean;
    question_count: number;
    total_points: number;
    questions?: QuizQuestion[];
    can_attempt: boolean | null;
    attempt_count: number | null;
    has_passed: boolean | null;
    best_attempt: QuizAttempt | null;
    created_at: string;
    updated_at: string;
}
export interface QuizAttemptAnswer {
    id: number;
    question_id: number;
    selected_option_id: number | null;
    text_answer: string | null;
    is_correct: boolean;
    points_earned: number;
    question?: QuizQuestion;
    selected_option?: QuizQuestionOption;
}
export interface QuizAttempt {
    id: number;
    quiz_id: number;
    user_id: number;
    score: number;
    total_points: number;
    percentage: number;
    passed: boolean;
    is_completed: boolean;
    duration_seconds: number | null;
    started_at: string | null;
    completed_at: string | null;
    answers?: QuizAttemptAnswer[];
    created_at: string;
}
export interface QuizResult {
    question_id: number;
    is_correct: boolean;
    points_earned: number;
    correct_option_id: number | null;
    explanation: string | null;
}
export interface QuizSubmitResponse {
    message: string;
    attempt: QuizAttempt;
    results: QuizResult[];
}
export interface QuizStats {
    pass_rate: number;
    average_score: number;
    total_attempts: number;
}
// Form types for creating/editing
export interface CreateQuizData {
    title: string;
    description?: string;
    passing_score?: number;
    time_limit_minutes?: number | null;
    max_attempts?: number | null;
    shuffle_questions?: boolean;
    shuffle_options?: boolean;
    show_correct_answers?: boolean;
}
export interface CreateQuestionData {
    type: QuizQuestionType;
    question: string;
    explanation?: string;
    points?: number;
    correct_answer?: boolean; // For true/false
    options?: {
        option_text: string;
        is_correct: boolean;
    }[];
}
export interface QuizAnswerInput {
    question_id: number;
    selected_option_id?: number;
    text_answer?: string;
}
