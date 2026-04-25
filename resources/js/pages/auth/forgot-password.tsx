import { Form, Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';
export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Reset your password"
            description="Enter your email and we'll send you a reset link"
        >
            <Head title="Forgot password" />
            {status && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-start gap-3 rounded-lg border border-success/20 bg-success/10 p-4"
                >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <div>
                        <p className="text-sm font-medium text-success">
                            Check your inbox
                        </p>
                        <p className="mt-1 text-xs text-success/80">{status}</p>
                    </div>
                </motion.div>
            )}
            <div className="space-y-5">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium"
                                >
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        autoFocus
                                        placeholder="you@example.com"
                                        className="h-11 border-muted-foreground/20 bg-muted/50 pl-10 transition-colors focus:bg-background"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>
                            <Button
                                type="submit"
                                className="mt-6 h-11 w-full bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing ? (
                                    <Spinner className="mr-2" />
                                ) : (
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                )}
                                Send reset link
                            </Button>
                        </>
                    )}
                </Form>
                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Remember your password?
                        </span>
                    </div>
                </div>
                <div className="text-center">
                    <TextLink
                        href={login().url}
                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back to sign in
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
