/**
 * TrainingPath Status Banner Component
 * Displays status-aware banners for trainingPaths in different states
 */
import { AlertCircle, Archive, Clock, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { TrainingPathStatus } from '@/types/TrainingPath.types';
interface TrainingPathStatusBannerProps {
    status: TrainingPathStatus;
    adminFeedback?: string | null;
    submittedAt?: string;
}
export function TrainingPathStatusBanner({
    status,
    adminFeedback,
    submittedAt,
}: TrainingPathStatusBannerProps) {
    if (status === 'approved') {
        return null; // No banner needed for approved trainingPaths
    }
    const bannerConfig = {
        draft: {
            icon: AlertCircle,
            variant: 'default' as const,
            title: 'Draft',
            description:
                'This trainingPath is not yet published. Complete all sections and submit for review when ready.',
            bgClass:
                'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900',
            iconClass: 'text-blue-600 dark:text-blue-400',
        },
        pending_review: {
            icon: Clock,
            variant: 'default' as const,
            title: 'Pending Admin Review',
            description: submittedAt
                ? `Submitted on ${new Date(submittedAt).toLocaleDateString()}. An administrator will review your trainingPath shortly.`
                : 'An administrator will review your trainingPath shortly.',
            bgClass:
                'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900',
            iconClass: 'text-yellow-600 dark:text-yellow-400',
        },
        rejected: {
            icon: XCircle,
            variant: 'destructive' as const,
            title: 'TrainingPath Rejected',
            description:
                'Your trainingPath needs revisions before it can be approved. Please review the feedback below and resubmit.',
            bgClass:
                'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900',
            iconClass: 'text-red-600 dark:text-red-400',
        },
        archived: {
            icon: Archive,
            variant: 'default' as const,
            title: 'Archived',
            description:
                'This trainingPath is archived and hidden from students. You can restore it at any time.',
            bgClass:
                'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800',
            iconClass: 'text-gray-600 dark:text-gray-400',
        },
    };
    const config = bannerConfig[status];
    if (!config) return null;
    const Icon = config.icon;
    return (
        <div className="mb-6">
            <Alert className={config.bgClass}>
                <Icon className={`h-5 w-5 ${config.iconClass}`} />
                <AlertTitle className="text-base font-semibold">
                    {config.title}
                </AlertTitle>
                <AlertDescription className="mt-2 text-sm">
                    {config.description}
                </AlertDescription>
            </Alert>
            {status === 'rejected' && adminFeedback && (
                <Alert className="mt-3 bg-muted/50">
                    <AlertTitle className="text-sm font-semibold">
                        Admin Feedback:
                    </AlertTitle>
                    <AlertDescription className="mt-2 text-sm whitespace-pre-wrap">
                        {adminFeedback}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
