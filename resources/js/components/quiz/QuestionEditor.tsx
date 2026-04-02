/**
 * QuestionEditor Component
 * Form for creating/editing quiz questions.
 */
import { Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CreateQuestionData, QuizQuestionType } from '@/types/quiz.types';
interface QuestionEditorProps {
    onSave: (data: CreateQuestionData) => void;
    onCancel: () => void;
    initialData?: CreateQuestionData;
}
interface OptionInput {
    option_text: string;
    is_correct: boolean;
}
export function QuestionEditor({
    onSave,
    onCancel,
    initialData,
}: QuestionEditorProps) {
    const [type, setType] = useState<QuizQuestionType>(
        initialData?.type ?? 'multiple_choice',
    );
    const [question, setQuestion] = useState(initialData?.question ?? '');
    const [explanation, setExplanation] = useState(
        initialData?.explanation ?? '',
    );
    const [points, setPoints] = useState(initialData?.points ?? 1);
    const [correctAnswer, setCorrectAnswer] = useState<boolean>(
        initialData?.correct_answer ?? true,
    );
    const [options, setOptions] = useState<OptionInput[]>(
        initialData?.options ?? [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
        ],
    );
    const handleTypeChange = (newType: QuizQuestionType) => {
        setType(newType);
        if (newType === 'true_false') {
            setOptions([
                { option_text: 'True', is_correct: true },
                { option_text: 'False', is_correct: false },
            ]);
        } else if (newType === 'multiple_choice' && options.length < 2) {
            setOptions([
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false },
            ]);
        }
    };
    const addOption = () => {
        setOptions([...options, { option_text: '', is_correct: false }]);
    };
    const removeOption = (index: number) => {
        if (options.length <= 2) return;
        const newOptions = options.filter((_, i) => i !== index);
        // Ensure at least one is correct
        if (!newOptions.some((o) => o.is_correct) && newOptions.length > 0) {
            newOptions[0].is_correct = true;
        }
        setOptions(newOptions);
    };
    const updateOption = (
        index: number,
        field: keyof OptionInput,
        value: string | boolean,
    ) => {
        setOptions((prevOptions) =>
            prevOptions.map((opt, i) => {
                if (field === 'is_correct' && value === true) {
                    return {
                        ...opt,
                        is_correct: i === index,
                    };
                }
                if (i !== index) return opt;
                return {
                    ...opt,
                    [field]: value,
                };
            }),
        );
    };
    const handleSave = () => {
        if (!question.trim()) return;
        const data: CreateQuestionData = {
            type,
            question: question.trim(),
            explanation: explanation.trim() || undefined,
            points,
        };
        if (type === 'true_false') {
            data.correct_answer = correctAnswer;
        } else if (type === 'multiple_choice') {
            data.options = options
                .filter((o) => o.option_text.trim())
                .map((o) => ({
                    option_text: o.option_text.trim(),
                    is_correct: o.is_correct,
                }));
        }
        onSave(data);
    };
    const isValid =
        question.trim() &&
        (type === 'short_answer' ||
            type === 'true_false' ||
            (type === 'multiple_choice' &&
                options.filter((o) => o.option_text.trim()).length >= 2));
    return (
        <Card className="border-primary/20 shadow-card">
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="font-heading text-lg">
                    Add Question
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Question Type */}
                <div>
                    <Label>Question Type</Label>
                    <Select
                        value={type}
                        onValueChange={(v) =>
                            handleTypeChange(v as QuizQuestionType)
                        }
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="multiple_choice">
                                Multiple Choice
                            </SelectItem>
                            <SelectItem value="true_false">
                                True/False
                            </SelectItem>
                            <SelectItem value="short_answer">
                                Short Answer
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Question Text */}
                <div>
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                        id="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question..."
                        className="mt-1"
                        rows={2}
                    />
                </div>
                {/* Points */}
                <div className="w-32">
                    <Label htmlFor="points">Points</Label>
                    <Input
                        id="points"
                        type="number"
                        min={1}
                        max={100}
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                        className="mt-1"
                    />
                </div>
                {/* True/False Answer */}
                {type === 'true_false' && (
                    <div>
                        <Label>Correct Answer</Label>
                        <RadioGroup
                            value={correctAnswer ? 'true' : 'false'}
                            onValueChange={(v: string) =>
                                setCorrectAnswer(v === 'true')
                            }
                            className="mt-2 flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="true" />
                                <Label htmlFor="true" className="font-normal">
                                    True
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="false" />
                                <Label htmlFor="false" className="font-normal">
                                    False
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}
                {/* Multiple Choice Options */}
                {type === 'multiple_choice' && (
                    <div>
                        <Label>Answer Options</Label>
                        <div className="mt-2 space-y-2">
                            {options.map((option, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            name="correct_option"
                                            checked={option.is_correct}
                                            onChange={() =>
                                                updateOption(
                                                    index,
                                                    'is_correct',
                                                    true,
                                                )
                                            }
                                            className="h-4 w-4 text-primary"
                                        />
                                    </div>
                                    <Input
                                        value={option.option_text}
                                        onChange={(e) =>
                                            updateOption(
                                                index,
                                                'option_text',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={`Option ${index + 1}`}
                                        className={
                                            option.is_correct
                                                ? 'border-green-500'
                                                : ''
                                        }
                                    />
                                    {options.length > 2 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeOption(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < 6 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addOption}
                                className="mt-2"
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add Option
                            </Button>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                            Select the radio button for the correct answer
                        </p>
                    </div>
                )}
                {/* Short Answer Note */}
                {type === 'short_answer' && (
                    <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                        Short answer questions will require manual grading by
                        the instructor.
                    </p>
                )}
                {/* Explanation */}
                <div>
                    <Label htmlFor="explanation">
                        Explanation (shown after answer)
                    </Label>
                    <Textarea
                        id="explanation"
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Explain why this is the correct answer..."
                        className="mt-1"
                        rows={2}
                    />
                </div>
                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!isValid}>
                        Add Question
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}



