import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { Transaction } from '../../types/storeTypes';
import { getTransactionHistory } from '../../services/paymentService';
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

      const response = await getTransactionHistory(page, 10);

      if (response.code === 200) {
        const newTransactions = response.data.transactions;

        if (reset) {
          setTransactions(newTransactions);
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
        }

        setCurrentPage(page);
        setHasMorePages(page < response.data.totalPages);
      }
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
            Your token purchases and subscriptions will appear here
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
