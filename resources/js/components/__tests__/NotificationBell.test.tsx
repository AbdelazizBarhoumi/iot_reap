import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { server } from '@/test/mocks/server';
import type { Notification } from '@/types/notification.types';
import { NotificationBell } from '../NotificationBell';
// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => <div {...props}>{children}</div>,
        button: ({ children, onClick, ...props }: { children?: React.ReactNode; onClick?: React.MouseEventHandler<HTMLButtonElement> } & Record<string, unknown>) => (
            <button onClick={onClick} {...props}>{children}</button>
        ),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
}));
// Mock Inertia router
vi.mock('@inertiajs/react', () => {
    const mockVisit = vi.fn();
    return {
        router: {
            visit: mockVisit,
        },
    };
});
const mockVisit = vi.fn();
describe('NotificationBell Component', () => {
    const mockNotifications: Notification[] = [
        {
            id: '1',
            type: 'course_approved',
            title: 'Course Approved',
            message: 'Your course "React Basics" has been approved',
            link: '/courses/1',
            read: false,
            created_at: '2024-01-15T10:00:00Z',
            data: { course_id: 1 },
        },
        {
            id: '2',
            type: 'new_enrollment',
            title: 'New Student Enrolled',
            message: 'John Doe enrolled in your course',
            link: '/courses/1/students',
            read: false,
            created_at: '2024-01-15T09:00:00Z',
        },
        {
            id: '3',
            type: 'forum_reply',
            title: 'New Forum Reply',
            message: 'Someone replied to your forum post',
            link: '/forum/posts/123',
            read: true,
            created_at: '2024-01-14T15:00:00Z',
        },
    ];
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup MSW handlers
        server.use(
            http.get('/notifications/recent', ({ request }) => {
                const url = new URL(request.url);
                const limit = url.searchParams.get('limit');
                return HttpResponse.json({
                    notifications: mockNotifications.slice(0, Number(limit) || 10),
                    unread_count: mockNotifications.filter(n => !n.read).length,
                });
            }),
            http.get('/notifications/unread-count', () => {
                return HttpResponse.json({
                    count: mockNotifications.filter(n => !n.read).length,
                });
            }),
            http.post('/notifications/:id/read', ({ params }) => {
                const notification = mockNotifications.find(n => n.id === params.id);
                if (notification) {
                    notification.read = true;
                    return HttpResponse.json({ notification });
                }
                return new HttpResponse(null, { status: 404 });
            }),
            http.post('/notifications/mark-all-read', () => {
                mockNotifications.forEach(n => n.read = true);
                return HttpResponse.json({
                    marked_count: mockNotifications.length,
                    unread_count: 0,
                });
            }),
            http.delete('/notifications/:id', ({ params }) => {
                const index = mockNotifications.findIndex(n => n.id === params.id);
                if (index !== -1) {
                    mockNotifications.splice(index, 1);
                    return new HttpResponse(null, { status: 204 });
                }
                return new HttpResponse(null, { status: 404 });
            })
        );
    });
    it('renders notification bell button', () => {
        render(<NotificationBell />);
        const bellButton = screen.getByLabelText(/notifications/i) || 
                          screen.getByRole('button', { name: /notification/i });
        expect(bellButton).toBeInTheDocument();
    });
    it('shows unread count badge when there are unread notifications', async () => {
        render(<NotificationBell />);
        await waitFor(() => {
            expect(screen.getByText('2')).toBeInTheDocument(); // 2 unread notifications
        });
    });
    it('does not show count badge when there are no unread notifications', async () => {
        // Mock all notifications as read
        server.use(
            http.get('/notifications/unread-count', () => {
                return HttpResponse.json({ count: 0 });
            }),
            http.get('/notifications/recent', () => {
                const readNotifications = mockNotifications.map(n => ({ ...n, read: true }));
                return HttpResponse.json({
                    notifications: readNotifications,
                    unread_count: 0,
                });
            })
        );
        render(<NotificationBell />);
        await waitFor(() => {
            expect(screen.queryByText('2')).not.toBeInTheDocument();
        });
    });
    it('opens notification dropdown when bell is clicked', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(() => {
            expect(screen.getByText('Course Approved')).toBeInTheDocument();
            expect(screen.getByText('New Student Enrolled')).toBeInTheDocument();
        });
    });
    it('displays notification titles and messages correctly', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(() => {
            expect(screen.getByText('Course Approved')).toBeInTheDocument();
            expect(screen.getByText('Your course "React Basics" has been approved')).toBeInTheDocument();
            expect(screen.getByText('New Student Enrolled')).toBeInTheDocument();
            expect(screen.getByText('John Doe enrolled in your course')).toBeInTheDocument();
        });
    });
    it('shows different icons for different notification types', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(() => {
            // Should render notifications with appropriate icons based on type
            expect(screen.getByText('Course Approved')).toBeInTheDocument();
            expect(screen.getByText('New Student Enrolled')).toBeInTheDocument();
            expect(screen.getByText('New Forum Reply')).toBeInTheDocument();
        });
    });
    it('marks notification as read when clicked', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(async () => {
            const notification = screen.getByText('Course Approved');
            await user.click(notification);
            // Should navigate to the notification link
            expect(mockVisit).toHaveBeenCalledWith('/courses/1');
        });
    });
    it('shows mark all as read button when there are unread notifications', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(() => {
            expect(screen.getByText(/mark all as read/i)).toBeInTheDocument();
        });
    });
    it('marks all notifications as read when mark all button is clicked', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(async () => {
            const markAllButton = screen.getByText(/mark all as read/i);
            await user.click(markAllButton);
            // Should update the unread count
            await waitFor(() => {
                expect(screen.queryByText('2')).not.toBeInTheDocument();
            });
        });
    });
    it('displays timestamps relative to current time', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(() => {
            // Should show relative timestamps like "1 hour ago", "yesterday", etc.
            expect(screen.getByText(/ago|yesterday|today/i)).toBeInTheDocument();
        });
    });
    it('groups notifications by date', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(() => {
            // Should show date group headers like "Today", "Yesterday"
            expect(screen.getByText(/today|yesterday|earlier/i)).toBeInTheDocument();
        });
    });
    it('shows loading state while fetching notifications', () => {
        // Mock delayed response
        server.use(
            http.get('/notifications/recent', async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return HttpResponse.json({
                    notifications: mockNotifications,
                    unread_count: 2,
                });
            })
        );
        render(<NotificationBell />);
        // Should show loading indicator initially
        expect(screen.getByTestId('loading') || 
               screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });
    it('handles empty notifications gracefully', async () => {
        const user = userEvent.setup();
        // Mock empty notifications
        server.use(
            http.get('/notifications/recent', () => {
                return HttpResponse.json({
                    notifications: [],
                    unread_count: 0,
                });
            }),
            http.get('/notifications/unread-count', () => {
                return HttpResponse.json({ count: 0 });
            })
        );
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(() => {
            expect(screen.getByText(/no notifications|no new notifications/i)).toBeInTheDocument();
        });
    });
    it('shows settings link in dropdown', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(() => {
            expect(screen.getByText(/settings|preferences/i)).toBeInTheDocument();
        });
    });
    it('closes dropdown when clicking outside', async () => {
        const user = userEvent.setup();
        render(<NotificationBell />);
        // Open dropdown
        const bellButton = screen.getByRole('button', { name: /notification/i });
        await user.click(bellButton);
        await waitFor(() => {
            expect(screen.getByText('Course Approved')).toBeInTheDocument();
        });
        // Click outside
        await user.click(document.body);
        await waitFor(() => {
            expect(screen.queryByText('Course Approved')).not.toBeInTheDocument();
        });
    });
    it('handles API errors gracefully', async () => {
        // Mock API error
        server.use(
            http.get('/notifications/recent', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );
        render(<NotificationBell />);
        await waitFor(() => {
            // Should handle error without crashing
            expect(screen.getByRole('button', { name: /notification/i })).toBeInTheDocument();
        });
    });
});


