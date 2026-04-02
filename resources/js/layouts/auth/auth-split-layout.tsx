import { Link } from '@inertiajs/react';
import { motion, type Variants } from 'framer-motion';
import {
    Server,
    Terminal,
    Monitor,
    Shield,
    Cpu,
    Wifi,
    Zap,
} from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
const floatingAnimation: Variants = {
    initial: { y: 0 },
    animate: {
        y: [-10, 10, -10],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};
const pulseAnimation: Variants = {    initial: { scale: 1, opacity: 0.5 },
    animate: {
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};
const features = [
    { icon: Monitor, label: 'Browser-based VM access', delay: 0.1 },
    { icon: Terminal, label: 'RDP, VNC, SSH protocols', delay: 0.2 },
    { icon: Shield, label: 'Enterprise-grade security', delay: 0.3 },
    { icon: Cpu, label: 'Industrial IoT integration', delay: 0.4 },
];
export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid min-h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left panel - branding with animated background */}
            <div className="bg-hero-gradient relative hidden h-full flex-col overflow-hidden p-10 text-white lg:flex">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '50px 50px',
                        }}
                    />
                    {/* Floating icons */}
                    <motion.div
                        className="absolute top-20 right-20 text-white/10"
                        variants={floatingAnimation}
                        initial="initial"
                        animate="animate"
                    >
                        <Cpu className="h-24 w-24" />
                    </motion.div>
                    <motion.div
                        className="absolute right-32 bottom-32 text-white/10"
                        variants={floatingAnimation}
                        initial="initial"
                        animate="animate"
                        style={{ animationDelay: '2s' }}
                    >
                        <Wifi className="h-16 w-16" />
                    </motion.div>
                    <motion.div
                        className="absolute top-1/2 right-16 text-white/10"
                        variants={floatingAnimation}
                        initial="initial"
                        animate="animate"
                        style={{ animationDelay: '4s' }}
                    >
                        <Zap className="h-20 w-20" />
                    </motion.div>
                    {/* Glowing orbs */}
                    <motion.div
                        className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
                        variants={pulseAnimation}
                        initial="initial"
                        animate="animate"
                    />
                    <motion.div
                        className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
                        variants={pulseAnimation}
                        initial="initial"
                        animate="animate"
                        style={{ animationDelay: '1.5s' }}
                    />
                </div>
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center gap-3 text-lg font-medium"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
                            <Server className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">
                            IoT-REAP
                        </span>
                    </Link>
                </motion.div>
                {/* Main content */}
                <div className="relative z-20 mt-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <span className="mb-6 inline-block rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                            Industry 4.0 Platform
                        </span>
                        <h2 className="text-4xl leading-tight font-bold tracking-tight">
                            Remote Engineering
                            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                Access Platform
                            </span>
                        </h2>
                        <p className="mt-4 max-w-md text-lg text-white/70">
                            Secure remote access to virtual machines, industrial
                            equipment, and hands-on learning labs for the future
                            of manufacturing.
                        </p>
                    </motion.div>
                    {/* Features list */}
                    <div className="mt-10 flex flex-col gap-4">
                        {features.map((feature) => (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.4,
                                    delay: feature.delay + 0.4,
                                }}
                                className="group flex items-center gap-4"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/30">
                                    <feature.icon className="h-5 w-5 text-white transition-colors group-hover:text-primary" />
                                </div>
                                <span className="text-sm text-white/80 transition-colors group-hover:text-white">
                                    {feature.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
                {/* Bottom decoration */}
                <motion.div
                    className="relative z-20 mt-10 border-t border-white/10 pt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <p className="text-xs text-white/60">
                        Trusted by engineers and institutions worldwide
                    </p>
                </motion.div>
            </div>
            {/* Right panel - form */}
            <div className="flex h-full w-full items-center justify-center bg-background lg:p-8">
                <motion.div
                    className="mx-auto flex w-full flex-col justify-center space-y-6 px-4 sm:w-[400px] sm:px-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {/* Mobile logo */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-2 lg:hidden"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg">
                            <Server className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold">IoT-REAP</span>
                    </Link>
                    {/* Title section */}
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <motion.h1
                            className="text-2xl font-bold tracking-tight"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            {title}
                        </motion.h1>
                        <motion.p
                            className="text-sm text-balance text-muted-foreground"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            {description}
                        </motion.p>
                    </div>
                    {/* Form content */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

