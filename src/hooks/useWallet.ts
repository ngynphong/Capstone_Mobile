import { useCallback, useState } from 'react';
import type { Transaction, MomoCreateResponse } from '../types/storeTypes';
import {
  getTransactionHistory,
  createMomoPayment,
  getAllTransactions,
} from '../services/paymentService';

export const useWallet = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTransactionHistory(1, 50);
      setTransactions(res.data.transactions);
      return res;
    } catch (err: any) {
      console.error('loadUserTransactions error', err);
      setError('Không thể tải lịch sử giao dịch');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAllTransactions = useCallback(async () => {
    // Wrapper tiện dùng nếu sau này cần cho admin
    return getAllTransactions();
  }, []);

  const createTopupWithMomo = useCallback(
    async (amount: number): Promise<MomoCreateResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await createMomoPayment(amount);
        return res;
      } catch (err: any) {
        console.error('createTopupWithMomo error', err);
        setError('Không thể khởi tạo giao dịch MoMo');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    // state
    transactions,
    isLoading,
    error,

    // actions
    loadUserTransactions,
    loadAllTransactions,
    createTopupWithMomo,
  };
};

export default useWallet;


