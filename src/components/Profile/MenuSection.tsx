import React from 'react';
import { View } from 'react-native';
import MenuItem from './MenuItem';

interface MenuItemData {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  onPress: () => void;
  variant?: 'default' | 'danger';
  showArrow?: boolean;
}

interface MenuSectionProps {
  items: MenuItemData[];
}

const MenuSection: React.FC<MenuSectionProps> = ({ items }) => {
  return (
    <View className="mt-6">
      {items.map((item) => (
        <MenuItem
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          icon={item.icon}
          onPress={item.onPress}
          variant={item.variant}
          showArrow={item.showArrow}
        />
      ))}
    </View>
  );
};

export default MenuSection;
