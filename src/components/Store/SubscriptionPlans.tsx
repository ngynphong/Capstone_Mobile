import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { SubscriptionPlan } from '../../types/storeTypes';
import { getSubscriptionPlans, subscribeToPlan } from '../../services/paymentService';
import SubscriptionCard from './SubscriptionCard';

interface SubscriptionPlansProps {
  currentPlanId?: string;
  onSubscriptionChange?: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  currentPlanId,
  onSubscriptionChange
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribingPlanId(planId);

      const subscribeRequest = {
        planId,
        paymentMethod: 'credit_card', // TODO: Add payment method selection
      };

      const response = await subscribeToPlan(subscribeRequest);

      if (response.code === 200) {
        const selectedPlan = plans.find(plan => plan.id === planId);
        if (selectedPlan) {
          Alert.alert(
            'Subscription Initiated',
            `Your ${selectedPlan.name} subscription has been initiated. You will be redirected to complete the payment.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // TODO: Handle payment redirect
                  // For now, simulate subscription change
                  onSubscriptionChange?.();
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      Alert.alert('Error', 'Failed to initiate subscription. Please try again.');
    } finally {
      setSubscribingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-4 mx-6">Subscription Plans</Text>
        <View className="space-y-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="mx-6 p-5 bg-gray-200 rounded-2xl">
              <View className="h-4 bg-gray-300 rounded mb-2" />
              <View className="h-6 bg-gray-300 rounded w-1/2 mb-4" />
              <View className="space-y-2">
                <View className="h-3 bg-gray-300 rounded" />
                <View className="h-3 bg-gray-300 rounded" />
                <View className="h-3 bg-gray-300 rounded" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="text-xl font-bold text-gray-900 mb-4 mx-6">Subscription Plans</Text>

      <View>
        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            onSubscribe={handleSubscribe}
            isLoading={subscribingPlanId === plan.id}
            isCurrentPlan={currentPlanId === plan.id}
          />
        ))}
      </View>

      {/* Subscription benefits info */}
      <View className="mx-6 p-4 bg-blue-50 rounded-xl mt-4">
        <Text className="text-blue-800 font-semibold mb-2">💡 Subscription Benefits</Text>
        <Text className="text-blue-700 text-sm">
          Premium subscribers get unlimited access to all features, priority support, and exclusive content.
          Cancel or change your plan anytime.
        </Text>
      </View>
    </View>
  );
};

export default SubscriptionPlans;
