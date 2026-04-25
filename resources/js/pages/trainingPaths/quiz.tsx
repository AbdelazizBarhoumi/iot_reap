/**
 * Quiz Taking Page (Student)
 * Student view for taking quizzes.
 */
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { QuizResults, QuizTaker } from '@/components/quiz';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Quiz, QuizAttempt } from '@/types/quiz.types';

interface QuizPageProps {
    trainingUnitId: string;
    quiz: Quiz;
    canAttempt: boolean;
    attemptCount: number;
    maxAttempts: number | null;
}

export default function QuizPage({
    trainingUnitId,
    quiz,
    canAttempt,
    attemptCount,
    maxAttempts,
}: QuizPageProps) {
    const [completedAttempt, setCompletedAttempt] =
        useState<QuizAttempt | null>(null);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'TrainingPaths', href: '/trainingPaths' },
            { title: 'Quiz', href: `/trainingUnits/${trainingUnitId}/quiz` },
        ],
        [trainingUnitId],
    );

    const handleComplete = (attempt: QuizAttempt) => {
        setCompletedAttempt(attempt);
    };

    const handleCancel = () => {
        window.history.back();
    };

    const handleRetake = () => {
        setCompletedAttempt(null);
    };

    // Show results if quiz is completed
    if (completedAttempt) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={`Results: ${quiz.title}`} />
                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="font-heading text-2xl font-semibold text-foreground">
                                Quiz Results
                            </h1>
                        </div>
                    </div>
                    <QuizResults quiz={quiz} attempt={completedAttempt} />
                    <div className="flex justify-center gap-4">
                        {canAttempt &&
                            (maxAttempts === null ||
                                attemptCount + 1 < maxAttempts) && (
                                <Button onClick={handleRetake}>
                                    Retake Quiz
                                </Button>
                            )}
                        <Button variant="outline" onClick={handleCancel}>
                            Back to TrainingUnit
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Quiz: ${quiz.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-heading text-2xl font-semibold text-foreground">
                            {quiz.title}
                        </h1>
                    </div>
                </div>
                <QuizTaker
                    quiz={{
                        ...quiz,
                        can_attempt: canAttempt,
                        attempt_count: attemptCount,
                    }}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                />
            </div>
        </AppLayout>
    );
}
