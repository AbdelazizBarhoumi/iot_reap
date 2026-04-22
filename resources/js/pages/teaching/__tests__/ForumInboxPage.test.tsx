import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeacherForumInboxPage from '../forum-inbox';

const { forumApiMock } = vi.hoisted(() => ({
    forumApiMock: {
        getTeacherInbox: vi.fn(),
        getThread: vi.fn(),
        pinThread: vi.fn(),
        unpinThread: vi.fn(),
        lockThread: vi.fn(),
        unlockThread: vi.fn(),
        resolveThreadFlag: vi.fn(),
        markAsAnswer: vi.fn(),
    },
}));

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({
        href,
        children,
        ...props
    }: {
        href: string;
        children: ReactNode;
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/routes/teaching', () => ({
    default: {
        index: { url: () => '/teaching' },
        forum: { inbox: { url: () => '/teaching/forum/inbox' } },
    },
}));

vi.mock('@/api/forum.api', () => ({
    forumApi: forumApiMock,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('TeacherForumInboxPage', () => {
    const summaryThread = {
        id: 'thread-1',
        title: 'Sensor calibration issue',
        content: 'Operators are stuck on the PLC calibration step.',
        author: {
            id: 1,
            name: 'Alex Engineer',
            role: 'student' as const,
        },
        status: 'open' as const,
        upvotes: 0,
        hasUpvoted: false,
        replyCount: 1,
        viewCount: 4,
        isPinned: false,
        isLocked: false,
        isFlagged: true,
        trainingPathId: 10,
        trainingPath: { id: 10, title: 'Industrial Automation' },
        trainingUnit: { id: 20, title: 'PLC Calibration Lab' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const fullThread = {
        ...summaryThread,
        replies: [
            {
                id: 'reply-1',
                threadId: 'thread-1',
                content: 'Start by resetting the offset to 0.5.',
                author: {
                    id: 2,
                    name: 'Jordan Mentor',
                    role: 'teacher' as const,
                },
                upvotes: 2,
                hasUpvoted: false,
                isAnswer: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                replies: [],
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        forumApiMock.getTeacherInbox.mockImplementation(
            async (filter?: 'flagged' | 'unanswered' | 'recent') => ({
                data:
                    filter === 'flagged'
                        ? [summaryThread]
                        : filter === 'recent'
                          ? [summaryThread]
                          : [],
                pagination: {
                    current_page: 1,
                    last_page: 1,
                    per_page: 20,
                    total: filter === 'flagged' || filter === 'recent' ? 1 : 0,
                },
            }),
        );
        forumApiMock.getThread.mockResolvedValue(fullThread);
        forumApiMock.lockThread.mockResolvedValue({});
        forumApiMock.resolveThreadFlag.mockResolvedValue({});
        forumApiMock.markAsAnswer.mockResolvedValue({});
    });

    it('runs teacher moderation actions from the inbox page', async () => {
        const user = userEvent.setup();

        render(
            <TeacherForumInboxPage
                initialFilter="flagged"
                selectedThreadId="thread-1"
                threads={{
                    flagged: [summaryThread],
                    unanswered: [],
                    recent: [summaryThread],
                }}
            />,
        );

        await waitFor(() => {
            expect(forumApiMock.getThread).toHaveBeenCalledWith('thread-1');
        });

        await user.click(screen.getByRole('button', { name: /lock/i }));

        await waitFor(() => {
            expect(forumApiMock.lockThread).toHaveBeenCalledWith('thread-1');
        });

        await user.click(screen.getByRole('button', { name: /resolve flag/i }));

        await waitFor(() => {
            expect(forumApiMock.resolveThreadFlag).toHaveBeenCalledWith(
                'thread-1',
            );
        });
    });

    it('marks a reply as the answer from the thread detail pane', async () => {
        const user = userEvent.setup();

        render(
            <TeacherForumInboxPage
                initialFilter="flagged"
                selectedThreadId="thread-1"
                threads={{
                    flagged: [summaryThread],
                    unanswered: [],
                    recent: [],
                }}
            />,
        );

        await screen.findByText(/start by resetting the offset/i);

        await user.click(
            screen.getByRole('button', { name: /mark as answer/i }),
        );

        await waitFor(() => {
            expect(forumApiMock.markAsAnswer).toHaveBeenCalledWith('reply-1');
        });
    });
});
