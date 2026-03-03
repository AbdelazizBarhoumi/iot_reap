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
import heroBg from "@/assets/hero-bg.jpg";
import CourseCard from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, login, register, logout } from '@/routes';
import type { Course } from '@/types/course.types';

const features = [
    {
        icon: Monitor,
        title: 'Virtual Machine Labs',
        description: 'Access pre-configured VMs via browser. No local setup required — just click and connect.',
    },
    {
        icon: BookOpen,
        title: 'Interactive Learning',
        description: 'Structured courses with hands-on labs. Learn by doing with real-world scenarios.',
    },
    {
        icon: Terminal,
        title: 'Remote Operations',
        description: 'Control industrial equipment remotely. RDP, VNC, and SSH access through secure tunnels.',
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'SSO integration, role-based access, and audit logging for compliance requirements.',
    },
];

const stats = [
    { icon: Server, label: 'Active VMs', value: '50+' },
    { icon: BookOpen, label: 'Courses', value: '200+' },
    { icon: Users, label: 'Students', value: '10,000+' },
    { icon: Clock, label: 'Uptime', value: '99.9%' },
];

interface Props {
    canRegister?: boolean;
    featuredCourses?: Course[]; // passed from backend
}

export default function Welcome({
    canRegister = true,
    featuredCourses = [],
}: Props) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    // fallback for legacy dev mode: if no courses provided, don't crash
    const showcase = featuredCourses || [];

    return (
        <>
            <Head title="IoT-REAP | Remote Engineering Access Platform" />
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
                    <div className="container flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground">
                            <Server className="h-6 w-6 text-primary" />
                            IoT-REAP
                        </Link>

                        <nav className="hidden items-center gap-6 md:flex">
                            <Link
                                href="/courses"
                                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                            >
                                Browse Courses
                            </Link>
                            <Link
                                href="/teaching"
                                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                            >
                                Teach
                            </Link>
                            <Link
                                href="/admin"
                                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                            >
                                Admin
                            </Link>
                            {auth.user && (
                                <Button asChild>
                                    <Link href={dashboard()}>
                                        <Home className="mr-2 h-4 w-4" /> Dashboard
                                    </Link>
                                </Button>
                            )}
                            {auth.user ? (
                                <Button variant="outline" size="sm" asChild className="ml-2">
                                    <Link href={logout()} as="button" onClick={() => router.flushAll()}>
                                        Sign out
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90" asChild>
                                        <Link
                                            href={login()}
                                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Log in
                                        </Link>
                                    </Button>
                                    {canRegister && (
                                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90" asChild>
                                            <Link href={register()}>Get Started</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>

                        {/* Mobile nav trigger */}
                        <div className="flex items-center gap-2 md:hidden">
                            <button
                                className="text-foreground"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {mobileOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t border-border bg-white/90 dark:bg-gray-900/90 md:hidden"
                            >
                                <div className="container flex flex-col gap-3 py-4">
                                    <Link
                                        href="/courses"
                                        className="text-sm font-medium text-muted-foreground hover:text-primary"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Browse Courses
                                    </Link>
                                    <Link
                                        href="/teaching"
                                        className="text-sm font-medium text-muted-foreground hover:text-primary"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Teach
                                    </Link>
                                    <Link
                                        href="/admin"
                                        className="text-sm font-medium text-muted-foreground hover:text-primary"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Admin
                                    </Link>
                                    {auth.user && (
                                        <Link
                                            href={dashboard()}
                                            className="text-sm font-medium text-muted-foreground hover:text-primary"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Dashboard
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
                                                <Link href={logout()} as="button" onClick={() => { setMobileOpen(false); router.flushAll(); }}>
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
                                                    <Link href={login()} onClick={() => setMobileOpen(false)}>
                                                        Log in
                                                    </Link>
                                                </Button>
                                                {canRegister && (
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-primary text-white hover:bg-primary/90"
                                                        asChild
                                                    >
                                                        <Link href={register()} onClick={() => setMobileOpen(false)}>
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
                <section className="relative overflow-hidden bg-hero-gradient">
                    <div className="absolute inset-0 opacity-10">
                        <img src={heroBg} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="container relative z-10 py-24 md:py-32">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-3xl"
                        >
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary mb-6">
                                <Zap className="h-4 w-4" />
                                Industry 4.0 Remote Operations
                            </div>
                            <h1 className="font-bold text-4xl leading-tight text-white md:text-6xl">
                                Remote Engineering{' '}
                                <span className="text-primary">Access Platform</span>
                            </h1>
                            <p className="mt-6 text-lg text-white/70 max-w-2xl">
                                IoT-REAP provides secure remote access to virtual machines, industrial equipment,
                                and hands-on learning labs. Built for Industry 4.0 education and operations.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Button size="lg" className="bg-primary text-white hover:bg-primary/90" asChild>
                                    <Link href="/courses">
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Explore Courses
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="border-white/20 text-secondery hover:bg-white/10" asChild>
                                    <Link href={auth.user ? dashboard() : login()}>
                                        <Monitor className="mr-2 h-4 w-4" />
                                        {auth.user ? 'Open VM Labs' : 'Sign In to Labs'}
                                    </Link>
                                </Button>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-white/60 text-sm">
                                <Terminal className="h-4 w-4 text-primary" />
                                <span>Browser-based access — no VPN or client installation required</span>
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
                                <stat.icon className="mx-auto h-6 w-6 text-primary mb-2" />
                                <p className="font-heading text-2xl font-bold text-foreground">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-background">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-foreground">Platform Capabilities</h2>
                            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                                Everything you need for remote engineering education and industrial operations
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
                                    <Card className="h-full hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                                <feature.icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Courses Section */}
                <section className="py-20 bg-muted/30">
                    <div className="container">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground">Featured Courses</h2>
                                <p className="mt-2 text-muted-foreground">Hands-on courses with virtual machine labs</p>
                            </div>
                            <Button variant="ghost" className="text-primary" asChild>
                                <Link href="/courses">
                                    View all <ArrowRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {showcase.slice(0, 3).map((course, i) => (
                                <CourseCard key={course.id} course={course} index={i} />
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
                            <h2 className="text-3xl font-bold text-white md:text-4xl">
                                Ready to start your journey?
                            </h2>
                            <p className="mt-4 text-white/70 max-w-md mx-auto">
                                Join thousands of learners and engineers building the next generation of industrial systems.
                            </p>
                            <div className="mt-8 flex justify-center gap-4 flex-wrap">
                                <Button size="lg" className="bg-primary text-white hover:bg-primary/90" asChild>
                                    <Link href="/courses">
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        Start Learning
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="border-white/20 text-secondery hover:bg-white/10" asChild>
                                    <Link href="/teaching">
                                        <Users className="mr-2 h-4 w-4" />
                                        Become an Instructor
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
                            <Link href="/courses" className="hover:text-foreground transition-colors">Courses</Link>
                            <Link href="/teaching" className="hover:text-foreground transition-colors">Teach</Link>
                            <Link href={dashboard()} className="hover:text-foreground transition-colors">Dashboard</Link>
                        </nav>
                        <p className="text-sm text-muted-foreground">© 2026 IoT-REAP. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
