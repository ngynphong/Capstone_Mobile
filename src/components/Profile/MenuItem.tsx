import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface MenuItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'danger';
  showArrow?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  variant = 'default',
  showArrow = true,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          borderWidth: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <TouchableOpacity
      className="mx-6 mb-3 p-5 rounded-2xl"
      style={getVariantStyles()}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {icon && (
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(60, 188, 178, 0.1)' }}>
              {typeof icon === 'string' ? <Text className="text-xl">{icon}</Text> : icon}
            </View>
          )}
          <View className="flex-1">
            <Text className={`text-base font-semibold ${getTextColor()}`}>
              {title}
            </Text>
            {subtitle && (
              <Text className="text-gray-500 text-sm mt-0.5">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {showArrow && (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MenuItem;

