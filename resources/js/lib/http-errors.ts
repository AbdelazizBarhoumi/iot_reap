import { isAxiosError } from 'axios';

interface ErrorResponseBody {
    error?: string;
    message?: string;
    errors?: Record<string, string[] | string>;
}

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

export function getHttpErrorMessage(error: unknown, fallback: string): string {
    if (!isAxiosError(error)) {
        return error instanceof Error && isNonEmptyString(error.message)
            ? error.message
            : fallback;
    }

    const payload = error.response?.data as ErrorResponseBody | undefined;

    if (isNonEmptyString(payload?.error)) {
        return payload.error;
    }

    if (isNonEmptyString(payload?.message)) {
        return payload.message;
    }

    if (payload?.errors && typeof payload.errors === 'object') {
        const firstEntry = Object.values(payload.errors).find((entry) =>
            Array.isArray(entry)
                ? entry.some((item) => isNonEmptyString(item))
                : isNonEmptyString(entry),
        );

        if (Array.isArray(firstEntry)) {
            const firstMessage = firstEntry.find((item) =>
                isNonEmptyString(item),
            );

            if (firstMessage) {
                return firstMessage;
            }
        }

        if (isNonEmptyString(firstEntry)) {
            return firstEntry;
        }
    }

    if (isNonEmptyString(error.message)) {
        return error.message;
    }

    return fallback;
}
