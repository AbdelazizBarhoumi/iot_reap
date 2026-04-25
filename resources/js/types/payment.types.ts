/**
 * Payment TypeScript types for Sprint 5.
 */
export type PaymentStatus =
    | 'pending'
    | 'completed'
    | 'failed'
    | 'refunded'
    | 'partially_refunded';
export type RefundStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'processing'
    | 'completed'
    | 'failed';
export interface Payment {
    id: number;
    trainingPath: {
        id: number;
        title: string;
        thumbnail_url: string | null;
    };
    status: PaymentStatus;
    status_label: string;
    amount: number;
    formatted_amount: string;
    currency: string;
    paid_at: string | null;
    is_refundable: boolean;
    created_at: string;
}
export interface RefundRequest {
    id: number;
    payment?: Payment;
    trainingPath?: {
        id: number;
        title: string;
    } | null;
    status: RefundStatus;
    status_label: string;
    reason: string;
    admin_notes?: string;
    amount?: string | null;
    refund_amount: number | null;
    requestedAt: string;
    processedAt: string | null;
}
export interface CheckoutResponse {
    session_id?: string;
    checkout_url?: string;
    enrolled?: boolean;
    redirect_url?: string;
    error?: string;
}
export interface TrainingPathWithPrice {
    id: number;
    title: string;
    description: string;
    thumbnail_url: string | null;
    price_cents: number;
    currency: string;
    is_free: boolean;
    formatted_price: string;
    teacher: {
        id: number;
        name: string;
    };
}
