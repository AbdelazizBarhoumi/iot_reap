/**
 * PTZControls — 4 directional buttons to move a PTZ-capable camera.
 * Sprint 4 — Camera streaming & PTZ control
 *
 * Layout (diamond pattern):
 *       [  ↑ ]
 *   [ ← ]    [ → ]
 *       [  ↓ ]
 */
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { CameraPTZDirection } from '@/types/camera.types';
interface PTZControlsProps {
    onMove: (direction: CameraPTZDirection) => Promise<void>;
    disabled?: boolean;
}
export function PTZControls({ onMove, disabled = false }: PTZControlsProps) {
    const [activeDir, setActiveDir] = useState<CameraPTZDirection | null>(null);
    const handleMove = async (direction: CameraPTZDirection) => {
        if (disabled) return;
        setActiveDir(direction);
        try {
            await onMove(direction);
        } finally {
            setActiveDir(null);
        }
    };
    const btnClass = (dir: CameraPTZDirection) =>
        `h-10 w-10 rounded-full ${activeDir === dir ? 'bg-primary text-primary-foreground' : ''}`;
    return (
        <div className="flex flex-col items-center gap-1">
            {/* Up */}
            <Button
                variant="outline"
                size="icon"
                className={btnClass('up')}
                disabled={disabled}
                onClick={() => handleMove('up')}
                title="Move Up"
            >
                <ArrowUp className="h-4 w-4" />
            </Button>
            {/* Left + Right */}
            <div className="flex items-center gap-6">
                <Button
                    variant="outline"
                    size="icon"
                    className={btnClass('left')}
                    disabled={disabled}
                    onClick={() => handleMove('left')}
                    title="Move Left"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className={btnClass('right')}
                    disabled={disabled}
                    onClick={() => handleMove('right')}
                    title="Move Right"
                >
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
            {/* Down */}
            <Button
                variant="outline"
                size="icon"
                className={btnClass('down')}
                disabled={disabled}
                onClick={() => handleMove('down')}
                title="Move Down"
            >
                <ArrowDown className="h-4 w-4" />
            </Button>
        </div>
    );
}


