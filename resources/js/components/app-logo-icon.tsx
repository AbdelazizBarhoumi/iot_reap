import { Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLogoIconProps {
    className?: string;
}

export default function AppLogoIcon({ className }: AppLogoIconProps) {
    return <Server className={cn('h-6 w-6', className)} />;
}
