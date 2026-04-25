import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../ui/button';
describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click me</Button>);
        expect(
            screen.getByRole('button', { name: /click me/i }),
        ).toBeInTheDocument();
    });
    it('handles click events', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        await user.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
    it('applies variant classes correctly', () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-destructive');
    });
    it('applies size classes correctly', () => {
        render(<Button size="sm">Small</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('h-9');
    });
    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });
    it('renders as a child component when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>,
        );
        expect(
            screen.getByRole('link', { name: /link button/i }),
        ).toBeInTheDocument();
    });
});
describe('Example MSW Integration', () => {
    it('msw server is ready for API mocking', async () => {
        const response = await fetch('/api/user');
        const data = await response.json();
        expect(data).toEqual({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        });
    });
});
