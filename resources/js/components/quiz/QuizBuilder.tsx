/**
 * QuizBuilder Component
 * Teacher-facing quiz creation and editing interface.
 */
import { Reorder } from 'framer-motion';
import {
    CheckCircle2,
    GripVertical,
    ListChecks,
    Plus,
    Save,
    ToggleLeft,
    Trash2,
    Type,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type {
    Quiz,
    QuizQuestion,
    QuizQuestionType,
    CreateQuestionData,
} from '@/types/quiz.types';
import { QuestionEditor } from './QuestionEditor';
interface QuizBuilderProps {
    trainingUnitId: string;
    quiz: Quiz | null;
    onQuizCreated?: (quiz: Quiz) => void;
}
const questionTypeIcons: Record<QuizQuestionType, React.ReactNode> = {
    multiple_choice: <ListChecks className="h-4 w-4" />,
    true_false: <ToggleLeft className="h-4 w-4" />,
    short_answer: <Type className="h-4 w-4" />,
};
export function QuizBuilder({
    trainingUnitId,
    quiz: initialQuiz,
    onQuizCreated,
}: QuizBuilderProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(initialQuiz);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    // Quiz form state
    const [title, setTitle] = useState(quiz?.title ?? '');
    const [description, setDescription] = useState(quiz?.description ?? '');
    const [passingScore, setPassingScore] = useState(quiz?.passing_score ?? 70);
    const [timeLimit, setTimeLimit] = useState<number | null>(
        quiz?.time_limit_minutes ?? null,
    );
    const [maxAttempts, setMaxAttempts] = useState<number | null>(
        quiz?.max_attempts ?? null,
    );
    const [shuffleQuestions, setShuffleQuestions] = useState(
        quiz?.shuffle_questions ?? false,
    );
    const [shuffleOptions, setShuffleOptions] = useState(
        quiz?.shuffle_options ?? false,
    );
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(
        quiz?.show_correct_answers ?? true,
    );
    // Handle question reorder with backend sync
    const handleReorder = async (newOrder: QuizQuestion[]) => {
        if (!quiz) return;
        // Optimistically update UI
        setQuiz((prev) => (prev ? { ...prev, questions: newOrder } : null));
        // Sync to backend
        setIsReordering(true);
        try {
            const items = newOrder.map((q, index) => ({
                id: q.id,
                order: index + 1,
            }));
            const response = await fetch(
                `/teaching/quizzes/${quiz.id}/reorder`,
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
                    body: JSON.stringify({ items }),
                },
            );
            if (!response.ok) throw new Error('Failed to reorder questions');
        } catch {
            toast.error('Failed to save question order');
            // Revert to original order on failure
            setQuiz((prev) =>
                prev ? { ...prev, questions: quiz.questions } : null,
            );
        } finally {
            setIsReordering(false);
        }
    };
    const createQuiz = async () => {
        setIsCreating(true);
        try {
            const response = await fetch(
                `/teaching/trainingUnits/${trainingUnitId}/quiz`,
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
                    body: JSON.stringify({
                        title,
                        description: description || null,
                        passing_score: passingScore,
                        time_limit_minutes: timeLimit,
                        max_attempts: maxAttempts,
                        shuffle_questions: shuffleQuestions,
                        shuffle_options: shuffleOptions,
                        show_correct_answers: showCorrectAnswers,
                    }),
                },
            );
            if (!response.ok) throw new Error('Failed to create quiz');
            const data = await response.json();
            setQuiz(data.quiz);
            onQuizCreated?.(data.quiz);
            toast.success('Quiz created successfully!');
        } catch {
            toast.error('Failed to create quiz');
        } finally {
            setIsCreating(false);
        }
    };
    const updateQuiz = async () => {
        if (!quiz) return;
        setIsSaving(true);
        try {
            const response = await fetch(`/teaching/quizzes/${quiz.id}`, {
                method: 'PATCH',
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
                body: JSON.stringify({
                    title,
                    description: description || null,
                    passing_score: passingScore,
                    time_limit_minutes: timeLimit,
                    max_attempts: maxAttempts,
                    shuffle_questions: shuffleQuestions,
                    shuffle_options: shuffleOptions,
                    show_correct_answers: showCorrectAnswers,
                }),
            });
            if (!response.ok) throw new Error('Failed to update quiz');
            const data = await response.json();
            setQuiz(data.quiz);
            toast.success('Quiz updated successfully!');
        } catch {
            toast.error('Failed to update quiz');
        } finally {
            setIsSaving(false);
        }
    };
    const publishQuiz = async () => {
        if (!quiz) return;
        try {
            const response = await fetch(
                `/teaching/quizzes/${quiz.id}/publish`,
                {
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
                },
            );
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to publish');
            }
            const data = await response.json();
            setQuiz(data.quiz);
            toast.success('Quiz published!');
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to publish quiz';
            toast.error(message);
        }
    };
    const unpublishQuiz = async () => {
        if (!quiz) return;
        try {
            const response = await fetch(
                `/teaching/quizzes/${quiz.id}/unpublish`,
                {
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
                },
            );
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to unpublish');
            }
            const data = await response.json();
            setQuiz(data.quiz);
            toast.success('Quiz unpublished - now in draft mode');
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Failed to unpublish quiz';
            toast.error(message);
        }
    };
    const deleteQuiz = async () => {
        if (!quiz) return;
        if (
            !confirm(
                'Are you sure you want to delete this quiz? This cannot be undone.',
            )
        )
            return;
        try {
            const response = await fetch(`/teaching/quizzes/${quiz.id}`, {
                method: 'DELETE',
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
            if (!response.ok) throw new Error('Failed to delete quiz');
            setQuiz(null);
            toast.success('Quiz deleted');
        } catch {
            toast.error('Failed to delete quiz');
        }
    };
    const addQuestion = async (data: CreateQuestionData) => {
        if (!quiz) return;
        try {
            const response = await fetch(
                `/teaching/quizzes/${quiz.id}/questions`,
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
                    body: JSON.stringify(data),
                },
            );
            if (!response.ok) throw new Error('Failed to add question');
            const responseData = await response.json();
            setQuiz((prev) =>
                prev
                    ? {
                          ...prev,
                          questions: [
                              ...(prev.questions || []),
                              responseData.question,
                          ],
                          question_count: prev.question_count + 1,
                      }
                    : null,
            );
            setShowAddQuestion(false);
            toast.success('Question added!');
        } catch {
            toast.error('Failed to add question');
        }
    };
    const deleteQuestion = async (questionId: number) => {
        try {
            const response = await fetch(`/teaching/questions/${questionId}`, {
                method: 'DELETE',
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
            if (!response.ok) throw new Error('Failed to delete question');
            setQuiz((prev) =>
                prev
                    ? {
                          ...prev,
                          questions:
                              prev.questions?.filter(
                                  (q) => q.id !== questionId,
                              ) || [],
                          question_count: prev.question_count - 1,
                      }
                    : null,
            );
            toast.success('Question deleted');
        } catch {
            toast.error('Failed to delete question');
        }
    };
    // No quiz yet - show creation form
    if (!quiz) {
        return (
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="font-heading text-lg">
                        Create Quiz
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="title">Quiz Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter quiz title"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">
                            Description (optional)
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the quiz"
                            className="mt-1"
                            rows={2}
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="passingScore">
                                Passing Score (%)
                            </Label>
                            <Input
                                id="passingScore"
                                type="number"
                                min={0}
                                max={100}
                                value={passingScore}
                                onChange={(e) =>
                                    setPassingScore(Number(e.target.value))
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="timeLimit">
                                Time Limit (minutes)
                            </Label>
                            <Input
                                id="timeLimit"
                                type="number"
                                min={1}
                                value={timeLimit ?? ''}
                                onChange={(e) =>
                                    setTimeLimit(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                                placeholder="No limit"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="maxAttempts">Max Attempts</Label>
                            <Input
                                id="maxAttempts"
                                type="number"
                                min={1}
                                value={maxAttempts ?? ''}
                                onChange={(e) =>
                                    setMaxAttempts(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                                placeholder="Unlimited"
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="shuffleQuestions"
                                checked={shuffleQuestions}
                                onCheckedChange={setShuffleQuestions}
                            />
                            <Label htmlFor="shuffleQuestions">
                                Shuffle Questions
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="shuffleOptions"
                                checked={shuffleOptions}
                                onCheckedChange={setShuffleOptions}
                            />
                            <Label htmlFor="shuffleOptions">
                                Shuffle Options
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="showCorrectAnswers"
                                checked={showCorrectAnswers}
                                onCheckedChange={setShowCorrectAnswers}
                            />
                            <Label htmlFor="showCorrectAnswers">
                                Show Correct Answers
                            </Label>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={createQuiz}
                            disabled={!title || isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create Quiz'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    // Quiz exists - show editor
    return (
        <div className="space-y-6">
            {/* Quiz Settings */}
            <Card className="shadow-card">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="font-heading text-lg">
                        Quiz Settings
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={
                                quiz.is_published ? 'default' : 'secondary'
                            }
                        >
                            {quiz.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        {quiz.is_published ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={unpublishQuiz}
                            >
                                Unpublish
                            </Button>
                        ) : quiz.question_count > 0 ? (
                            <Button size="sm" onClick={publishQuiz}>
                                <CheckCircle2 className="mr-1 h-4 w-4" />{' '}
                                Publish
                            </Button>
                        ) : null}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={deleteQuiz}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="title">Quiz Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="passingScore">
                                Passing Score (%)
                            </Label>
                            <Input
                                id="passingScore"
                                type="number"
                                min={0}
                                max={100}
                                value={passingScore}
                                onChange={(e) =>
                                    setPassingScore(Number(e.target.value))
                                }
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1"
                            rows={2}
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="timeLimit">
                                Time Limit (minutes)
                            </Label>
                            <Input
                                id="timeLimit"
                                type="number"
                                min={1}
                                value={timeLimit ?? ''}
                                onChange={(e) =>
                                    setTimeLimit(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                                placeholder="No limit"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="maxAttempts">Max Attempts</Label>
                            <Input
                                id="maxAttempts"
                                type="number"
                                min={1}
                                value={maxAttempts ?? ''}
                                onChange={(e) =>
                                    setMaxAttempts(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    )
                                }
                                placeholder="Unlimited"
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="shuffleQuestions"
                                checked={shuffleQuestions}
                                onCheckedChange={setShuffleQuestions}
                            />
                            <Label htmlFor="shuffleQuestions">
                                Shuffle Questions
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="shuffleOptions"
                                checked={shuffleOptions}
                                onCheckedChange={setShuffleOptions}
                            />
                            <Label htmlFor="shuffleOptions">
                                Shuffle Options
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="showCorrectAnswers"
                                checked={showCorrectAnswers}
                                onCheckedChange={setShowCorrectAnswers}
                            />
                            <Label htmlFor="showCorrectAnswers">
                                Show Correct Answers
                            </Label>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={updateQuiz} disabled={isSaving}>
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {/* Questions */}
            <Card className="shadow-card">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="font-heading text-lg">
                        Questions ({quiz.question_count})
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowAddQuestion(true)}>
                        <Plus className="mr-1 h-4 w-4" /> Add Question
                    </Button>
                </CardHeader>
                <CardContent>
                    {quiz.questions && quiz.questions.length > 0 ? (
                        <Reorder.Group
                            axis="y"
                            values={quiz.questions}
                            onReorder={handleReorder}
                            className="space-y-3"
                        >
                            {quiz.questions.map((question, index) => (
                                <Reorder.Item
                                    key={question.id}
                                    value={question}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex cursor-grab items-start gap-3 rounded-lg border border-border bg-muted/30 p-4 active:cursor-grabbing"
                                >
                                    <GripVertical className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {
                                                    questionTypeIcons[
                                                        question.type
                                                    ]
                                                }
                                                <span className="ml-1">
                                                    {question.type_label}
                                                </span>
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {question.points}{' '}
                                                {question.points === 1
                                                    ? 'point'
                                                    : 'points'}
                                            </span>
                                            {isReordering && (
                                                <span className="text-xs text-muted-foreground italic">
                                                    Saving...
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium">
                                            {index + 1}. {question.question}
                                        </p>
                                        {question.options &&
                                            question.options.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {question.options.map(
                                                        (opt) => (
                                                            <div
                                                                key={opt.id}
                                                                className={`rounded px-2 py-1 text-xs ${
                                                                    opt.is_correct
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                        : 'bg-muted text-muted-foreground'
                                                                }`}
                                                            >
                                                                {
                                                                    opt.option_text
                                                                }
                                                                {opt.is_correct &&
                                                                    ' ✓'}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() =>
                                            deleteQuestion(question.id)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                            <ListChecks className="mx-auto mb-3 h-12 w-12 opacity-50" />
                            <p>No questions yet. Add your first question!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Add Question Dialog */}
            {showAddQuestion && (
                <QuestionEditor
                    onSave={addQuestion}
                    onCancel={() => setShowAddQuestion(false)}
                />
            )}
        </div>
    );
}
