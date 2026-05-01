import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import EditTrainingUnitPage from '../trainingUnit-edit';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    motion: {
        div: ({ children, ...props }: { children: ReactNode }) => (
            <div {...props}>{children}</div>
        ),
    },
}));

vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/quiz/TeacherQuizStatsPanel', () => ({
    TeacherQuizStatsPanel: () => <div>Teacher Quiz Stats</div>,
}));

vi.mock('@/components/TrainingPaths/VideoUpload', () => ({
    default: () => <div>Video Upload</div>,
}));

vi.mock('@/api/teaching.api', () => ({
    updateTrainingUnit: vi.fn(),
}));

vi.mock('@/api/quiz.api', () => ({
    getOrCreateQuiz: vi.fn(),
}));

vi.mock('@/api/video.api', () => ({
    getVideoStatus: vi.fn(),
    getVideoForTrainingUnit: vi.fn(),
    uploadVideo: vi.fn(),
    deleteVideo: vi.fn(),
    retryTranscoding: vi.fn(),
    pollUntilReady: vi.fn(),
}));

vi.mock('@/api/vm.api', () => ({
    trainingUnitVMAssignmentApi: {
        availableVMs: vi.fn(),
        store: vi.fn(),
        destroy: vi.fn(),
        forTrainingUnit: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('@/routes/teaching', () => ({
    default: {
        index: { url: () => '/teaching' },
    },
}));

describe('EditTrainingUnitPage', () => {
    it('always shows content authoring tools for the teacher', () => {
        render(
            <EditTrainingUnitPage
                trainingPathId="10"
                moduleId="20"
                trainingUnitId="30"
                trainingPath={{
                    id: 10,
                    title: 'Automation Basics',
                    description: 'Test path',
                    instructor: 'Test Instructor',
                    instructor_id: 1,
                    thumbnail: null,
                    video_type: null,
                    video_url: null,
                    category: 'General',
                    level: 'Beginner',
                    duration: '2 hours',
                    price: 0,
                    currency: 'USD',
                    rating: 4.5,
                    students: 10,
                    hasVirtualMachine: false,
                    isFree: true,
                    status: 'approved',
                    adminFeedback: null,
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                    modules: [{ id: '20', title: 'Module 1', trainingUnits: [], sort_order: 1 }],
                }}
                trainingUnit={{
                    id: '30',
                    title: 'Sensor Overview',
                    type: 'reading',
                    duration: '30 min',
                    content: 'Intro content',
                    objectives: ['Understand sensors'],
                    vmEnabled: false,
                    videoUrl: null,
                    resources: [],
                    externalVideoUrl: '',
                    uploadedVideoUrl: '',
                    sort_order: 1,
                }}
                vmAssignment={null}
            />,
        );

        expect(screen.getByText('Content Authoring')).toBeInTheDocument();
        expect(screen.getByText('Create Quiz')).toBeInTheDocument();
        expect(screen.getByText('Edit Article')).toBeInTheDocument();
        expect(screen.getByText('Manage Video')).toBeInTheDocument();
        expect(screen.getByText('Manage VM Request')).toBeInTheDocument();
    });
});
