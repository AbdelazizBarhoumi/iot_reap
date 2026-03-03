import { Link } from '@inertiajs/react';
import { Server, Terminal, Monitor, Shield } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid min-h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left panel - branding */}
            <div className="relative hidden h-full flex-col bg-hero-gradient p-10 text-white lg:flex">
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-3 text-lg font-medium"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <Server className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">IoT-REAP</span>
                </Link>
                
                <div className="relative z-20 mt-auto">
                    <h2 className="text-3xl font-bold leading-tight">
                        Remote Engineering
                        <span className="block text-primary">Access Platform</span>
                    </h2>
                    <p className="mt-4 text-white/70">
                        Secure remote access to virtual machines, industrial equipment,
                        and hands-on learning labs for Industry 4.0.
                    </p>
                    <div className="mt-8 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-sm text-white/80">
                            <Monitor className="h-5 w-5 text-primary" />
                            <span>Browser-based VM access</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/80">
                            <Terminal className="h-5 w-5 text-primary" />
                            <span>RDP, VNC, SSH protocols</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/80">
                            <Shield className="h-5 w-5 text-primary" />
                            <span>Enterprise-grade security</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right panel - form */}
            <div className="flex h-full w-full items-center justify-center bg-background lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-2 lg:hidden"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <Server className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">IoT-REAP</span>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
