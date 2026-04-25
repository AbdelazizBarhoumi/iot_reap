import { Link, usePage } from '@inertiajs/react';
import { Server } from 'lucide-react';
import { dashboard, terms, privacy } from '@/routes';
import sessions from '@/routes/sessions';
import teaching from '@/routes/teaching';
import trainingPaths from '@/routes/trainingPaths';
/**
 * Global footer for authenticated app pages.
 * Shows contextual links based on user role.
 */
export function AppFooter() {
    const { auth } = usePage().props;
    const isAuthenticated = !!auth.user;
    const role = auth.user?.role;
    const isTeacher =
        role === 'admin' ||
        (role === 'teacher' && !!auth.user?.teacher_approved_at);
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
                        href={trainingPaths.index.url()}
                        className="transition-colors hover:text-foreground"
                    >
                        Training Paths
                    </Link>
                    {isAuthenticated && (
                        <Link
                            href={trainingPaths.my.url()}
                            className="transition-colors hover:text-foreground"
                        >
                            My Training
                        </Link>
                    )}
                    {isTeacher && (
                        <Link
                            href={teaching.index.url()}
                            className="transition-colors hover:text-foreground"
                        >
                            Content Studio
                        </Link>
                    )}
                    {isEngineer && (
                        <Link
                            href={sessions.index.url()}
                            className="transition-colors hover:text-foreground"
                        >
                            Sessions
                        </Link>
                    )}
                    {isAuthenticated && (
                        <Link
                            href={dashboard().url}
                            className="transition-colors hover:text-foreground"
                        >
                            Dashboard
                        </Link>
                    )}
                    <span className="text-muted-foreground/30">•</span>
                    <Link
                        href={terms().url}
                        className="transition-colors hover:text-foreground"
                    >
                        Terms of Service
                    </Link>
                    <Link
                        href={privacy().url}
                        className="transition-colors hover:text-foreground"
                    >
                        Privacy Policy
                    </Link>
                </nav>
                <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} IoT-REAP
                </p>
            </div>
        </footer>
    );
}
