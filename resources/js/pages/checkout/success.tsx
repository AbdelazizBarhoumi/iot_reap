/**
 * Checkout Success Page
 * Displayed after successful payment completion.
 */
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import trainingPaths from '@/routes/trainingPaths';
import type { Payment } from '@/types/payment.types';
interface SuccessPageProps {
    payment: Payment | null;
}
export default function SuccessPage({ payment }: SuccessPageProps) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Checkout', href: '/checkout/success' },
                { title: 'Success', href: '/checkout/success' },
            ]}
        >
            <Head title="Payment Successful" />
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">
                            Payment Successful!
                        </CardTitle>
                        <CardDescription>
                            {payment
                                ? `You are now enrolled in "${payment.trainingPath.title}"`
                                : 'Your payment has been processed successfully.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {payment && (
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="flex items-center gap-4">
                                    {payment.trainingPath.thumbnail_url ? (
                                        <img
                                            src={payment.trainingPath.thumbnail_url}
                                            alt={payment.trainingPath.title}
                                            className="h-16 w-16 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                                            <BookOpen className="h-8 w-8 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1 text-left">
                                        <p className="font-medium">
                                            {payment.trainingPath.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.formatted_amount}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            {payment && (
                                <Button asChild className="w-full">
                                    <Link
                                        href={`/trainingPaths/${payment.trainingPath.id}`}
                                    >
                                        Start Training
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                asChild
                                className="w-full"
                            >
                                <Link href={trainingPaths.my.url()}>
                                    Go to My Training
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

