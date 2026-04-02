/**
 * Certificate Verification Page
 * Public page for verifying certificate authenticity.
 */
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Award,
    CheckCircle,
    XCircle,
    Calendar,
    User,
    BookOpen,
    Download,
    Share2,
    ExternalLink,
} from 'lucide-react';
import { certificatesApi } from '@/api/certificates.api';
import type { Certificate } from '@/api/certificates.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
interface VerifyPageProps {
    valid: boolean;
    certificate: Certificate | null;
}
export default function VerifyPage({ valid, certificate }: VerifyPageProps) {
    const handleDownload = () => {
        if (certificate) {
            window.open(
                certificatesApi.getCertificateDownloadUrl(certificate.hash),
                '_blank',
            );
        }
    };
    const handleShare = async () => {
        if (navigator.share && certificate) {
            try {
                await navigator.share({
                    title: `Certificate of Completion - ${certificate.course?.title}`,
                    text: `${certificate.user?.name} completed ${certificate.course?.title}`,
                    url: window.location.href,
                });
            } catch {
                // Fallback to copy link
                await navigator.clipboard.writeText(window.location.href);
            }
        }
    };
    return (
        <>
            <Head
                title={valid ? 'Certificate Verified' : 'Certificate Not Found'}
            />
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
                <div className="container max-w-2xl py-12">
                    {/* Logo */}
                    <div className="mb-12 flex items-center justify-center gap-2">
                        <Award className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-foreground">
                            IoT-REAP
                        </span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="overflow-hidden">
                            {/* Status header */}
                            <div
                                className={`p-6 ${
                                    valid
                                        ? 'bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent'
                                        : 'bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`rounded-full p-3 ${
                                            valid
                                                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                                : 'bg-red-500/20 text-red-600 dark:text-red-400'
                                        }`}
                                    >
                                        {valid ? (
                                            <CheckCircle className="h-8 w-8" />
                                        ) : (
                                            <XCircle className="h-8 w-8" />
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-foreground">
                                            {valid
                                                ? 'Certificate Verified'
                                                : 'Invalid Certificate'}
                                        </h1>
                                        <p className="text-muted-foreground">
                                            {valid
                                                ? 'This certificate is authentic and valid.'
                                                : 'This certificate could not be verified.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {valid && certificate ? (
                                <CardContent className="space-y-6 p-6">
                                    {/* Certificate details */}
                                    <div className="space-y-4">
                                        {/* Recipient */}
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Awarded to
                                                </p>
                                                <p className="text-lg font-semibold text-foreground">
                                                    {certificate.user?.name ||
                                                        'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Course */}
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2">
                                                <BookOpen className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    For completing
                                                </p>
                                                <p className="text-lg font-semibold text-foreground">
                                                    {certificate.course
                                                        ?.title ||
                                                        'Unknown Course'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Date */}
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-primary/10 p-2">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Issued on
                                                </p>
                                                <p className="text-lg font-semibold text-foreground">
                                                    {new Date(
                                                        certificate.issued_at,
                                                    ).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex gap-3 border-t pt-4">
                                        {certificate.has_pdf && (
                                            <Button
                                                onClick={handleDownload}
                                                className="flex-1"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download PDF
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Share
                                        </Button>
                                    </div>
                                    {/* Verification ID */}
                                    <div className="border-t pt-4">
                                        <p className="text-center text-xs text-muted-foreground">
                                            Certificate ID:{' '}
                                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                                {certificate.hash.slice(0, 16)}
                                                ...
                                            </code>
                                        </p>
                                    </div>
                                </CardContent>
                            ) : (
                                <CardContent className="p-6">
                                    <p className="text-center text-muted-foreground">
                                        The certificate you're looking for
                                        doesn't exist or has been revoked.
                                        Please check the URL and try again.
                                    </p>
                                    <div className="mt-6 flex justify-center">
                                        <Button variant="outline" asChild>
                                            <a href="/">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Go to Homepage
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </motion.div>
                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Certificates are issued by IoT-REAP upon successful
                        course completion.
                    </p>
                </div>
            </div>
        </>
    );
}

