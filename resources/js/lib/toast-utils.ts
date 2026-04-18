/**
 * Toast Notification Utilities
 * Centralized toast helpers for consistent UX across the app
 */
import { toast } from 'sonner';
export const trainingPathToasts = {
    // Path creation
    created: () =>
        toast.success('Training path created successfully!', {
            description: 'Your path has been saved as a draft.',
        }),
    updated: () =>
        toast.success('Training path updated!', {
            description: 'Your changes have been saved.',
        }),
    deleted: () =>
        toast.success('Training path removed', {
            description: 'The path has been removed.',
        }),
    // Submission & approval
    submitted: () =>
        toast.success('Submitted for review', {
            description: 'An admin will review your path soon.',
            duration: 5000,
        }),
    approved: (trainingPathTitle: string) =>
        toast.success('Training path approved! 🎉', {
            description: `"${trainingPathTitle}" is now live and visible to operators.`,
            duration: 6000,
        }),
    rejected: (trainingPathTitle: string) =>
        toast.error('Training path rejected', {
            description: `"${trainingPathTitle}" needs revisions. Check admin feedback.`,
            duration: 6000,
        }),
    // Enrollment
    enrolled: (trainingPathTitle: string) =>
        toast.success('Enrollment successful!', {
            description: `You're now enrolled in "${trainingPathTitle}". Happy building!`,
            duration: 5000,
        }),
    unenrolled: () =>
        toast.info('Unenrolled successfully', {
            description: 'Your progress has been saved.',
        }),
    // Progress
    trainingUnitCompleted: (trainingUnitTitle: string) =>
        toast.success('Milestone completed! ✓', {
            description: `"${trainingUnitTitle}" marked as complete.`,
        }),
    trainingPathCompleted: (trainingPathTitle: string) =>
        toast.success('Training path completed! 🎓', {
            description: `Congratulations on completing "${trainingPathTitle}"!`,
            duration: 8000,
        }),
    // Errors
    error: (message: string = 'Something went wrong') =>
        toast.error('Error', {
            description: message,
        }),
    validationError: () =>
        toast.error('Validation Error', {
            description: 'Please check the form and fix any errors.',
        }),
    unauthorized: () =>
        toast.error('Unauthorized', {
            description: "You don't have permission to perform this action.",
        }),
    notFound: () =>
        toast.error('Not Found', {
            description: 'The requested training path could not be found.',
        }),
    // Auto-save
    autoSaving: () =>
        toast.loading('Saving draft...', {
            id: 'auto-save',
        }),
    autoSaved: () =>
        toast.success('Draft saved', {
            id: 'auto-save',
            duration: 2000,
        }),
    autoSaveFailed: () =>
        toast.error('Auto-save failed', {
            id: 'auto-save',
            description: 'Your changes may not be saved. Please save manually.',
        }),
};
export const vmToasts = {
    provisioning: () =>
        toast.loading('Provisioning VM...', {
            id: 'vm-provision',
            description: 'This may take up to 2 minutes.',
        }),
    ready: () =>
        toast.success('VM is ready!', {
            id: 'vm-provision',
            description: 'Your virtual machine is now accessible.',
        }),
    terminated: () =>
        toast.info('VM terminated', {
            description: 'The virtual machine has been stopped.',
        }),
    error: (message: string) =>
        toast.error('VM Error', {
            id: 'vm-provision',
            description: message,
        }),
};
export const adminToasts = {
    bulkApproved: (count: number) =>
        toast.success(`${count} paths approved`, {
            description: 'Instructors have been notified.',
        }),
    bulkRejected: (count: number) =>
        toast.info(`${count} paths rejected`, {
            description: 'Feedback has been sent to instructors.',
        }),
};

