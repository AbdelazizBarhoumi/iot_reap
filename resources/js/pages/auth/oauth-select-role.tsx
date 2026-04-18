import { Form, Head } from '@inertiajs/react';
import {
    GraduationCap,
    Wrench,
    ArrowRight,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

interface OAuthUser {
    name: string;
    email: string;
    avatar?: string;
}

interface Props {
    oauthUser: OAuthUser;
    completeSignupUrl: string;
}

export default function OAuthSelectRole({ oauthUser, completeSignupUrl }: Props) {
    return (
        <AuthLayout
            title="Complete Your Profile"
            description="Choose your role to get started with IoT-REAP"
        >
            <Head title="Select Role" />

            {/* OAuth User Info Card */}
            <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        {oauthUser.avatar && (
                            <img
                                src={oauthUser.avatar}
                                alt={oauthUser.name}
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                            />
                        )}
                        <div>
                            <p className="font-semibold text-foreground">{oauthUser.name}</p>
                            <p className="text-sm text-muted-foreground">{oauthUser.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Role Selection Form */}
            <Form
                method="post"
                action={completeSignupUrl}
                className="flex flex-col gap-6"
            >
                {({ processing }) => (
                    <>
                        {/* Role Selection Cards */}
                        <fieldset className="space-y-3">
                            <legend className="text-sm font-semibold text-foreground">
                                What describes you best?
                            </legend>

                            {/* Engineer Card */}
                            <label className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="engineer"
                                    defaultChecked
                                    required
                                    className="peer sr-only"
                                />
                                <div className="flex flex-col gap-4 rounded-lg border-2 border-muted-foreground/20 bg-muted/30 p-5 transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-muted/50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 peer-checked:bg-primary/20">
                                                <Wrench className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    Engineer
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Learn industrial systems and practice with virtual machines
                                                </p>
                                            </div>
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-primary opacity-0 transition-opacity peer-checked:opacity-100" />
                                    </div>
                                </div>
                            </label>

                            {/* Teacher Card */}
                            <label className="relative cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="teacher"
                                    required
                                    className="peer sr-only"
                                />
                                <div className="flex flex-col gap-4 rounded-lg border-2 border-muted-foreground/20 bg-muted/30 p-5 transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-muted/50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 peer-checked:bg-primary/20">
                                                <GraduationCap className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    Instructor
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Create and manage training courses for your students
                                                </p>
                                            </div>
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-primary opacity-0 transition-opacity peer-checked:opacity-100" />
                                    </div>
                                </div>
                            </label>
                        </fieldset>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="h-11 w-full bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                            disabled={processing}
                        >
                            {processing ? (
                                <Spinner className="mr-2" />
                            ) : (
                                <ArrowRight className="mr-2 h-4 w-4" />
                            )}
                            Continue to Dashboard
                        </Button>

                        {/* Info Text */}
                        <p className="text-center text-xs text-muted-foreground">
                            You can change your role anytime in your account settings
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

