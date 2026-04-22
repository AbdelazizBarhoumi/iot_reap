import { Head, Link, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    GraduationCap,
    Monitor,
    Server,
    Shield,
    Terminal,
    Users,
    Zap,
    Clock,
    Home,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';
import heroBg from '@/assets/hero-bg.jpg';
import TrainingPathCard from '@/components/TrainingPaths/TrainingPathCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, login, register, logout } from '@/routes';
import admin from '@/routes/admin';
import teaching from '@/routes/teaching';
import trainingPaths from '@/routes/trainingPaths';
import type { TrainingPath } from '@/types/TrainingPath.types';
const features = [
    {
        icon: Monitor,
        title: 'Virtual Lab Environments',
        description:
            'Access pre-configured industrial lab VMs via browser. No local setup required — just click and connect.',
    },
    {
        icon: BookOpen,
        title: 'Hands-On Operations Training',
        description:
            'Structured industrial paths with hands-on labs. Learn by doing with real factory scenarios.',
    },
    {
        icon: Terminal,
        title: 'Remote Industrial Control',
        description:
            'Monitor and coordinate equipment remotely through secure tunnels and telemetry streams.',
    },
    {
        icon: Shield,
        title: 'OT Security and Compliance',
        description:
            'Role-based access, audit logging, and industrial security controls for production environments.',
    },
];
const stats = [
    { icon: Server, label: 'Active Labs', value: '50+' },
    { icon: BookOpen, label: 'Training Paths', value: '200+' },
    { icon: Users, label: 'Operators', value: '10,000+' },
    { icon: Clock, label: 'Uptime', value: '99.9%' },
];
interface Props {
    canRegister?: boolean;
    featuredTrainingPaths?: TrainingPath[]; // passed from backend
}
export default function Welcome({
    canRegister = true,
    featuredTrainingPaths = [],
}: Props) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const operationsDashboardUrl =
        auth.user?.role === 'admin'
            ? admin.dashboard.url()
            : dashboard().url;
    // fallback for legacy dev mode: if no trainingPaths provided, don't crash
    const showcase = featuredTrainingPaths || [];
    return (
        <>
            <Head title="IoT-REAP | Industry 4.0 Academy" />
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-xl font-bold text-foreground"
                        >
                            <Server className="h-6 w-6 text-primary" />
                            IoT-REAP
                        </Link>
                        <nav className="hidden items-center gap-6 md:flex">
                            <Link
                                href={trainingPaths.index.url()}
                                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                            >
                                Training Paths
                            </Link>
                            {auth.user && (
                                <Button asChild>
                                    <Link href={operationsDashboardUrl}>
                                        <Home className="mr-2 h-4 w-4" />{' '}
                                        Operations Dashboard
                                    </Link>
                                </Button>
                            )}
                            {auth.user ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="ml-2"
                                >
                                    <Link
                                        href={logout()}
                                        as="button"
                                        onClick={() => router.flushAll()}
                                    >
                                        Sign out
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button size="sm" variant="ghost" asChild>
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button size="sm" asChild>
                                            <Link href={register()}>
                                                Get Started
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                        {/* Mobile nav trigger */}
                        <div className="flex items-center gap-2 md:hidden">
                            <button
                                className="rounded-md p-2 text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                onClick={() => setMobileOpen(!mobileOpen)}
                                aria-label={
                                    mobileOpen
                                        ? 'Close navigation menu'
                                        : 'Open navigation menu'
                                }
                                aria-expanded={mobileOpen}
                            >
                                {mobileOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                    <AnimatePresence>
                        {mobileOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 md:hidden"
                            >
                                <div className="container flex flex-col gap-3 py-4">
                                    <Link
                                        href={trainingPaths.index.url()}
                                        className="text-sm font-medium text-muted-foreground hover:text-primary"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Training Paths
                                    </Link>
                                    {auth.user && (
                                        <Link
                                            href={operationsDashboardUrl}
                                            className="text-sm font-medium text-muted-foreground hover:text-primary"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Operations Dashboard
                                        </Link>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        {auth.user ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                asChild
                                            >
                                                <Link
                                                    href={logout()}
                                                    as="button"
                                                    onClick={() => {
                                                        setMobileOpen(false);
                                                        router.flushAll();
                                                    }}
                                                >
                                                    Sign out
                                                </Link>
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                                                    asChild
                                                >
                                                    <Link
                                                        href={login()}
                                                        onClick={() =>
                                                            setMobileOpen(false)
                                                        }
                                                    >
                                                        Log in
                                                    </Link>
                                                </Button>
                                                {canRegister && (
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-primary text-white hover:bg-primary/90"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={register()}
                                                            onClick={() =>
                                                                setMobileOpen(
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            Sign up
                                                        </Link>
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>
                {/* Hero Section */}
                <section className="bg-hero-gradient relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <img
                            src={heroBg}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="relative z-10 container py-24 md:py-32">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-3xl"
                        >
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                                <Zap className="h-4 w-4" />
                                Industry 4.0 Remote Operations
                            </div>
                            <h1 className="text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.02] font-bold text-white">
                                Industrial Remote{' '}
                                <span className="text-primary">
                                    Operations Platform
                                </span>
                            </h1>
                            <p className="mt-6 max-w-[min(46rem,100%)] text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-white/80">
                                IoT-REAP provides secure access to virtual labs,
                                production dashboards, and industrial equipment.
                                Built for Industry 4.0 training and operations.
                            </p>
                            <div className="mt-8 flex flex-col flex-wrap gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="bg-primary text-white hover:bg-primary/90"
                                    asChild
                                >
                                    <Link href={trainingPaths.index.url()}>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Explore Training Paths
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/20 hover:bg-white/10"
                                    asChild
                                >
                                    <Link
                                        href={
                                            auth.user
                                                ? operationsDashboardUrl
                                                : login().url
                                        }
                                    >
                                        <Monitor className="mr-2 h-4 w-4" />
                                        {auth.user
                                            ? 'Open Lab Console'
                                            : 'Sign In to Labs'}
                                    </Link>
                                </Button>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
                                <Terminal className="h-4 w-4 text-primary" />
                                <span>
                                    Browser-based access — no VPN or client
                                    installation required
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </section>
                {/* Stats Section */}
                <section className="border-b border-border bg-card">
                    <div className="container grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="text-center"
                            >
                                <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
                                <p className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-foreground">
                                    {stat.value}
                                </p>
                                <p className="text-[clamp(0.85rem,1.2vw,1rem)] text-muted-foreground">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>
                {/* Features Section */}
                <section className="bg-background py-20">
                    <div className="container">
                        <div className="mb-12 text-center">
                            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-foreground">
                                Platform Capabilities
                            </h2>
                            <p className="mx-auto mt-2 max-w-[min(42rem,100%)] text-[clamp(0.95rem,1.5vw,1.1rem)] text-muted-foreground">
                                Everything you need for connected industrial
                                training and operations
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                >
                                    <Card className="h-full transition-shadow hover:shadow-lg">
                                        <CardContent className="p-6">
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                                <feature.icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="mb-2 text-[clamp(1.05rem,1.4vw,1.25rem)] font-semibold text-foreground">
                                                {feature.title}
                                            </h3>
                                            <p className="text-[clamp(0.95rem,1.3vw,1rem)] text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* Featured Training Paths Section */}
                <section className="bg-muted/30 py-20">
                    <div className="container">
                        <div className="mb-10 flex items-end justify-between">
                            <div>
                                <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-foreground">
                                    Featured Training Paths
                                </h2>
                                <p className="mt-2 text-[clamp(0.95rem,1.4vw,1.05rem)] text-muted-foreground">
                                    Hands-on paths with virtual machine labs
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                className="text-primary"
                                asChild
                            >
                                <Link href={trainingPaths.index.url()}>
                                    View all{' '}
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {showcase.slice(0, 3).map((trainingPath, i) => (
                                <TrainingPathCard
                                    key={trainingPath.id}
                                    trainingPath={trainingPath}
                                    index={i}
                                />
                            ))}
                        </div>
                    </div>
                </section>
                {/* CTA Section */}
                <section className="bg-hero-gradient py-20">
                    <div className="container text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-white">
                                Ready to modernize your operations?
                            </h2>
                            <p className="mx-auto mt-4 max-w-[min(36rem,100%)] text-[clamp(1rem,1.6vw,1.15rem)] text-white/75">
                                Join engineers, operators, and automation teams
                                building the next generation of industrial
                                systems.
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="bg-primary text-white hover:bg-primary/90"
                                    asChild
                                >
                                    <Link href={trainingPaths.index.url()}>
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        Explore Paths
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/20 hover:bg-white/10"
                                    asChild
                                >
                                    <Link href={teaching.index.url()}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Create a Path
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </section>
                {/* Footer */}
                <footer className="border-t border-border bg-card py-10">
                    <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                            <Server className="h-5 w-5 text-primary" />
                            IoT-REAP
                        </div>
                        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                            <Link
                                href={trainingPaths.index.url()}
                                className="transition-colors hover:text-foreground"
                            >
                                Training Paths
                            </Link>
                            <Link
                                href={teaching.index.url()}
                                className="transition-colors hover:text-foreground"
                            >
                                Content Studio
                            </Link>
                            {auth.user && (
                                <Link
                                    href={operationsDashboardUrl}
                                    className="transition-colors hover:text-foreground"
                                >
                                    Dashboard
                                </Link>
                            )}
                        </nav>
                        <p className="text-sm text-muted-foreground">
                            © 2026 IoT-REAP. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

