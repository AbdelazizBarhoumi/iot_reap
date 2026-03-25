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
        <footer className="border-t border-border bg-card/50 py-6 mt-auto">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Server className="h-4 w-4 text-primary" />
                    <span>IoT-REAP</span>
                </div>
                
                <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Link 
                        href="/courses" 
                        className="hover:text-foreground transition-colors"
                    >
                        Courses
                    </Link>
                    {isAuthenticated && (
                        <Link 
                            href="/my-courses" 
                            className="hover:text-foreground transition-colors"
                        >
                            My Learning
                        </Link>
                    )}
                    {isTeacher && (
                        <Link 
                            href="/teaching" 
                            className="hover:text-foreground transition-colors"
                        >
                            Teaching
                        </Link>
                    )}
                    {isEngineer && (
                        <Link 
                            href="/sessions" 
                            className="hover:text-foreground transition-colors"
                        >
                            Sessions
                        </Link>
                    )}
                    {isAuthenticated && (
                        <Link 
                            href={dashboard()} 
                            className="hover:text-foreground transition-colors"
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
