import { useCallback, useState } from 'react';
import { getPaymentsByUser } from '../services/paymentService';
import type { PaymentsByUserResponse, PaymentData } from '../types/storeTypes';

export const usePayments = () => {
  const [payments, setPayments] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentsByUser = useCallback(async (): Promise<PaymentsByUserResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPaymentsByUser();
      setPayments(response.data);
      return response;
    } catch (err: any) {
      console.error('fetchPaymentsByUser error', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Không thể tải thông tin thanh toán. Vui lòng thử lại.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    payments,
    isLoading,
    error,
    fetchPaymentsByUser,
  };
};

export default usePayments;

