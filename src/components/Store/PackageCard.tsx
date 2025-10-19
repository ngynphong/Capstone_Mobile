import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TokenPackage } from '../../types/storeTypes';

interface PackageCardProps {
  package: TokenPackage;
  onPurchase: (packageId: string) => void;
  isLoading?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  onPurchase,
  isLoading = false,
}) => {
  const calculateDiscountedPrice = () => {
    if (pkg.discount) {
      return pkg.price * (1 - pkg.discount / 100);
    }
    return pkg.price;
  };

  const discountedPrice = calculateDiscountedPrice();
  const hasDiscount = pkg.discount && pkg.discount > 0;

  return (
    <TouchableOpacity
      className="mx-6 mb-4 p-5 rounded-2xl border-2"
      style={{
        borderColor: pkg.popular ? '#3b82f6' : '#e5e7eb',
        backgroundColor: pkg.popular ? '#eff6ff' : '#ffffff',
        borderWidth: 2,
      }}
      onPress={() => onPurchase(pkg.id)}
      disabled={isLoading}
    >
      {/* Popular badge */}
      {pkg.popular && (
        <View className="absolute top-3 right-3 bg-blue-500 px-2 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">POPULAR</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {pkg.name}
          </Text>
          {pkg.description && (
            <Text className="text-sm text-gray-600">
              {pkg.description}
            </Text>
          )}
        </View>

        <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center ml-3">
          <Text className="text-yellow-600 text-lg">🪙</Text>
        </View>
      </View>

      {/* Token amount and pricing */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">
            {pkg.tokenAmount} Tokens
          </Text>

          <View className="flex-row items-center mt-1">
            {hasDiscount && (
              <Text className="text-sm text-gray-500 line-through mr-2">
                ${pkg.price}
              </Text>
            )}
            <Text className={`text-lg font-semibold ${hasDiscount ? 'text-green-600' : 'text-gray-900'}`}>
              ${discountedPrice.toFixed(2)}
            </Text>
            {hasDiscount && (
              <Text className="text-sm text-green-600 ml-2">
                {pkg.discount}% OFF
              </Text>
            )}
          </View>
        </View>

        {/* Purchase button */}
        <TouchableOpacity
          className={`px-4 py-2 rounded-lg ${
            pkg.popular
              ? 'bg-blue-500'
              : 'bg-gray-900'
          }`}
          onPress={() => onPurchase(pkg.id)}
          disabled={isLoading}
        >
          <Text className="text-white font-semibold">
            {isLoading ? '...' : 'Buy'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default PackageCard;
