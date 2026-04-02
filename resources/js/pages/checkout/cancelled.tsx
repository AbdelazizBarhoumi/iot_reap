/**
 * Checkout Cancelled Page
 * Displayed when user cancels checkout.
 */
import { Head, Link } from '@inertiajs/react';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
interface CancelledPageProps {
    course: {
        id: number;
        title: string;
    } | null;
}
export default function CancelledPage({ course }: CancelledPageProps) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Checkout', href: '/checkout/cancelled' },
                { title: 'Cancelled', href: '/checkout/cancelled' },
            ]}
        >
            <Head title="Checkout Cancelled" />
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                            <XCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <CardTitle className="text-2xl">
                            Checkout Cancelled
                        </CardTitle>
                        <CardDescription>
                            Your payment was not processed. No charges have been
                            made.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                            If you experienced any issues during checkout,
                            please don't hesitate to contact our support team.
                        </p>
                        <div className="flex flex-col gap-3">
                            {course && (
                                <Button asChild className="w-full">
                                    <Link href={`/courses/${course.id}`}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Return to {course.title}
                                    </Link>
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                asChild
                                className="w-full"
                            >
                                <Link href="/courses">Browse Courses</Link>
                            </Button>
                            <Button variant="ghost" asChild className="w-full">
                                <a href="mailto:support@iot-reap.com">
                                    <HelpCircle className="mr-2 h-4 w-4" />
                                    Contact Support
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

