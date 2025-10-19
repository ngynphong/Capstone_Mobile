import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { TokenPackage } from '../../types/storeTypes';
import { getTokenPackages, purchaseTokens } from '../../services/paymentService';
import PackageCard from './PackageCard';

interface TokenPackagesProps {
  onTokenPurchased?: (tokens: number) => void;
}

const TokenPackages: React.FC<TokenPackagesProps> = ({ onTokenPurchased }) => {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const data = await getTokenPackages();
      setPackages(data);
    } catch (error) {
      console.error('Failed to load token packages:', error);
      Alert.alert('Error', 'Failed to load token packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    try {
      setPurchasingPackageId(packageId);

      const purchaseRequest = {
        packageId,
        paymentMethod: 'credit_card', // TODO: Add payment method selection
      };

      const response = await purchaseTokens(purchaseRequest);

      if (response.code === 200) {
        const selectedPackage = packages.find(pkg => pkg.id === packageId);
        if (selectedPackage) {
          Alert.alert(
            'Purchase Initiated',
            `Your purchase of ${selectedPackage.tokenAmount} tokens has been initiated. You will be redirected to complete the payment.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // TODO: Handle payment redirect
                  // For now, simulate token addition
                  onTokenPurchased?.(selectedPackage.tokenAmount);
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Error', 'Failed to initiate purchase. Please try again.');
    } finally {
      setPurchasingPackageId(null);
    }
  };

  if (isLoading) {
    return (
      <View className="mx-6 mb-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">Token Packages</Text>
        <View className="space-y-4">
          {[1, 2, 3].map((i) => (
            <View key={i} className="p-5 bg-gray-200 rounded-2xl">
              <View className="h-4 bg-gray-300 rounded mb-2" />
              <View className="h-3 bg-gray-300 rounded w-3/4 mb-4" />
              <View className="h-6 bg-gray-300 rounded w-1/2" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="text-xl font-bold text-gray-900 mb-4 mx-6">Token Packages</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {packages.map((pkg) => (
          <View key={pkg.id} className="w-80 mr-4">
            <PackageCard
              package={pkg}
              onPurchase={handlePurchase}
              isLoading={purchasingPackageId === pkg.id}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TokenPackages;
