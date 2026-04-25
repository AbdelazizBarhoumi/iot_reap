/**
 * SessionExtendButton — Extend the session duration.
 * Sprint 3 — US-13
 *
 * Opens a confirmation dialog, lets the user pick an increment,
 * then calls POST /api/sessions/{id}/extend.
 */
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { vmSessionApi } from '@/api/vm.api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
interface SessionExtendButtonProps {
    /** VM session UUID. */
    sessionId: string;
    /** Called after a successful extension with the new `expires_at` ISO string. */
    onExtended: (newExpiresAt: string) => void;
    /** Disable the button (e.g. session is not active). */
    disabled?: boolean;
}
const INCREMENT_OPTIONS = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
];
export function SessionExtendButton({
    sessionId,
    onExtended,
    disabled = false,
}: SessionExtendButtonProps) {
    const [open, setOpen] = useState(false);
    const [minutes, setMinutes] = useState(30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleExtend = async () => {
        setLoading(true);
        setError(null);
        try {
            const updated = await vmSessionApi.extend(sessionId, { minutes });
            onExtended(updated.expires_at);
            setOpen(false);
        } catch (e: unknown) {
            // Extract backend error message when available
            let message = 'Failed to extend session.';
            if (e && typeof e === 'object' && 'response' in e) {
                const resp = (
                    e as {
                        response?: {
                            data?: { message?: string; error?: string };
                        };
                    }
                ).response;
                message = resp?.data?.error ?? resp?.data?.message ?? message;
            } else if (e instanceof Error) {
                message = e.message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => {
                    setError(null);
                    setOpen(true);
                }}
            >
                <Plus className="mr-2 h-4 w-4" />
                Extend
            </Button>
            <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
                <DialogContent className="sm:max-w-[380px]">
                    <DialogHeader>
                        <DialogTitle>Extend Session</DialogTitle>
                        <DialogDescription>
                            Add more time to your session. The countdown timer
                            will update automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="extend-minutes">
                                Duration to add
                            </Label>
                            <Select
                                value={minutes.toString()}
                                onValueChange={(v) => setMinutes(Number(v))}
                            >
                                <SelectTrigger id="extend-minutes">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INCREMENT_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value.toString()}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleExtend} disabled={loading}>
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {loading ? 'Extending…' : 'Extend'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
