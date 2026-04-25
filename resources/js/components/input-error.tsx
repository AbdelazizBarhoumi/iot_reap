import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
export default function InputError({
    message,
    className = '',
    ...props
}: HTMLMotionProps<'p'> & { message?: string }) {
    return (
        <AnimatePresence>
            {message && (
                <motion.p
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    {...props}
                    className={cn(
                        'flex items-center gap-1.5 text-sm text-destructive',
                        className,
                    )}
                    role="alert"
                    aria-live="polite"
                >
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{message}</span>
                </motion.p>
            )}
        </AnimatePresence>
    );
}
