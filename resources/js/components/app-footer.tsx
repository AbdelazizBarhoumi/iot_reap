import { Link, usePage } from '@inertiajs/react';
import { Server } from 'lucide-react';
import { dashboard } from '@/routes';
/**
 * Global footer for authenticated app pages.
 * Shows contextual links based on user role.
 */
export function AppFooter() {
    const { auth } = usePage().props;
    const isAuthenticated = !!auth.user;
    const role = auth.user?.role;
    const isTeacher = role === 'teacher' || role === 'admin';
    const isEngineer = role === 'engineer' || role === 'admin';
    return (
        <footer className="mt-auto border-t border-border bg-card/50 py-6">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Server className="h-4 w-4 text-primary" />
                    <span>IoT-REAP</span>
                </div>
                <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Link
                        href="/courses"
                        className="transition-colors hover:text-foreground"
                    >
                        Courses
                    </Link>
                    {isAuthenticated && (
                        <Link
                            href="/my-courses"
                            className="transition-colors hover:text-foreground"
                        >
                            My Learning
                        </Link>
                    )}
                    {isTeacher && (
                        <Link
                            href="/teaching"
                            className="transition-colors hover:text-foreground"
                        >
                            Teaching
                        </Link>
                    )}
                    {isEngineer && (
                        <Link
                            href="/sessions"
                            className="transition-colors hover:text-foreground"
                        >
                            Sessions
                        </Link>
                    )}
                    {isAuthenticated && (
                        <Link
                            href={dashboard()}
                            className="transition-colors hover:text-foreground"
                        >
                            Dashboard
                        </Link>
                    )}
                </nav>
                <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} IoT-REAP
                </p>
            </div>
        </footer>
    );
}


