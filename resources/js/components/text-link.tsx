import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
type Props = ComponentProps<typeof Link>;
export default function TextLink({
    className = '',
    children,
    ...props
}: Props) {
    return (
        <Link
            className={cn(
                'text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary/80 hover:decoration-primary/60',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
