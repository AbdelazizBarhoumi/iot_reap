/**
 * Quiz Edit Page (Teacher)
 * Teacher view for creating and editing quizzes.
 */
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { QuizBuilder } from '@/components/quiz';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Quiz } from '@/types/quiz.types';
interface QuizEditPageProps {
    trainingUnitId: string;
    quiz: Quiz | null;
}
export default function QuizEditPage({
    trainingUnitId,
    quiz,
}: QuizEditPageProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Teaching', href: '/teaching' },
            {
                title: quiz ? 'Edit Quiz' : 'Create Quiz',
                href: `/teaching/trainingUnits/${trainingUnitId}/quiz`,
            },
        ],
        [trainingUnitId, quiz],
    );
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={quiz ? `Edit Quiz: ${quiz.title}` : 'Create Quiz'} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/teaching">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="font-heading text-2xl font-semibold text-foreground">
                            {quiz ? 'Edit Quiz' : 'Create Quiz'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {quiz
                                ? 'Modify quiz settings and questions'
                                : 'Create a new quiz for this trainingUnit'}
                        </p>
                    </div>
                </div>
                <div className="max-w-4xl">
                    <QuizBuilder trainingUnitId={trainingUnitId} quiz={quiz} />
                </div>
            </div>
        </AppLayout>
    );
}
