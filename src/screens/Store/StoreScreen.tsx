import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useScroll } from '../../context/ScrollContext';
import TokenBalanceCard from '../../components/Store/TokenBalanceCard';
import TransactionHistory from '../../components/Store/TransactionHistory';
import usePayments from '../../hooks/usePayments';

const StoreScreen = () => {
  const { user, refreshUser } = useAuth();
  const { handleScroll } = useScroll();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { payments, isLoading: isLoadingPayments, fetchPaymentsByUser } = usePayments();

  // Ưu tiên sử dụng amount từ API payments, fallback về user tokenBalance
  const tokenBalance = payments?.amount ?? user?.tokenBalance ?? 0;

  // Gọi API payments khi component mount
  useEffect(() => {
    fetchPaymentsByUser().catch((error) => {
      console.error('Failed to fetch payments:', error);
    });
  }, [fetchPaymentsByUser]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshUser(),
        fetchPaymentsByUser(),
      ]);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refresh store data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Loading store...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header + Balance */}
        <View className="pt-12 pb-4 px-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            My Wallet
          </Text>
          <Text className="text-gray-600 mb-4">
            Manage your balance and transaction history
          </Text>

          {/* Token Balance Card */}
          <TokenBalanceCard
            tokenBalance={tokenBalance}
            isLoading={isRefreshing || isLoadingPayments}
          />

          {/* Quick actions */}
          <View className="mt-2">
            <TouchableOpacity 
              className="flex-1 bg-emerald-500 rounded-2xl py-3 items-center justify-center shadow-md"
              onPress={() => {
                Alert.alert(
                  'Notification',
                  'This feature must be used on web',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text className="text-white font-semibold">Deposit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <TransactionHistory refreshTrigger={refreshTrigger} />

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default StoreScreen;
