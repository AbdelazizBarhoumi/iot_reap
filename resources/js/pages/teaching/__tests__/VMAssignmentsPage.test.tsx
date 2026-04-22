import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeacherVMAssignmentsPage from '../vm-assignments';

const { vmAssignmentApiMock } = vi.hoisted(() => ({
    vmAssignmentApiMock: {
        getMyAssignments: vi.fn(),
        remove: vi.fn(),
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
        trainingUnitAssignments: {
            my: {
                url: () => '/teaching/trainingUnit-assignments/my-assignments',
            },
        },
    },
}));

vi.mock('@/api/vm.api', () => ({
    trainingUnitVMAssignmentApi: vmAssignmentApiMock,
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('TeacherVMAssignmentsPage', () => {
    const assignment = {
        id: 1,
        training_unit_id: 7,
        vm_id: 401,
        node_id: 10,
        vm_name: 'PLC Simulator',
        status: 'pending' as const,
        status_label: 'Pending',
        status_color: 'yellow' as const,
        teacher_notes: 'Needed for Week 3 lab.',
        admin_feedback: null,
        is_pending: true,
        is_approved: false,
        is_rejected: false,
        trainingUnit: {
            id: 7,
            title: 'PLC Simulator Lab',
            type: 'vm-lab',
            module: {
                id: 4,
                title: 'Automation Labs',
                trainingPath: {
                    id: 2,
                    title: 'Industrial Automation',
                },
            },
        },
        node: {
            id: 10,
            name: 'pve-node-01',
            hostname: 'pve-node-01.local',
        },
        assigned_by: {
            id: 'teacher-1',
            name: 'Teacher',
        },
        approved_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vmAssignmentApiMock.remove.mockResolvedValue(undefined);
        vmAssignmentApiMock.getMyAssignments.mockResolvedValue([assignment]);
    });

    it('renders assignment details and lets the teacher delete a pending request', async () => {
        const user = userEvent.setup();

        render(<TeacherVMAssignmentsPage assignments={[assignment]} />);

        expect(screen.getByText('PLC Simulator Lab')).toBeInTheDocument();
        expect(
            screen.getByText('Industrial Automation / Automation Labs'),
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /delete/i }));

        await waitFor(() => {
            expect(vmAssignmentApiMock.remove).toHaveBeenCalledWith(1);
        });

        await waitFor(() => {
            expect(
                screen.queryByText('PLC Simulator Lab'),
            ).not.toBeInTheDocument();
        });
    });

    it('refreshes the assignment list on demand', async () => {
        const user = userEvent.setup();

        render(<TeacherVMAssignmentsPage assignments={[]} />);

        await user.click(screen.getByRole('button', { name: /refresh/i }));

        await waitFor(() => {
            expect(vmAssignmentApiMock.getMyAssignments).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByText('PLC Simulator Lab')).toBeInTheDocument();
        });
    });
});
