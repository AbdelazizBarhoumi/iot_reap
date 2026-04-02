import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import CourseCard from '../CourseCard';
// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));
// Mock Inertia Link
vi.mock('@inertiajs/react', () => ({
    Link: ({ children, href, className }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));
describe('CourseCard Component', () => {
    const mockCourse = {
        id: '1',
        title: 'Introduction to React',
        description: 'Learn the fundamentals of React development',
        instructor: 'John Doe',
        category: 'Web Development',
        level: 'Beginner' as const,
        duration: '4 weeks',
        rating: 4.5,
        students: 1250,
        hasVirtualMachine: true,
        modules: [
            { lessons: [1, 2, 3] },
            { lessons: [4, 5] }
        ]
    };
    it('renders course title correctly', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('Introduction to React')).toBeInTheDocument();
    });
    it('renders course description correctly', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('Learn the fundamentals of React development')).toBeInTheDocument();
    });
    it('renders instructor name correctly', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    it('renders course price and rating', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('4.5')).toBeInTheDocument();
    });
    it('displays student count correctly for numbers over 1000', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('1.3k')).toBeInTheDocument();
    });
    it('displays student count correctly for numbers under 1000', () => {
        const courseUnder1k = { ...mockCourse, students: 850 };
        render(<CourseCard course={courseUnder1k} />);
        expect(screen.getByText('850')).toBeInTheDocument();
    });
    it('renders course level badge', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('Beginner')).toBeInTheDocument();
    });
    it('renders course category', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('Web Development')).toBeInTheDocument();
    });
    it('renders duration when provided', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('4 weeks')).toBeInTheDocument();
    });
    it('does not render duration when not provided', () => {
        const courseNoDuration = { ...mockCourse, duration: null };
        render(<CourseCard course={courseNoDuration} />);
        expect(screen.queryByText('4 weeks')).not.toBeInTheDocument();
    });
    it('shows VM Labs badge when hasVirtualMachine is true', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('VM Labs')).toBeInTheDocument();
    });
    it('does not show VM Labs badge when hasVirtualMachine is false', () => {
        const courseNoVM = { ...mockCourse, hasVirtualMachine: false };
        render(<CourseCard course={courseNoVM} />);
        expect(screen.queryByText('VM Labs')).not.toBeInTheDocument();
    });
    it('calculates and displays lesson count correctly', () => {
        render(<CourseCard course={mockCourse} />);
        expect(screen.getByText('5 lessons')).toBeInTheDocument();
    });
    it('does not show lesson count when no modules provided', () => {
        const courseNoModules = { ...mockCourse, modules: undefined };
        render(<CourseCard course={courseNoModules} />);
        expect(screen.queryByText(/lessons/)).not.toBeInTheDocument();
    });
    it('renders star rating with correct filled/unfilled stars', () => {
        render(<CourseCard course={mockCourse} />);
        // Should have 5 star icons (SVG elements)
        const stars = document.querySelectorAll('svg[class*="lucide-star"]');
        expect(stars).toHaveLength(5);
    });
    it('renders as a clickable link to course detail page', () => {
        render(<CourseCard course={mockCourse} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/courses/1');
    });
    it('handles different course levels with appropriate styling', () => {
        const intermediateCourse = { ...mockCourse, level: 'Intermediate' as const };
        render(<CourseCard course={intermediateCourse} />);
        expect(screen.getByText('Intermediate')).toBeInTheDocument();
    });
    it('handles advanced course level', () => {
        const advancedCourse = { ...mockCourse, level: 'Advanced' as const };
        render(<CourseCard course={advancedCourse} />);
        expect(screen.getByText('Advanced')).toBeInTheDocument();
    });
    it('falls back to default category icon for unknown categories', () => {
        const unknownCategoryCourse = { ...mockCourse, category: 'Unknown Category' };
        render(<CourseCard course={unknownCategoryCourse} />);
        expect(screen.getByText('Unknown Category')).toBeInTheDocument();
    });
});


