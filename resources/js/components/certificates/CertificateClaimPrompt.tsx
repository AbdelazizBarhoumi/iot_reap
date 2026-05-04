/**
 * CertificateClaimPrompt - Prompt to claim certificate after trainingPath completion.
 */
import { motion } from 'framer-motion';
import {
    Award,
    PartyPopper,
    Download,
    Loader2,
    CheckCircle,
    ExternalLink,
    Copy,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { Certificate } from '@/api/certificates.api';
import { certificatesApi } from '@/api/certificates.api';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Status =
    | 'idle'
    | 'checking'
    | 'can_claim'
    | 'issuing'
    | 'issued'
    | 'ready';

interface CertificateClaimPromptProps {
    trainingPathId: number;
    trainingPathTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClaimed?: (certificate: Certificate) => void;
}

export function CertificateClaimPrompt({
    trainingPathId,
    trainingPathTitle,
    open,
    onOpenChange,
    onClaimed,
}: CertificateClaimPromptProps) {
    const [status, setStatus] = useState<Status>('idle');
    const [certificate, setCertificate] = useState<Certificate | null>(null);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        const check = async () => {
            setCertificate(null);
            setStatus('checking');

            try {
                const res =
                    await certificatesApi.checkCertificate(trainingPathId);

                if (cancelled) return;

                if (res.has_certificate && res.data) {
                    setCertificate(res.data);
                    setStatus(res.data.has_pdf ? 'ready' : 'issued');
                } else {
                    setStatus('can_claim');
                }
            } catch (e) {
                console.error(e);
                if (!cancelled) setStatus('can_claim');
            }
        };

        check();

        return () => {
            cancelled = true;
        };
    }, [open, trainingPathId]);

    useEffect(() => {
        if (!open || status !== 'issued' || !certificate) {
            return;
        }

        let cancelled = false;

        const timer = window.setInterval(async () => {
            try {
                const res =
                    await certificatesApi.checkCertificate(trainingPathId);

                if (cancelled || !res.has_certificate || !res.data) {
                    return;
                }

                setCertificate(res.data);

                if (res.data.has_pdf) {
                    setStatus('ready');
                }
            } catch (error) {
                console.error(error);
            }
        }, 4000);

        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [certificate, open, status, trainingPathId]);

    const handleClaim = async () => {
        setStatus('issuing');

        try {
            const cert = await certificatesApi.issueCertificate(trainingPathId);
            setCertificate(cert);

            const newStatus = cert.has_pdf ? 'ready' : 'issued';
            setStatus(newStatus);

            toast.success('Certificate issued');
            onClaimed?.(cert);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to issue certificate';
            toast.error(message);
            setStatus('can_claim');
        }
    };

    const handleDownload = () => {
        if (!certificate) return;

        window.open(
            certificatesApi.getCertificateDownloadUrl(certificate.hash),
            '_blank',
        );
    };

    const isBusy = status === 'checking' || status === 'issuing';
    const verificationUrl = certificate?.verification_url ?? null;
    const certificateHash = certificate?.hash ?? null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {status === 'ready' ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Certificate Ready
                            </>
                        ) : status === 'issued' ? (
                            <>
                                <Award className="h-5 w-5 text-green-500" />
                                Certificate Issued
                            </>
                        ) : (
                            <>
                                <PartyPopper className="h-5 w-5 text-yellow-500" />
                                Congratulations
                            </>
                        )}
                    </DialogTitle>

                    <DialogDescription>
                        {status === 'can_claim'
                            ? `You've completed "${trainingPathTitle}"`
                            : status === 'checking'
                              ? 'Checking certificate...'
                              : 'Your certificate status'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-6 text-center">
                    {(status === 'issued' || status === 'ready') &&
                    certificate ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                                <Award className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>

                            <p className="text-sm text-muted-foreground">
                                {status === 'ready'
                                    ? 'Your certificate is ready to download.'
                                    : 'Your certificate exists, but the PDF is still being prepared. We will keep checking automatically.'}
                            </p>

                            <div className="flex flex-wrap justify-center gap-2">
                                <Button
                                    onClick={handleDownload}
                                    disabled={!certificate?.has_pdf}
                                >
                                    {certificate?.has_pdf ? (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </>
                                    ) : (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={async () => {
                                        if (!certificateHash) {
                                            return;
                                        }

                                        try {
                                            await navigator.clipboard.writeText(
                                                certificateHash,
                                            );
                                            toast.success(
                                                'Certificate hash copied to clipboard',
                                            );
                                        } catch (error) {
                                            console.error(error);
                                            toast.error(
                                                'Failed to copy certificate hash',
                                            );
                                        }
                                    }}
                                >
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Hash
                                </Button>
                                {verificationUrl && (
                                    <Button variant="outline" asChild>
                                        <a
                                            href={verificationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Verify
                                        </a>
                                    </Button>
                                )}
                                <Button variant="outline" asChild>
                                    <a href="/certificates">
                                        <Award className="mr-2 h-4 w-4" />
                                        My Certificates
                                    </a>
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 10,
                                }}
                                className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-4"
                            >
                                <Award className="h-12 w-12 text-white" />
                            </motion.div>

                            <div>
                                <p className="text-lg font-medium">
                                    {status === 'can_claim'
                                        ? 'You earned a certificate'
                                        : 'Processing'}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {status === 'can_claim'
                                        ? 'Claim it now'
                                        : 'Please wait'}
                                </p>
                            </div>

                            <Button
                                size="lg"
                                onClick={handleClaim}
                                disabled={isBusy || status !== 'can_claim'}
                                className="w-full"
                            >
                                {isBusy ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Award className="mr-2 h-4 w-4" />
                                )}
                                {status === 'checking'
                                    ? 'Checking...'
                                    : status === 'issuing'
                                      ? 'Issuing...'
                                      : 'Claim Certificate'}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
