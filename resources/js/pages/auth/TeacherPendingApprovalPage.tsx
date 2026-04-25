import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function TeacherPendingApprovalPage() {
    const handleExplore = () => {
        router.visit('/trainingPaths');
    };

    return (
        <>
            <Head title="Pending Approval - IoT-REAP" />

            <div className="relative flex min-h-dvh items-center justify-center px-8 sm:px-0">
                {/* Right panel - form content */}
                <div className="mx-auto w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card className="border-0 shadow-none">
                            <CardHeader className="space-y-2 pb-6">
                                <CardTitle className="text-2xl">
                                    Welcome to IoT-REAP
                                </CardTitle>
                                <CardDescription>
                                    Your account is pending admin approval
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Status message */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="rounded-lg border border-warning/20 bg-warning/5 p-4"
                                >
                                    <div className="flex gap-3">
                                        <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
                                        <div className="text-sm">
                                            <p className="mb-1 font-semibold text-foreground">
                                                Awaiting Review
                                            </p>
                                            <p className="text-muted-foreground">
                                                An administrator will review
                                                your application and you'll be
                                                notified via email once your
                                                account is approved.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* What you can do */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h3 className="mb-3 text-sm font-semibold">
                                        In the meantime:
                                    </h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            Explore learning resources and
                                            training paths
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            Browse courses and educational
                                            content
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            Familiarize yourself with the
                                            platform
                                        </li>
                                    </ul>
                                </motion.div>

                                {/* Actions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-3"
                                >
                                    <Button
                                        onClick={handleExplore}
                                        className="h-11 w-full gap-2 bg-primary hover:bg-primary/90"
                                    >
                                        Explore Learning Resources
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </motion.div>

                                {/* Support link */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="pt-2 text-center"
                                >
                                    <p className="text-xs text-muted-foreground">
                                        Questions?{' '}
                                        <a
                                            href="mailto:support@iot-reap.edu"
                                            className="font-semibold text-primary hover:underline"
                                        >
                                            Contact Support
                                        </a>
                                    </p>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
