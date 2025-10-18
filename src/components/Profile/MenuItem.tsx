import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

interface MenuItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
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
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      default:
        return {
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
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
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            {icon && <Text className="text-lg mr-3">{icon}</Text>}
            <Text className={`text-lg font-semibold ${getTextColor()}`}>
              {title}
            </Text>
          </View>

          {subtitle && (
            <Text className="text-gray-600 text-sm ml-0 mt-1">{subtitle}</Text>
          )}
        </View>

        {showArrow && <Text className="text-gray-400 text-lg">›</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default MenuItem;
