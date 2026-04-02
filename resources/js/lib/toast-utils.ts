/**
 * Toast Notification Utilities
 * Centralized toast helpers for consistent UX across the app
 */
import { toast } from 'sonner';
export const courseToasts = {
    // Course Creation
    created: () =>
        toast.success('Course created successfully!', {
            description: 'Your course has been saved as a draft.',
        }),
    updated: () =>
        toast.success('Course updated!', {
            description: 'Your changes have been saved.',
        }),
    deleted: () =>
        toast.success('Course deleted', {
            description: 'The course has been removed.',
        }),
    // Submission & Approval
    submitted: () =>
        toast.success('Submitted for review', {
            description: 'An admin will review your course soon.',
            duration: 5000,
        }),
    approved: (courseTitle: string) =>
        toast.success('Course approved! 🎉', {
            description: `"${courseTitle}" is now live and visible to students.`,
            duration: 6000,
        }),
    rejected: (courseTitle: string) =>
        toast.error('Course rejected', {
            description: `"${courseTitle}" needs revisions. Check admin feedback.`,
            duration: 6000,
        }),
    // Enrollment
    enrolled: (courseTitle: string) =>
        toast.success('Enrollment successful!', {
            description: `You're now enrolled in "${courseTitle}". Happy learning!`,
            duration: 5000,
        }),
    unenrolled: () =>
        toast.info('Unenrolled successfully', {
            description: 'Your progress has been saved.',
        }),
    // Progress
    lessonCompleted: (lessonTitle: string) =>
        toast.success('Lesson completed! ✓', {
            description: `"${lessonTitle}" marked as complete.`,
        }),
    courseCompleted: (courseTitle: string) =>
        toast.success('Course completed! 🎓', {
            description: `Congratulations on completing "${courseTitle}"!`,
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
            description: 'The requested course could not be found.',
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
        toast.success(`${count} courses approved`, {
            description: 'Instructors have been notified.',
        }),
    bulkRejected: (count: number) =>
        toast.info(`${count} courses rejected`, {
            description: 'Feedback has been sent to instructors.',
        }),
};

