import { Head, router } from '@inertiajs/react';
import { Award, ExternalLink, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function extractCertificateHash(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    const pathMatch = trimmed.match(/\/certificates\/([^/]+)\/verify\/?$/i);

    if (pathMatch?.[1]) {
        return pathMatch[1];
    }

    const hashMatch = trimmed.match(/^[A-Za-z0-9_-]{16,}$/);

    if (hashMatch) {
        return trimmed;
    }

    return null;
}

export default function CertificateLookupPage() {
    const [query, setQuery] = useState('');
    const [touched, setTouched] = useState(false);

    const extractedHash = useMemo(() => extractCertificateHash(query), [query]);
    const showError = touched && query.trim().length > 0 && !extractedHash;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTouched(true);

        if (!extractedHash) {
            return;
        }

        router.visit(
            `/certificates/${encodeURIComponent(extractedHash)}/verify`,
        );
    };

    return (
        <>
            <Head title="Verify Certificate" />

            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
                <div className="container flex min-h-screen max-w-3xl items-center py-12">
                    <div className="w-full space-y-8">
                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-medium tracking-[0.2em] text-primary uppercase">
                                    Public Verification
                                </p>
                                <h1 className="text-4xl font-bold text-foreground">
                                    Verify a certificate
                                </h1>
                                <p className="mx-auto max-w-2xl text-muted-foreground">
                                    Guests can confirm whether an IoT-REAP
                                    certificate is authentic by pasting the
                                    verification link or the full certificate
                                    hash.
                                </p>
                            </div>
                        </div>

                        <Card className="border-border/70 shadow-lg">
                            <CardContent className="p-6 sm:p-8">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <label
                                        htmlFor="certificate-verification-query"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        Verification link or certificate hash
                                    </label>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <div className="flex-1">
                                            <Input
                                                id="certificate-verification-query"
                                                value={query}
                                                onChange={(event) =>
                                                    setQuery(event.target.value)
                                                }
                                                onBlur={() => setTouched(true)}
                                                placeholder="Paste https://.../certificates/{hash}/verify or the full hash"
                                                className="h-12"
                                            />
                                            {showError && (
                                                <p className="mt-2 text-sm text-destructive">
                                                    Enter a valid verification
                                                    link or the full certificate
                                                    hash.
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="h-12 px-6"
                                        >
                                            <Search className="mr-2 h-4 w-4" />
                                            Verify
                                        </Button>
                                    </div>
                                </form>

                                <div className="mt-6 grid gap-3 border-t pt-6 text-sm text-muted-foreground sm:grid-cols-2">
                                    <div className="rounded-xl bg-muted/50 p-4">
                                        <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                                            <ExternalLink className="h-4 w-4 text-primary" />
                                            Accepted input
                                        </div>
                                        <p>
                                            Paste the public verification URL
                                            from a certificate or enter the
                                            complete verification hash directly.
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-muted/50 p-4">
                                        <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                                            <Award className="h-4 w-4 text-primary" />
                                            What you will see
                                        </div>
                                        <p>
                                            The result page shows whether the
                                            certificate is valid and, if so, who
                                            earned it and which training path it
                                            covers.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
