import { useState, useEffect } from 'react';
import * as checkoutApi from '@/api/checkout.api';
import type { Payment, RefundRequest } from '@/types/payment.types';

export function useCheckout() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initiateCheckout = async (trainingPathId: string | number) => {
        try {
            setLoading(true);
            const data = await checkoutApi.initiateCheckout(trainingPathId);
            setError(null);

            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            }

            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            }

            return data;
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to initiate checkout';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, initiateCheckout };
}

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const data = await checkoutApi.getPayments();
                setPayments(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load payments',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    return { payments, loading, error, refetch: () => {} };
}

export function useRefunds() {
    const [refunds, setRefunds] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRefunds = async () => {
            try {
                setLoading(true);
                const data = await checkoutApi.getRefunds();
                setRefunds(data);
                setError(null);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load refunds',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRefunds();
    }, []);

    const requestRefund = async (paymentId: string | number, reason: string) => {
        try {
            setLoading(true);
            const data = await checkoutApi.requestRefund(paymentId, reason);
            setRefunds([...refunds, data]);
            setError(null);
            return data;
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to request refund';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { refunds, loading, error, requestRefund };
}
