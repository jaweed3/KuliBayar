import { useState, useEffect } from 'react';
import { Payment, fetchPayments } from '@/lib/mock/payments';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await fetchPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return {
    payments,
    loading,
    totalEarned,
  };
}
