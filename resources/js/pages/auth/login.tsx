import { Form, Head, router } from '@inertiajs/react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { authCode } from '@/routes/google';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};
export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthLayout
            title="Welcome back"
            description="Sign in to access your engineering workspace"
        >
            <Head title="Log in" />
            {status && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-center text-sm font-medium text-success"
                >
                    {status}
                </motion.div>
            )}
            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Email field */}
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
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="h-11 border-muted-foreground/20 bg-muted/50 pl-10 transition-colors focus:bg-background"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>
                            {/* Password field */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs text-primary transition-colors hover:text-primary/80"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-11 border-muted-foreground/20 bg-muted/50 pl-10 transition-colors focus:bg-background"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>
                            {/* Remember me */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-muted-foreground/30"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-sm text-muted-foreground"
                                >
                                    Keep me signed in
                                </Label>
                            </div>
                            {/* Submit button */}
                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <Spinner className="mr-2" />
                                ) : (
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                )}
                                Sign in to workspace
                            </Button>
                            {/* Google OAuth button */}
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    // Exchange the authorization code for tokens on backend
                                    router.post(
                                        authCode().url,
                                        {
                                            credential: credentialResponse.credential,
                                        },
                                        {
                                            onError: () => {
                                                toast.error('Authentication failed. Please try again.');
                                            },
                                        }
                                    );
                                }}
                                onError={() => {
                                    toast.error('Failed to authenticate with Google. Please try again.');
                                }}
                                text="signin_with"
                                size="large"
                                theme="outline"
                            />
                        </div>
                        {/* Divider */}
                        {canRegister && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-muted-foreground/20" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            New to IoT-REAP?
                                        </span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <TextLink
                                        href={register()}
                                        tabIndex={5}
                                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                                    >
                                        Create an account
                                        <ArrowRight className="h-3 w-3" />
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

