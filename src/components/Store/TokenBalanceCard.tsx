import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface TokenBalanceCardProps {
  tokenBalance: number;
  isLoading?: boolean;
}

const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({
  tokenBalance,
  isLoading = false,
}) => {
  return (
    <View
      className="mb-4 p-6 rounded-2xl shadow-lg"
      style={{ backgroundColor: '#0f766e' }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-white text-sm font-medium mb-1" style={{ opacity: 0.9 }}>
            Current Balance
          </Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text className="text-white text-3xl font-bold">
              {tokenBalance.toLocaleString()} đ
            </Text>
          )}
        </View>

        <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <Text className="text-white text-2xl">🪙</Text>
        </View>
      </View>

      <Text className="text-white text-sm mt-3" style={{ opacity: 0.8 }}>
        Use your balance to buy courses, exams and materials in the system.
      </Text>
    </View>
  );
};

export default TokenBalanceCard;
