import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useScroll } from '../../context/ScrollContext';
import TokenBalanceCard from '../../components/Store/TokenBalanceCard';
import TokenPackages from '../../components/Store/TokenPackages';
import SubscriptionPlans from '../../components/Store/SubscriptionPlans';
import TransactionHistory from '../../components/Store/TransactionHistory';

const StoreScreen = () => {
  const { user, refreshUser } = useAuth();
  const { handleScroll } = useScroll();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const tokenBalance = user?.tokenBalance || 0;
  const currentSubscription = user?.currentSubscription;

  const handleTokenPurchased = (tokens: number) => {
    // Update user token balance (simulate)
    if (user) {
      // In a real app, this would be handled by the payment service callback
      // For now, we'll just refresh the user data
      refreshUser();
    }
  };

  const handleSubscriptionChange = () => {
    // Refresh user data when subscription changes
    refreshUser();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
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
        {/* Header */}
        <View className="pt-12 pb-6 px-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">My Wallet</Text>
          <Text className="text-gray-600">
            Manage your tokens and subscription
          </Text>
        </View>

        {/* Token Balance Card */}
        <TokenBalanceCard
          tokenBalance={tokenBalance}
          isLoading={isRefreshing}
        />

        {/* Token Packages */}
        <TokenPackages onTokenPurchased={handleTokenPurchased} />

        {/* Subscription Plans */}
        <SubscriptionPlans
          currentPlanId={currentSubscription?.id}
          onSubscriptionChange={handleSubscriptionChange}
        />

        {/* Transaction History */}
        <TransactionHistory refreshTrigger={refreshTrigger} />

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default StoreScreen;
