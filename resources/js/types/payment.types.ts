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
    course: {
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
    status: RefundStatus;
    status_label: string;
    reason: string;
    admin_notes?: string;
    refund_amount: number | null;
    processed_at: string | null;
    created_at: string;
}
export interface CheckoutResponse {
    session_id?: string;
    checkout_url?: string;
    enrolled?: boolean;
    redirect_url?: string;
    error?: string;
}
export interface CourseWithPrice {
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

