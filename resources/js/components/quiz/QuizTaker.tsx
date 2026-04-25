/**
 * QuizTaker Component
 * Student-facing quiz taking interface.
 */
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Clock,
    Send,
    XCircle,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type {
    Quiz,
    QuizAttempt,
    QuizAnswerInput,
    QuizSubmitResponse,
} from '@/types/quiz.types';
interface QuizTakerProps {
    quiz: Quiz;
    onComplete?: (attempt: QuizAttempt) => void;
    onCancel?: () => void;
}
export function QuizTaker({ quiz, onComplete, onCancel }: QuizTakerProps) {
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<number, QuizAnswerInput>>(
        new Map(),
    );
    const [isStarting, setIsStarting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [results, setResults] = useState<QuizSubmitResponse | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const questions = quiz.questions || [];
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    // Timer effect is set up after handleSubmit to avoid using handleSubmit before declaration.
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const startQuiz = async () => {
        setIsStarting(true);
        try {
            const response = await fetch(`/quizzes/${quiz.id}/start`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN':
                        document.cookie
                            .split('; ')
                            .find((row) => row.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] ?? '',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to start quiz');
            }
            const data = await response.json();
            setAttempt(data.attempt);
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Failed to start quiz';
            toast.error(message);
        } finally {
            setIsStarting(false);
        }
    };
    const setAnswer = (
        questionId: number,
        answer: Partial<QuizAnswerInput>,
    ) => {
        setAnswers((prev) => {
            const newAnswers = new Map(prev);
            newAnswers.set(questionId, {
                question_id: questionId,
                ...prev.get(questionId),
                ...answer,
            });
            return newAnswers;
        });
    };
    const handleSubmit = useCallback(async () => {
        if (!attempt) return;
        setIsSubmitting(true);
        try {
            const answersArray = Array.from(answers.values());
            const response = await fetch(
                `/quiz-attempts/${attempt.id}/submit`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN':
                            document.cookie
                                .split('; ')
                                .find((row) => row.startsWith('XSRF-TOKEN='))
                                ?.split('=')[1] ?? '',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ answers: answersArray }),
                },
            );
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit quiz');
            }
            const data: QuizSubmitResponse = await response.json();
            setResults(data);
            onComplete?.(data.attempt);
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to submit quiz';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    }, [attempt, answers, onComplete]);

    useEffect(() => {
        if (!attempt || !quiz.time_limit_minutes || results) return;
        const startTime = new Date(attempt.started_at!).getTime();
        const endTime = startTime + quiz.time_limit_minutes * 60 * 1000;
        const updateTimer = () => {
            const remaining = Math.max(
                0,
                Math.floor((endTime - Date.now()) / 1000),
            );
            setTimeRemaining(remaining);
            if (remaining === 0) {
                handleSubmit();
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [attempt, quiz.time_limit_minutes, results, handleSubmit]);

    // Show start screen
    if (!attempt) {
        return (
            <Card className="mx-auto max-w-2xl shadow-card">
                <CardHeader className="text-center">
                    <CardTitle className="font-heading text-2xl">
                        {quiz.title}
                    </CardTitle>
                    {quiz.description && (
                        <p className="mt-2 text-muted-foreground">
                            {quiz.description}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-2xl font-bold text-primary">
                                {quiz.question_count}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Questions
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-2xl font-bold text-primary">
                                {quiz.passing_score}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Passing Score
                            </p>
                        </div>
                        {quiz.time_limit_minutes && (
                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="text-2xl font-bold text-primary">
                                    {quiz.time_limit_minutes}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Minutes
                                </p>
                            </div>
                        )}
                        {quiz.max_attempts && (
                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="text-2xl font-bold text-primary">
                                    {quiz.max_attempts -
                                        (quiz.attempt_count || 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Attempts Left
                                </p>
                            </div>
                        )}
                    </div>
                    {quiz.has_passed && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-100 p-4 dark:bg-green-900/30">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="text-green-800 dark:text-green-400">
                                You've already passed this quiz!
                            </span>
                        </div>
                    )}
                    <div className="flex justify-center gap-3 pt-4">
                        {onCancel && (
                            <Button variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button
                            size="lg"
                            onClick={startQuiz}
                            disabled={isStarting || !quiz.can_attempt}
                        >
                            {isStarting ? 'Starting...' : 'Start Quiz'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    // Show results
    if (results) {
        return (
            <Card className="mx-auto max-w-2xl shadow-card">
                <CardHeader className="text-center">
                    <div
                        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                            results.attempt.passed
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                        }`}
                    >
                        {results.attempt.passed ? (
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        ) : (
                            <XCircle className="h-10 w-10 text-red-600" />
                        )}
                    </div>
                    <CardTitle className="mt-4 font-heading text-2xl">
                        {results.attempt.passed
                            ? 'Congratulations!'
                            : 'Keep Trying!'}
                    </CardTitle>
                    <p className="text-muted-foreground">
                        {results.attempt.passed
                            ? 'You passed the quiz!'
                            : `You need ${quiz.passing_score}% to pass.`}
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className="text-5xl font-bold text-primary">
                            {results.attempt.percentage.toFixed(0)}%
                        </p>
                        <p className="text-muted-foreground">
                            {results.attempt.score} /{' '}
                            {results.attempt.total_points} points
                        </p>
                    </div>
                    {quiz.show_correct_answers && results.results && (
                        <div className="space-y-3">
                            <h3 className="font-semibold">Review Answers</h3>
                            {results.results.map((result, index) => {
                                const question = questions.find(
                                    (q) => q.id === result.question_id,
                                );
                                return (
                                    <div
                                        key={result.question_id}
                                        className={`rounded-lg p-3 ${
                                            result.is_correct
                                                ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                : 'border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {result.is_correct ? (
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="mt-0.5 h-4 w-4 text-red-600" />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">
                                                    {index + 1}.{' '}
                                                    {question?.question}
                                                </p>
                                                {result.explanation && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {result.explanation}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {result.points_earned} pts
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex justify-center pt-4">
                        <Button onClick={onCancel}>Continue</Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    // Show quiz question
    return (
        <div className="mx-auto max-w-2xl space-y-4">
            {/* Progress bar and timer */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <Progress value={progress} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Question {currentIndex + 1} of {questions.length}
                    </p>
                </div>
                {timeRemaining !== null && (
                    <Badge
                        variant={timeRemaining < 60 ? 'destructive' : 'outline'}
                        className="text-sm"
                    >
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(timeRemaining)}
                    </Badge>
                )}
            </div>
            {/* Question card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <Card className="shadow-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Badge variant="outline">
                                    {currentQuestion.type_label}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {currentQuestion.points}{' '}
                                    {currentQuestion.points === 1
                                        ? 'point'
                                        : 'points'}
                                </span>
                            </div>
                            <CardTitle className="mt-2 font-heading text-lg">
                                {currentQuestion.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Multiple choice / True-False */}
                            {(currentQuestion.type === 'multiple_choice' ||
                                currentQuestion.type === 'true_false') && (
                                <RadioGroup
                                    value={
                                        answers
                                            .get(currentQuestion.id)
                                            ?.selected_option_id?.toString() ||
                                        ''
                                    }
                                    onValueChange={(value: string) =>
                                        setAnswer(currentQuestion.id, {
                                            selected_option_id: Number(value),
                                        })
                                    }
                                    className="space-y-3"
                                >
                                    {currentQuestion.options.map((option) => (
                                        <div
                                            key={option.id}
                                            className="flex cursor-pointer items-center space-x-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                                            onClick={() =>
                                                setAnswer(currentQuestion.id, {
                                                    selected_option_id:
                                                        option.id,
                                                })
                                            }
                                        >
                                            <RadioGroupItem
                                                value={option.id.toString()}
                                                id={`opt-${option.id}`}
                                            />
                                            <Label
                                                htmlFor={`opt-${option.id}`}
                                                className="flex-1 cursor-pointer font-normal"
                                            >
                                                {option.option_text}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                            {/* Short answer */}
                            {currentQuestion.type === 'short_answer' && (
                                <Textarea
                                    value={
                                        answers.get(currentQuestion.id)
                                            ?.text_answer || ''
                                    }
                                    onChange={(e) =>
                                        setAnswer(currentQuestion.id, {
                                            text_answer: e.target.value,
                                        })
                                    }
                                    placeholder="Type your answer here..."
                                    rows={4}
                                />
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() =>
                        setCurrentIndex(Math.max(0, currentIndex - 1))
                    }
                    disabled={currentIndex === 0}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>
                {currentIndex < questions.length - 1 ? (
                    <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                )}
            </div>
            {/* Question dots */}
            <div className="flex flex-wrap justify-center gap-2">
                {questions.map((q, index) => {
                    const hasAnswer = answers.has(q.id);
                    return (
                        <button
                            key={q.id}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                                index === currentIndex
                                    ? 'bg-primary text-primary-foreground'
                                    : hasAnswer
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
