/**
 * CertificateCard - Display a certificate with download option.
 */
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import type { Certificate } from '@/api/certificates.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
interface CertificateCardProps {
    certificate: Certificate;
    onDownload?: () => void;
    onViewTrainingPath?: () => void;
    isDownloading?: boolean;
    className?: string;
}
export function CertificateCard({
    certificate,
    onDownload,
    onViewTrainingPath,
    isDownloading = false,
    className,
}: CertificateCardProps) {
    const issuedDate = new Date(certificate.issued_at);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Card className={cn('group overflow-hidden', className)}>
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6">
                    <div className="absolute top-4 right-4">
                        <Badge
                            variant="secondary"
                            className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                        >
                            <Award className="mr-1 h-3 w-3" />
                            Certified
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                            <Award className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="line-clamp-2 font-semibold text-foreground">
                                {certificate.trainingPath?.title ||
                                    'Industrial Certification'}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                    Issued{' '}
                                    {issuedDate.toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <CardContent className="p-4">
                    <div className="flex gap-2">
                        {certificate.has_pdf ? (
                            <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={onDownload}
                                disabled={isDownloading}
                            >
                                {isDownloading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                Download PDF
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                disabled
                            >
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </Button>
                        )}
                        {onViewTrainingPath && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onViewTrainingPath}
                            >
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {/* Verification link */}
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        Verify at{' '}
                        <a
                            href={certificate.verification_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            {certificate.verification_url
                                .replace(/^https?:\/\//, '')
                                .slice(0, 40)}
                            ...
                        </a>
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}


