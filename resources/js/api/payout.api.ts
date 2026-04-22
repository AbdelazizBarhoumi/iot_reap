import client from './client';

export interface PayoutRequestItem {
    id: number;
    amount: number;
    amount_cents: number;
    currency: string;
    status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'failed';
    status_label: string;
    payout_method: string;
    payout_details: Record<string, unknown> | null;
    rejection_reason: string | null;
    admin_notes: string | null;
    requestedAt: string;
    approvedAt: string | null;
    processedAt: string | null;
    completedAt: string | null;
}

export interface TeacherPayoutPayload {
    data: PayoutRequestItem[];
    available_balance_cents: number;
    available_balance: number;
}

export interface RequestPayoutPayload {
    amount: number;
    payout_method?: 'stripe' | 'bank_transfer' | 'paypal';
    payout_details?: Record<string, unknown> | null;
}

export const payoutApi = {
    async getMyPayouts(): Promise<TeacherPayoutPayload> {
        const response = await client.get<TeacherPayoutPayload>('/teaching/payouts');
        return response.data;
    },

    async requestPayout(payload: RequestPayoutPayload): Promise<PayoutRequestItem> {
        const response = await client.post<{ message: string; data: PayoutRequestItem }>(
            '/teaching/payouts/request',
            payload,
        );
        return response.data.data;
    },
};
