/**
 * My Certificates Page
 * Shows all earned certificates for the user.
 */
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Award,
    Download,
    ExternalLink,
    Search,
    Calendar,
    SearchX,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { certificatesApi } from '@/api/certificates.api';
import type { Certificate } from '@/api/certificates.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface PageProps {
    certificates: Certificate[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Training', href: '/my-trainingPaths' },
    { title: 'Certificates', href: '/certificates' },
];

export default function CertificatesIndex({ certificates }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCertificates = useMemo(() => {
        return certificates.filter((cert) =>
            cert.trainingPath?.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
        );
    }, [certificates, searchQuery]);

    const handleDownload = (cert: Certificate) => {
        window.open(
            certificatesApi.getCertificateDownloadUrl(cert.hash),
            '_blank',
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Certificates" />

            <div className="min-h-screen py-8">
                <div className="container">
                    {/* Header */}
                    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-foreground">
                                My Certificates
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                View and download your earned certificates of
                                completion
                            </p>
                        </div>

                        <div className="relative w-full max-w-sm">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search certificates..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {certificates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Award className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold">
                                No certificates yet
                            </h2>
                            <p className="mt-2 max-w-sm text-muted-foreground">
                                Complete your first training path to earn a
                                certificate of completion!
                            </p>
                            <Button className="mt-6" asChild>
                                <Link href="/trainingPaths">
                                    Browse Training Paths
                                </Link>
                            </Button>
                        </div>
                    ) : filteredCertificates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <SearchX className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h2 className="text-lg font-semibold">
                                No results found
                            </h2>
                            <p className="mt-1 text-muted-foreground">
                                Try adjusting your search query.
                            </p>
                            <Button
                                variant="link"
                                onClick={() => setSearchQuery('')}
                                className="mt-2"
                            >
                                Clear search
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredCertificates.map((cert, i) => (
                                <motion.div
                                    key={cert.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Card className="group flex h-full flex-col overflow-hidden border-border transition-all hover:shadow-lg">
                                        <div className="relative aspect-video overflow-hidden bg-muted">
                                            {cert.trainingPath?.thumbnail ? (
                                                <img
                                                    src={
                                                        cert.trainingPath
                                                            .thumbnail
                                                    }
                                                    alt={
                                                        cert.trainingPath.title
                                                    }
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                    <Award className="h-12 w-12 text-primary/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 transition-opacity group-hover:opacity-40" />
                                            <div className="absolute top-3 right-3">
                                                <Badge className="bg-primary text-white">
                                                    Verified
                                                </Badge>
                                            </div>
                                        </div>

                                        <CardContent className="flex-1 p-5">
                                            <h3 className="line-clamp-2 font-heading text-lg leading-tight font-bold text-foreground transition-colors group-hover:text-primary">
                                                {cert.trainingPath?.title}
                                            </h3>

                                            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        Issued on{' '}
                                                        {new Date(
                                                            cert.issued_at,
                                                        ).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-primary" />
                                                    <span className="truncate">
                                                        ID:{' '}
                                                        {cert.hash.slice(0, 16)}
                                                        ...
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="grid grid-cols-2 gap-2 p-5 pt-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() =>
                                                    handleDownload(cert)
                                                }
                                                disabled={!cert.has_pdf}
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full"
                                                asChild
                                            >
                                                <Link
                                                    href={cert.verification_url}
                                                >
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Verify
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
