import { useState, useEffect } from 'react';
import * as quizApi from '@/api/quiz.api';

export function useQuiz(trainingUnitId: string) {
    const [quiz, setQuiz] = useState<quizApi.Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!trainingUnitId) return;

        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const { data } = await quizApi.getQuiz(trainingUnitId);
                setQuiz(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load quiz',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [trainingUnitId]);

    return { quiz, loading, error };
}

export function useQuizAttempt(quizId: string) {
    const [attempt, setAttempt] = useState<quizApi.QuizAttempt | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startAttempt = async () => {
        try {
            setLoading(true);
            const { data } = await quizApi.startQuizAttempt(quizId);
            setAttempt(data);
            setError(null);
            return data;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to start quiz';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const submitAttempt = async (answers: Record<string, string>) => {
        if (!attempt) throw new Error('No active attempt');
        try {
            setLoading(true);
            const { data } = await quizApi.submitQuizAttempt(
                attempt.id,
                answers,
            );
            setAttempt(data);
            setError(null);
            return data;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Failed to submit quiz';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { attempt, loading, error, startAttempt, submitAttempt };
}

export function useQuizHistory(quizId: string) {
    const [history, setHistory] = useState<quizApi.QuizAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!quizId) return;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const { data } = await quizApi.getQuizHistory(quizId);
                setHistory(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load quiz history',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [quizId]);

    return { history, loading, error };
}
