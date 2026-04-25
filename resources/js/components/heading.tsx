type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
const headingClasses = {
    h1: 'text-3xl font-bold tracking-tight',
    h2: 'text-xl font-semibold tracking-tight',
    h3: 'text-lg font-semibold tracking-tight',
    h4: 'text-base font-semibold tracking-tight',
    h5: 'text-sm font-semibold tracking-tight',
    h6: 'text-xs font-semibold tracking-tight',
} as const;
export default function Heading({
    title,
    description,
    variant = 'default',
    level = 'h2',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
    level?: HeadingLevel;
}) {
    const Tag = level;
    const baseClass =
        variant === 'small'
            ? 'mb-0.5 text-base font-medium'
            : headingClasses[level];
    return (
        <header className={variant === 'small' ? '' : 'mb-8 space-y-0.5'}>
            <Tag className={baseClass}>{title}</Tag>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </header>
    );
}
