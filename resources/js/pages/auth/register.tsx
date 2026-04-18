import { Form, Head, router } from '@inertiajs/react';
import {
    User,
    Mail,
    Lock,
    GraduationCap,
    Wrench,
    ArrowRight,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login, terms, privacy } from '@/routes';
import { authCode } from '@/routes/google';
import { store } from '@/routes/register';
import { toast } from 'sonner';
export default function Register() {
    return (
        <AuthLayout
            title="Join IoT-REAP"
            description="Create your account to access virtual labs and training paths"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            {/* Name field */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Full name
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="John Doe"
                                        className="h-11 border-muted-foreground/20 bg-muted/50 pl-10 transition-colors focus:bg-background"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>
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
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        className="h-11 border-muted-foreground/20 bg-muted/50 pl-10 transition-colors focus:bg-background"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>
                            {/* Password fields in a grid on larger screens */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium"
                                    >
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            tabIndex={3}
                                            autoComplete="new-password"
                                            name="password"
                                            placeholder="Create password"
                                            className="h-11 border-muted-foreground/20 bg-muted/50 pl-10 transition-colors focus:bg-background"
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-sm font-medium"
                                    >
                                        Confirm
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            name="password_confirmation"
                                            placeholder="Confirm password"
                                            className="h-11 border-muted-foreground/20 bg-muted/50 pl-10 transition-colors focus:bg-background"
                                        />
                                    </div>
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>
                            {/* Role selection with visual cards */}
                            <div className="grid gap-2">
                                <Label className="text-sm font-medium">
                                    I want to
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="engineer"
                                            defaultChecked
                                            tabIndex={5}
                                            className="peer sr-only"
                                        />
                                        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-muted-foreground/20 bg-muted/30 p-4 transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-muted/50">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 peer-checked:bg-primary/20">
                                                <Wrench className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium">
                                                Learn & Practice
                                            </span>
                                            <span className="text-center text-xs text-muted-foreground">
                                                Access labs & training paths
                                            </span>
                                        </div>
                                    </label>
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="teacher"
                                            tabIndex={5}
                                            className="peer sr-only"
                                        />
                                        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-muted-foreground/20 bg-muted/30 p-4 transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-muted/50">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 peer-checked:bg-primary/20">
                                                <GraduationCap className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium">
                                                Build & Create
                                            </span>
                                            <span className="text-center text-xs text-muted-foreground">
                                                Build training paths & labs
                                                (admin approval required)
                                            </span>
                                        </div>
                                    </label>
                                </div>
                                <InputError message={errors.role} />
                            </div>
                            {/* Submit button */}
                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <Spinner className="mr-2" />
                                ) : (
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                )}
                                Create account
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
                                locale="en"
                                text="signup_with"
                                size="large"
                                theme="outline"
                            />
                        </div>
                        {/* Terms notice */}
                        <p className="text-center text-xs text-muted-foreground">
                            By creating an account, you agree to our{' '}
                            <TextLink
                                href={terms()}
                                className="text-primary hover:underline"
                            >
                                Terms of Service
                            </TextLink>{' '}
                            and{' '}
                            <TextLink
                                href={privacy()}
                                className="text-primary hover:underline"
                            >
                                Privacy Policy
                            </TextLink>
                        </p>
                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted-foreground/20" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Already registered?
                                </span>
                            </div>
                        </div>
                        <div className="text-center">
                            <TextLink
                                href={login()}
                                tabIndex={7}
                                className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                            >
                                Sign in to your account
                                <ArrowRight className="h-3 w-3" />
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

