import { Link } from '@inertiajs/react';
import { Server } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="bg-hero-gradient flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
                <Card className="border-0 shadow-2xl">
                    <CardContent className="p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-4">
                                <Link
                                    href={home()}
                                    className="flex flex-col items-center gap-3 font-medium"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                                        <Server className="h-7 w-7 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-foreground">
                                        IoT-REAP
                                    </span>
                                </Link>
                                <div className="space-y-2 text-center">
                                    <h1 className="font-heading text-2xl font-semibold text-foreground">
                                        {title}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                </div>
                            </div>
                            {children}
                        </div>
                    </CardContent>
                </Card>
                <p className="mt-6 text-center text-xs text-white/60">
                    Remote Engineering Access Platform for Industry 4.0
                </p>
            </div>
        </div>
    );
}

