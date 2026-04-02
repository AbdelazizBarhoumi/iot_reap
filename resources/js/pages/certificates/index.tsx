/**
 * My Certificates Page
 * Displays all certificates earned by the authenticated user.
 */
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Award,
    BookOpen,
    ArrowLeft,
    Loader2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as certificatesApi from '@/api/certificates.api';
import { CertificateCard } from '@/components/certificates/CertificateCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<
        certificatesApi.Certificate[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    // Fetch certificates on mount
    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                setLoading(true);
                const data = await certificatesApi.getCertificates();
                setCertificates(data);
                setError(null);
            } catch (e) {
                const message =
                    e instanceof Error ? e.message : 'Failed to load certificates';
                setError(message);
                toast.error('Failed to load certificates', { description: message });
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'My Certificates', href: '/certificates' },
        ],
        [],
    );

    const handleDownload = async (certificate: certificatesApi.Certificate) => {
        if (!downloadingId) {
            setDownloadingId(certificate.hash);
            try {
                const downloadUrl =
                    certificatesApi.getCertificateDownloadUrl(certificate.hash);
                window.open(downloadUrl, '_blank');
                toast.success('Downloading certificate...');
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Download failed';
                toast.error('Failed to download certificate', {
                    description: message,
                });
            } finally {
                setDownloadingId(null);
            }
        }
    };

    const handleViewCourse = (certificate: certificatesApi.Certificate) => {
        if (certificate.course?.id) {
            window.location.href = `/courses/${certificate.course.id}`;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Certificates" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-semibold text-foreground">
                            My Certificates
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View and share your earned certificates
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center rounded-lg border border-dashed py-16">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                Loading your certificates...
                            </p>
                        </div>
                    </div>
                ) : error ? (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-base text-destructive">
                                Error Loading Certificates
                            </CardTitle>
                            <CardDescription>{error}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                ) : certificates.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Award className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">
                                No Certificates Yet
                            </h3>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Complete courses to earn certificates and showcase your
                                achievements.
                            </p>
                            <Button asChild className="mt-6">
                                <Link href="/courses">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Browse Courses
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {certificates.map((cert, idx) => (
                            <motion.div
                                key={cert.hash}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <CertificateCard
                                    certificate={cert}
                                    onDownload={() => handleDownload(cert)}
                                    onViewCourse={() => handleViewCourse(cert)}
                                    isDownloading={downloadingId === cert.hash}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Info Card */}
                {certificates.length > 0 && (
                    <Card className="mt-8 bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Award className="h-5 w-5 text-primary" />
                                Share Your Success
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                You can download and share your certificates with employers,
                                colleagues, or on social media to showcase your achievements.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
