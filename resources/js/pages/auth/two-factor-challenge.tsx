import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    return (
        <AuthLayout
            title="Two-factor challenge"
            description="Enter the code from your authenticator app or a recovery code to continue."
        >
            <Head title="Two-factor challenge" />

            <Form {...store.form()} resetOnSuccess={['code', 'recovery_code']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Authentication code</Label>
                            <Input
                                id="code"
                                name="code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="123456"
                                autoFocus
                            />
                            <InputError message={errors.code} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="recovery_code">
                                Recovery code (optional)
                            </Label>
                            <Input
                                id="recovery_code"
                                name="recovery_code"
                                type="text"
                                placeholder="XXXX-XXXX"
                            />
                            <InputError message={errors.recovery_code} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                            data-test="two-factor-challenge-button"
                        >
                            {processing && <Spinner />}
                            Continue
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
