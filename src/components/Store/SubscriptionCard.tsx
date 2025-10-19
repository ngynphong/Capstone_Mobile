import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SubscriptionPlan } from '../../types/storeTypes';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  onSubscribe,
  isLoading = false,
  isCurrentPlan = false,
}) => {
  const calculateYearlySavings = () => {
    if (plan.duration === 'yearly' && plan.discount) {
      const monthlyEquivalent = plan.price / 12;
      const originalMonthlyPrice = 19.99; // Premium monthly price
      const yearlyOriginalPrice = originalMonthlyPrice * 12;
      return yearlyOriginalPrice - plan.price;
    }
    return 0;
  };

  const yearlySavings = calculateYearlySavings();
  const isFree = plan.type === 'free';

  return (
    <TouchableOpacity
      className="mx-6 mb-4 p-5 rounded-2xl border-2"
      style={{
        borderColor: isCurrentPlan
          ? '#10b981'
          : plan.type === 'premium'
          ? '#8b5cf6'
          : '#e5e7eb',
        backgroundColor: isCurrentPlan
          ? '#ecfdf5'
          : plan.type === 'premium'
          ? '#faf5ff'
          : '#ffffff',
        borderWidth: 2,
      }}
      onPress={() => !isFree && onSubscribe(plan.id)}
      disabled={isLoading || isCurrentPlan}
    >
      {/* Current plan badge */}
      {isCurrentPlan && (
        <View className="absolute top-3 right-3 bg-green-500 px-2 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">CURRENT</Text>
        </View>
      )}

      {/* Premium badge */}
      {plan.type === 'premium' && !isCurrentPlan && (
        <View className="absolute top-3 right-3 bg-purple-500 px-2 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">PREMIUM</Text>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-xl font-bold text-gray-900 mb-1">
          {plan.name}
        </Text>

        <View className="flex-row items-baseline">
          {plan.price === 0 ? (
            <Text className="text-3xl font-bold text-gray-900">FREE</Text>
          ) : (
            <>
              <Text className="text-3xl font-bold text-gray-900">
                ${plan.price}
              </Text>
              <Text className="text-lg text-gray-600 ml-1">
                /{plan.duration === 'yearly' ? 'year' : 'month'}
              </Text>
            </>
          )}
        </View>

        {/* Yearly savings indicator */}
        {yearlySavings > 0 && (
          <Text className="text-green-600 text-sm font-semibold mt-1">
            Save ${yearlySavings.toFixed(0)} per year
          </Text>
        )}

        {/* Discount badge */}
        {plan.discount && plan.discount > 0 && (
          <View className="bg-red-500 px-2 py-1 rounded-lg mt-2 self-start">
            <Text className="text-white text-sm font-semibold">
              {plan.discount}% OFF
            </Text>
          </View>
        )}
      </View>

      {/* Features list */}
      <View className="mb-4">
        {plan.features.map((feature, index) => (
          <View key={index} className="flex-row items-center mb-2">
            <Text className="text-green-500 mr-2">✓</Text>
            <Text className="text-gray-700 text-sm flex-1">
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Subscribe button */}
      <TouchableOpacity
        className={`p-3 rounded-lg items-center ${
          isFree
            ? 'bg-gray-100'
            : isCurrentPlan
            ? 'bg-green-500'
            : 'bg-purple-600'
        }`}
        onPress={() => !isFree && onSubscribe(plan.id)}
        disabled={isLoading || isCurrentPlan || isFree}
      >
        <Text
          className={`font-semibold ${
            isFree
              ? 'text-gray-500'
              : isCurrentPlan
              ? 'text-white'
              : 'text-white'
          }`}
        >
          {isLoading
            ? '...'
            : isCurrentPlan
            ? 'Current Plan'
            : isFree
            ? 'Free Plan'
            : `Subscribe ${plan.duration === 'yearly' ? 'Yearly' : 'Monthly'}`
          }
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default SubscriptionCard;
