/**
 * QuizResults Component
 * Displays detailed quiz attempt results.
 */
import { CheckCircle2, Clock, Target, Trophy, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { QuizAttempt, QuizResult, Quiz } from '@/types/quiz.types';
interface QuizResultsProps {
    quiz: Quiz;
    attempt: QuizAttempt;
    results?: QuizResult[];
}
export function QuizResults({ quiz, attempt, results }: QuizResultsProps) {
    const questions = quiz.questions || [];
    return (
        <div className="space-y-6">
            {/* Score Card */}
            <Card className="shadow-card">
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div
                            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
                                attempt.passed
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : 'bg-red-100 dark:bg-red-900/30'
                            }`}
                        >
                            {attempt.passed ? (
                                <Trophy className="h-12 w-12 text-green-600" />
                            ) : (
                                <Target className="h-12 w-12 text-red-600" />
                            )}
                        </div>
                        <h2 className="mt-4 text-3xl font-bold">
                            {attempt.percentage.toFixed(0)}%
                        </h2>
                        <p className="text-muted-foreground">
                            {attempt.score} / {attempt.total_points} points
                        </p>
                        <Badge
                            variant={attempt.passed ? 'default' : 'destructive'}
                            className="mt-2"
                        >
                            {attempt.passed ? 'PASSED' : 'NOT PASSED'}
                        </Badge>
                    </div>
                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Score Progress
                            </span>
                            <span className="font-medium">
                                {quiz.passing_score}% to pass
                            </span>
                        </div>
                        <div className="relative">
                            <Progress
                                value={attempt.percentage}
                                className="h-3"
                            />
                            <div
                                className="absolute top-0 h-3 w-0.5 bg-yellow-500"
                                style={{ left: `${quiz.passing_score}%` }}
                            />
                        </div>
                    </div>
                    {attempt.duration_seconds && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                                Completed in{' '}
                                {Math.floor(attempt.duration_seconds / 60)}m{' '}
                                {attempt.duration_seconds % 60}s
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Detailed Results */}
            {quiz.show_correct_answers && results && results.length > 0 && (
                <Card className="shadow-card">
                    <CardHeader>
                        <CardTitle className="font-heading text-lg">
                            Question Review
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {results.map((result, index) => {
                            const question = questions.find(
                                (q) => q.id === result.question_id,
                            );
                            if (!question) return null;
                            const selectedOption = question.options?.find(
                                (o) =>
                                    o.id ===
                                    attempt.answers?.find(
                                        (a) => a.question_id === question.id,
                                    )?.selected_option_id,
                            );
                            const correctOption = question.options?.find(
                                (o) => o.id === result.correct_option_id,
                            );
                            return (
                                <div
                                    key={result.question_id}
                                    className={`rounded-lg border p-4 ${
                                        result.is_correct
                                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {result.is_correct ? (
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                                        ) : (
                                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                    Q{index + 1}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {result.points_earned} /{' '}
                                                    {question.points} pts
                                                </Badge>
                                            </div>
                                            <p className="mb-2 text-sm font-medium">
                                                {question.question}
                                            </p>
                                            {/* Show answer details for multiple choice */}
                                            {question.type !==
                                                'short_answer' && (
                                                <div className="space-y-1 text-sm">
                                                    {selectedOption &&
                                                        !result.is_correct && (
                                                            <p className="text-red-600 dark:text-red-400">
                                                                Your answer:{' '}
                                                                {
                                                                    selectedOption.option_text
                                                                }
                                                            </p>
                                                        )}
                                                    {correctOption && (
                                                        <p className="text-green-600 dark:text-green-400">
                                                            Correct answer:{' '}
                                                            {
                                                                correctOption.option_text
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {/* Explanation */}
                                            {result.explanation && (
                                                <div className="mt-2 rounded bg-muted/50 p-2 text-sm text-muted-foreground">
                                                    <strong>
                                                        Explanation:
                                                    </strong>{' '}
                                                    {result.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
