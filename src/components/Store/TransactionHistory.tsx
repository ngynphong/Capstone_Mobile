import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { Transaction, WalletTransaction } from '../../types/storeTypes';
import { getTransactionHistory, getAllTransactions } from '../../services/paymentService';
import TransactionItem from './TransactionItem';

interface TransactionHistoryProps {
  refreshTrigger?: number; // For external refresh triggers
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  refreshTrigger
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);

  useEffect(() => {
    loadTransactions(true);
  }, [refreshTrigger]);

  const loadTransactions = async (reset: boolean = false) => {
    try {
      const page = reset ? 1 : currentPage;
      setIsLoading(reset);

      // Gọi cả 2 API: user transactions và all transactions
      const [userTransactionsResponse, allTransactions] = await Promise.all([
        getTransactionHistory(page, 10),
        getAllTransactions().catch(err => {
          console.log('getAllTransactions error (non-critical):', err);
          return []; // Nếu lỗi thì trả về array rỗng
        }),
      ]);

      console.log('User transactions:', userTransactionsResponse.data.transactions);
      console.log('All transactions:', allTransactions);

      // Map allTransactions từ WalletTransaction sang Transaction format
      const mappedAllTransactions: Transaction[] = allTransactions.map((wt: WalletTransaction) => ({
        id: wt.id,
        type: (wt.type?.name === 'subscription' 
          ? 'subscription' 
          : wt.type?.name === 'refund' 
            ? 'refund' 
            : 'token_purchase') as Transaction['type'],
        amount: wt.amount,
        currency: 'VND',
        description: wt.description ?? '',
        status: (['pending', 'completed', 'failed', 'cancelled'].includes(wt.status) 
          ? wt.status 
          : 'pending') as Transaction['status'],
        createdAt: wt.createdAt,
        referenceId: wt.externalReference,
      }));

      // Merge transactions từ cả 2 API, ưu tiên user transactions
      let newTransactions: Transaction[] = [];
      
      if (userTransactionsResponse.code === 1000) {
        newTransactions = userTransactionsResponse.data.transactions;
      }

      // Thêm các transactions từ allTransactions mà chưa có trong userTransactions
      const userTransactionIds = new Set(newTransactions.map(t => t.id));
      const additionalTransactions = mappedAllTransactions.filter(
        t => !userTransactionIds.has(t.id)
      );

      // Merge và sort theo createdAt (mới nhất trước)
      const mergedTransactions = [...newTransactions, ...additionalTransactions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (reset) {
        setTransactions(mergedTransactions);
      } else {
        setTransactions(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const uniqueNew = mergedTransactions.filter(t => !existingIds.has(t.id));
          return [...prev, ...uniqueNew].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }

      setCurrentPage(page);
      setHasMorePages(page < userTransactionsResponse.data.totalPages);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      if (reset) {
        Alert.alert('Error', 'Failed to load transaction history. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTransactions(true);
  };

  const loadMore = () => {
    if (hasMorePages && !isLoading) {
      loadTransactions(false);
    }
  };

  if (isLoading && transactions.length === 0) {
    return (
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-4 mx-6">Transaction History</Text>
        <View className="space-y-3">
          {[1, 2, 3].map((i) => (
            <View key={i} className="mx-6 p-4 bg-gray-200 rounded-xl">
              <View className="h-4 bg-gray-300 rounded mb-2" />
              <View className="h-3 bg-gray-300 rounded w-1/2" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-4 mx-6">Transaction History</Text>
        <View className="mx-6 p-8 bg-gray-50 rounded-xl items-center">
          <Text className="text-4xl mb-3">📋</Text>
          <Text className="text-gray-500 text-center font-medium mb-1">
            No transactions yet
          </Text>
          <Text className="text-gray-400 text-center text-sm">
            Your VND purchases and subscriptions will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="text-xl font-bold text-gray-900 mb-4 mx-6">Transaction History</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onMomentumScrollEnd={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

          if (isCloseToBottom) {
            loadMore();
          }
        }}
      >
        <View className="pb-4">
          {transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
            />
          ))}

          {/* Load more indicator */}
          {hasMorePages && (
            <View className="mx-6 py-4 items-center">
              <Text className="text-gray-500 text-sm">Loading more...</Text>
            </View>
          )}

          {/* End of list */}
          {!hasMorePages && transactions.length > 0 && (
            <View className="mx-6 py-4 items-center">
              <Text className="text-gray-400 text-sm">End of transaction history</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default TransactionHistory;
