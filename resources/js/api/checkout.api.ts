import type {
    CheckoutResponse,
    Payment,
    RefundRequest,
} from '@/types/payment.types';
import client from './client';

export async function initiateCheckout(
    trainingPathId: number | string,
): Promise<CheckoutResponse> {
    const response = await client.post<CheckoutResponse>('/checkout/initiate', {
        training_path_id: trainingPathId,
    });

    return response.data;
}

export async function getPayments(): Promise<Payment[]> {
    const response = await client.get<{ data?: Payment[] } | Payment[]>(
        '/checkout/payments',
        {
            headers: { Accept: 'application/json' },
        },
    );

    return Array.isArray(response.data)
        ? response.data
        : response.data.data ?? [];
}

export async function requestRefund(
    paymentId: number | string,
    reason: string,
): Promise<RefundRequest> {
    const response = await client.post<{ refund_request: RefundRequest }>(
        '/checkout/refund',
        {
            payment_id: paymentId,
            reason,
        },
    );

    return response.data.refund_request;
}

export async function getRefunds(): Promise<RefundRequest[]> {
    const response = await client.get<{ data?: RefundRequest[] } | RefundRequest[]>(
        '/checkout/refunds',
        {
            headers: { Accept: 'application/json' },
        },
    );

    return Array.isArray(response.data)
        ? response.data
        : response.data.data ?? [];
}
