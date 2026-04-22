import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TeacherQuizStatsPanel } from '../TeacherQuizStatsPanel';

const { getQuizStatsMock } = vi.hoisted(() => ({
    getQuizStatsMock: vi.fn(),
}));

vi.mock('@/api/quiz.api', () => ({
    getQuizStats: getQuizStatsMock,
}));

describe('TeacherQuizStatsPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders teacher-facing quiz metrics from the stats endpoint', async () => {
        getQuizStatsMock.mockResolvedValue({
            total_attempts: 18,
            average_score: 82.5,
            pass_rate: 72.2,
        });

        render(<TeacherQuizStatsPanel quizId="quiz-12" />);

        await waitFor(() => {
            expect(getQuizStatsMock).toHaveBeenCalledWith('quiz-12');
        });

        expect(await screen.findByText('18')).toBeInTheDocument();
        expect(screen.getByText('82.5%')).toBeInTheDocument();
        expect(screen.getByText('72.2%')).toBeInTheDocument();
    });

    it('shows an empty-state error when stats cannot be loaded', async () => {
        getQuizStatsMock.mockRejectedValue(new Error('No stats'));

        render(<TeacherQuizStatsPanel quizId="quiz-44" />);

        expect(
            await screen.findByText(
                /quiz statistics are unavailable right now/i,
            ),
        ).toBeInTheDocument();
    });
});
