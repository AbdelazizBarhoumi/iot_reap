import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppSidebar } from '../app-sidebar';

vi.mock('@/components/nav-main', () => ({
    NavMain: ({ items, label }: { items: Array<{ title: string }>; label?: string }) => (
        <div data-testid={`nav-${label ?? 'platform'}`}>
            <span>{label}</span>
            {items.map((item) => (
                <span key={item.title}>{item.title}</span>
            ))}
        </div>
    ),
}));

vi.mock('@/components/nav-user', () => ({
    NavUser: () => <div data-testid="nav-user" />,
}));

vi.mock('@/components/app-logo', () => ({
    default: () => <div data-testid="app-logo" />,
}));

vi.mock('@/components/ui/sidebar', () => ({
    Sidebar: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SidebarContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SidebarFooter: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SidebarHeader: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SidebarMenu: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SidebarMenuButton: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    SidebarMenuItem: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

describe('AppSidebar', () => {
    it('shows a public access section with landing page and training paths links', () => {
        render(<AppSidebar />);

        expect(screen.getByText('Public Access')).toBeInTheDocument();
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
        expect(screen.getByText('Training Paths')).toBeInTheDocument();
    });
});
