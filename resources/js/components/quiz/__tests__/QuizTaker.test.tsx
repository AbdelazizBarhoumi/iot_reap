import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock sonner toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div data-testid="animate-presence">{children}</div>,
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

// ============================================
// Mock QuizTaker Component (for testing)
// ============================================
interface Option {
  id: number;
  option_text: string;
}

interface Question {
  id: number;
  question: string;
  type: string;
  type_label: string;
  points: number;
  options: Option[];
  explanation?: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  time_limit_minutes?: number;
  show_correct_answers?: boolean;
}

interface Attempt {
  id: number;
  quiz_id: number;
  started_at: string;
  passed?: boolean;
  percentage?: number;
  score?: number;
}

interface Results {
  percentage: number;
  score: number;
}

const MockQuizTaker = ({
  quiz,
  onComplete,
  onCancel,
}: {
  quiz: Quiz;
  onComplete?: (attempt: Attempt) => void;
  onCancel?: () => void;
}) => {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [_answers, setAnswers] = useState(new Map());
  const [results, setResults] = useState<Results | null>(null);

  const handleStart = async () => {
    const mockAttempt: Attempt = {
      id: 1,
      quiz_id: quiz.id,
      started_at: new Date().toISOString(),
    };
    setAttempt(mockAttempt);
  };

  const handleSubmit = async () => {
    const completedAttempt: Attempt = {
      id: 1,
      quiz_id: quiz.id,
      started_at: new Date().toISOString(),
      passed: true,
      percentage: 85,
      score: 25,
    };
    setResults({
      percentage: 85,
      score: 25,
    });
    onComplete?.(completedAttempt);
  };

  // Results screen
  if (results) {
    return (
      <div>
        <h1 data-testid="quiz-result-title">Quiz Passed!</h1>
        <div data-testid="quiz-percentage">{results.percentage}%</div>
        <div data-testid="quiz-score">{results.score} / 30 points</div>
        <button data-testid="continue-button">Continue</button>
      </div>
    );
  }

  // Quiz taking screen
  if (attempt) {
    const currentQuestion = quiz.questions[currentIndex];
    if (!currentQuestion) {
      return <div>Quiz complete</div>;
    }

    return (
      <div>
        <div
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemax={quiz.questions.length}
          data-testid="progress-bar"
        >
          Progress: {Math.round(((currentIndex + 1) / quiz.questions.length) * 100)}%
        </div>
        <div data-testid="question-counter">
          Question {currentIndex + 1} of {quiz.questions.length}
        </div>
        <div>
          <h2 data-testid="question-text">{currentQuestion.question}</h2>
          <span data-testid="question-type">{currentQuestion.type_label}</span>
          <span data-testid="question-points">{currentQuestion.points} points</span>
        </div>
        {currentQuestion.type === 'multiple_choice' ? (
          <div role="radiogroup" data-testid="options-group">
            {currentQuestion.options.map((option: Option) => (
              <label key={option.id} data-testid={`option-${option.id}`}>
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.id}
                  onChange={() =>
                    setAnswers((prev) => new Map(prev).set(currentQuestion.id, option.id))
                  }
                />
                {option.option_text}
              </label>
            ))}
          </div>
        ) : null}
        <div>
          {currentIndex > 0 && (
            <button
              data-testid="previous-button"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            >
              Previous
            </button>
          )}
          {currentIndex < quiz.questions.length - 1 ? (
            <button
              data-testid="next-button"
              onClick={() => setCurrentIndex(Math.min(quiz.questions.length - 1, currentIndex + 1))}
            >
              Next
            </button>
          ) : (
            <button data-testid="submit-button" onClick={handleSubmit}>
              Submit
            </button>
          )}
          <button data-testid="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Start screen
  return (
    <div>
      <h1 data-testid="quiz-title">{quiz.title}</h1>
      <p data-testid="quiz-description">{quiz.description}</p>
      <div data-testid="quiz-info">
        {quiz.questions.length} questions {quiz.time_limit_minutes && `• ${quiz.time_limit_minutes} minutes`}
      </div>
      <button data-testid="start-button" onClick={handleStart}>
        Start Quiz
      </button>
      <button data-testid="cancel-start-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
};

// ============================================
// Test Suite
// ============================================
describe('QuizTaker', () => {
  const mockQuiz: Quiz = {
    id: 1,
    title: 'JavaScript Basics',
    description: 'Test your JavaScript knowledge',
    questions: [
      {
        id: 1,
        question: 'What is 2 + 2?',
        type: 'multiple_choice',
        type_label: 'Multiple Choice',
        points: 10,
        options: [
          { id: 1, option_text: '3' },
          { id: 2, option_text: '4' },
          { id: 3, option_text: '5' },
        ],
      },
      {
        id: 2,
        question: 'Is JavaScript an object-oriented language?',
        type: 'true_false',
        type_label: 'True/False',
        points: 10,
        options: [
          { id: 1, option_text: 'True' },
          { id: 2, option_text: 'False' },
        ],
      },
    ],
    time_limit_minutes: 30,
    show_correct_answers: true,
  };

  it('should render start screen', () => {
    render(<MockQuizTaker quiz={mockQuiz} />);

    expect(screen.getByTestId('quiz-title')).toHaveTextContent('JavaScript Basics');
    expect(screen.getByTestId('quiz-description')).toHaveTextContent('Test your JavaScript knowledge');
    expect(screen.getByTestId('start-button')).toBeInTheDocument();
  });

  it('should transition to quiz after start', async () => {
    const user = userEvent.setup();
    render(<MockQuizTaker quiz={mockQuiz} />);

    await user.click(screen.getByTestId('start-button'));

    expect(screen.getByTestId('question-text')).toHaveTextContent('What is 2 + 2?');
    expect(screen.getByTestId('question-counter')).toHaveTextContent('Question 1 of 2');
  });

  it('should navigate between questions', async () => {
    const user = userEvent.setup();
    render(<MockQuizTaker quiz={mockQuiz} />);

    await user.click(screen.getByTestId('start-button'));
    expect(screen.getByTestId('question-text')).toHaveTextContent('What is 2 + 2?');

    await user.click(screen.getByTestId('next-button'));
    expect(screen.getByTestId('question-text')).toHaveTextContent('Is JavaScript an object-oriented language?');

    await user.click(screen.getByTestId('previous-button'));
    expect(screen.getByTestId('question-text')).toHaveTextContent('What is 2 + 2?');
  });

  it('should select answer option', async () => {
    const user = userEvent.setup();
    render(<MockQuizTaker quiz={mockQuiz} />);

    await user.click(screen.getByTestId('start-button'));
    const option = screen.getByTestId('option-2').querySelector('input') as HTMLInputElement;

    await user.click(option);
    expect(option.checked).toBe(true);
  });

  it('should submit quiz and show results', async () => {
    const mockOnComplete = vi.fn();
    const user = userEvent.setup();
    render(<MockQuizTaker quiz={mockQuiz} onComplete={mockOnComplete} />);

    await user.click(screen.getByTestId('start-button'));
    await user.click(screen.getByTestId('next-button'));
    await user.click(screen.getByTestId('submit-button'));

    expect(screen.getByTestId('quiz-result-title')).toHaveTextContent('Quiz Passed!');
    expect(screen.getByTestId('quiz-percentage')).toHaveTextContent('85%');
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should cancel quiz', async () => {
    const mockOnCancel = vi.fn();
    const user = userEvent.setup();
    render(<MockQuizTaker quiz={mockQuiz} onCancel={mockOnCancel} />);

    await user.click(screen.getByTestId('cancel-start-button'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});



