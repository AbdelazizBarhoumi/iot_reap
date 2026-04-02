import { Link } from '@inertiajs/react';
import { Server } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { home } from '@/routes';
export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="bg-hero-gradient flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link
                    href={home()}
                    className="flex items-center gap-2 self-center font-medium text-white"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                        <Server className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xl font-bold">IoT-REAP</span>
                </Link>
                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl border-0 shadow-2xl">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">
                            {children}
                        </CardContent>
                    </Card>
                </div>
                <p className="text-center text-xs text-white/60">
                    Remote Engineering Access Platform for Industry 4.0
                </p>
            </div>
        </div>
    );
}

