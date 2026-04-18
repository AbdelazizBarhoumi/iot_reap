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
} from 'lucide-react';
import { useState } from 'react';
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
    const [isIssuing, setIsIssuing] = useState(false);
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const handleClaim = async () => {
        setIsIssuing(true);
        try {
            const cert = await certificatesApi.issueCertificate(trainingPathId);
            setCertificate(cert);
            toast.success('Certificate issued! 🎉');
            onClaimed?.(cert);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to issue certificate';
            toast.error(message);
        } finally {
            setIsIssuing(false);
        }
    };
    const handleDownload = () => {
        if (certificate) {
            window.open(
                certificatesApi.getCertificateDownloadUrl(certificate.hash),
                '_blank',
            );
        }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {certificate ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Certification Ready!
                            </>
                        ) : (
                            <>
                                <PartyPopper className="h-5 w-5 text-yellow-500" />
                                Congratulations!
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {certificate
                            ? 'Your certificate has been issued.'
                            : `You've completed "${trainingPathTitle}"`}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                    {certificate ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-4 text-center"
                        >
                            <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                                <Award className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your certificate is being generated. You can
                                download it once it's ready.
                            </p>
                            <div className="flex justify-center gap-2">
                                <Button
                                    onClick={handleDownload}
                                    disabled={!certificate.has_pdf}
                                >
                                    {certificate.has_pdf ? (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download PDF
                                        </>
                                    ) : (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-6 text-center">
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
                                <p className="text-lg font-medium text-foreground">
                                    You've earned a certification!
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Claim your certificate of completion to
                                    showcase your achievement.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleClaim}
                                disabled={isIssuing}
                                className="w-full"
                            >
                                {isIssuing ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Award className="mr-2 h-4 w-4" />
                                )}
                                Claim Certification
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}


