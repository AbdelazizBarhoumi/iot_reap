/**
 * Checkout API Module
 * Handles trainingPath purchases, payments, and refunds
 */

import client from './client';

export interface CheckoutSession {
  id: string;
  training_path_id: string;
  user_id: string;
  stripe_session_id: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  amount: number;
  currency: string;
  created_at: string;
  completed_at: string | null;
}

export interface Payment {
  id: string;
  training_path_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  stripe_payment_id: string;
  created_at: string;
  completed_at: string | null;
}

export interface RefundRequest {
  id: string;
  payment_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  amount: number;
  requested_at: string;
  processed_at: string | null;
}

/**
 * Initiate trainingPath checkout (create Stripe session)
 */
export const initiateCheckout = (trainingPathId: string) =>
  client.post<{ checkout_url: string }>(`/checkout/initiate`, { training_path_id: trainingPathId });

/**
 * Get user's payment history
 */
export const getPayments = () =>
  client.get<Payment[]>(`/checkout/payments`);

/**
 * Request a refund for a trainingPath
 */
export const requestRefund = (trainingPathId: string, reason: string) =>
  client.post<RefundRequest>(`/checkout/refund`, {
    training_path_id: trainingPathId,
    reason,
  });

/**
 * Get user's refund requests
 */
export const getRefunds = () =>
  client.get<RefundRequest[]>(`/checkout/refunds`);
