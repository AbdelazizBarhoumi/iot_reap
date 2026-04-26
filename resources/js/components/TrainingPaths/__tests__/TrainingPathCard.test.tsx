import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import TrainingPathCard from '../TrainingPathCard';
// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({
            children,
            ...props
        }: { children?: React.ReactNode } & Record<string, unknown>) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
        <>{children}</>
    ),
}));
// Mock Inertia Link
vi.mock('@inertiajs/react', () => ({
    Link: ({
        children,
        href,
        className,
    }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));
describe('TrainingPathCard Component', () => {
    const mockTrainingPath = {
        id: '1',
        title: 'Introduction to React',
        description: 'Learn the fundamentals of React development',
        instructor: 'John Doe',
        category: 'Smart Manufacturing',
        level: 'Beginner' as const,
        duration: '4 weeks',
        rating: 4.5,
        students: 1250,
        hasVirtualMachine: true,
        thumbnail: null,
        modules: [{ trainingUnits: [1, 2, 3] }, { trainingUnits: [4, 5] }],
    };
    it('renders trainingPath title correctly', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(screen.getByText('Introduction to React')).toBeInTheDocument();
    });
    it('renders trainingPath description correctly', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(
            screen.getByText('Learn the fundamentals of React development'),
        ).toBeInTheDocument();
    });
    it('renders instructor name correctly', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    it('renders trainingPath price and rating', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(screen.getByText('4.5')).toBeInTheDocument();
    });
    it('displays student count correctly for numbers over 1000', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(screen.getByText('1.3k')).toBeInTheDocument();
    });
    it('displays student count correctly for numbers under 1000', () => {
        const trainingPathUnder1k = { ...mockTrainingPath, students: 850 };
        render(<TrainingPathCard trainingPath={trainingPathUnder1k} />);
        expect(screen.getByText('850')).toBeInTheDocument();
    });
    it('renders trainingPath level badge', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(screen.getByText('Beginner')).toBeInTheDocument();
    });
    it('renders trainingPath category', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(screen.getByText('Smart Manufacturing')).toBeInTheDocument();
    });
    it('renders thumbnail image when provided', () => {
        const trainingPathWithThumbnail = {
            ...mockTrainingPath,
            thumbnail_url: 'https://example.com/path-thumbnail.png',
        };

        render(<TrainingPathCard trainingPath={trainingPathWithThumbnail} />);

        expect(
            screen.getByAltText('Introduction to React thumbnail'),
        ).toHaveAttribute('src', 'https://example.com/path-thumbnail.png');
    });
    it('renders duration when provided', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(screen.getByText('4 weeks')).toBeInTheDocument();
    });
    it('does not render duration when not provided', () => {
        const trainingPathNoDuration = { ...mockTrainingPath, duration: null };
        render(<TrainingPathCard trainingPath={trainingPathNoDuration} />);
        expect(screen.queryByText('4 weeks')).not.toBeInTheDocument();
    });
    it('shows VM Labs badge when hasVirtualMachine is true', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(screen.getByText('VM Labs')).toBeInTheDocument();
    });
    it('does not show VM Labs badge when hasVirtualMachine is false', () => {
        const trainingPathNoVM = {
            ...mockTrainingPath,
            hasVirtualMachine: false,
        };
        render(<TrainingPathCard trainingPath={trainingPathNoVM} />);
        expect(screen.queryByText('VM Labs')).not.toBeInTheDocument();
    });
    it('calculates and displays module count correctly', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        expect(screen.getByText('2 modules')).toBeInTheDocument();
    });
    it('does not show module count when no modules provided', () => {
        const trainingPathNoModules = {
            ...mockTrainingPath,
            modules: undefined,
        };
        render(<TrainingPathCard trainingPath={trainingPathNoModules} />);
        expect(screen.queryByText(/modules/)).not.toBeInTheDocument();
    });
    it('renders star rating with correct filled/unfilled stars', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        // Should have 5 star icons (SVG elements)
        const stars = document.querySelectorAll('svg[class*="lucide-star"]');
        expect(stars).toHaveLength(5);
    });
    it('renders as a clickable link to trainingPath detail page', () => {
        render(<TrainingPathCard trainingPath={mockTrainingPath} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/trainingPaths/1');
    });
    it('handles different trainingPath levels with appropriate styling', () => {
        const intermediateTrainingPath = {
            ...mockTrainingPath,
            level: 'Intermediate' as const,
        };
        render(<TrainingPathCard trainingPath={intermediateTrainingPath} />);
        expect(screen.getByText('Intermediate')).toBeInTheDocument();
    });
    it('handles advanced trainingPath level', () => {
        const advancedTrainingPath = {
            ...mockTrainingPath,
            level: 'Advanced' as const,
        };
        render(<TrainingPathCard trainingPath={advancedTrainingPath} />);
        expect(screen.getByText('Advanced')).toBeInTheDocument();
    });
    it('falls back to default category icon for unknown categories', () => {
        const unknownCategoryTrainingPath = {
            ...mockTrainingPath,
            category: 'Unknown Category',
        };
        render(<TrainingPathCard trainingPath={unknownCategoryTrainingPath} />);
        expect(screen.getByText('Unknown Category')).toBeInTheDocument();
    });
});
