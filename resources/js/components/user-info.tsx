import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';
const roleLabels: Record<string, { label: string; className: string }> = {
    admin: {
        label: 'Admin',
        className: 'bg-destructive/10 text-destructive border-destructive/30',
    },
    engineer: {
        label: 'Engineer',
        className: 'bg-primary/10 text-primary border-primary/30',
    },
    teacher: {
        label: 'Teacher',
        className: 'bg-success/10 text-success border-success/30',
    },
    security_officer: {
        label: 'Security',
        className: 'bg-warning/10 text-warning border-warning/30',
    },
};
export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const roleConfig = roleLabels[user.role] || {
        label: user.role,
        className: 'bg-muted text-muted-foreground',
    };
    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
                <Badge
                    variant="outline"
                    className={`mt-0.5 w-fit px-1.5 py-0 text-[10px] ${roleConfig.className}`}
                >
                    {roleConfig.label}
                </Badge>
            </div>
        </>
    );
}


