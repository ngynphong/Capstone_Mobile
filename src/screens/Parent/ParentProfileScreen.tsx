import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useScroll } from '../../context/ScrollContext';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import MenuSection from '../../components/Profile/MenuSection';
import EditParentProfileModal from '../../components/Parent/EditParentProfileModal';
import ChangePasswordModal from '../../components/Profile/ChangePasswordModal';

const ParentProfileScreen = () => {
  const { user, logout, refreshUser } = useAuth();
  const { handleScroll } = useScroll();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);

  const handleProfileUpdated = async () => {
    try {
      await refreshUser();
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleChangeAvatar = () => {
    Alert.alert('Change avatar', 'The change avatar feature will be developed soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'The settings feature will be developed soon!');
  };

  const handleSubscription = () => {
    Alert.alert('Subscription', 'The subscription feature will be developed soon!');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'The support feature will be developed soon!');
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit profile',
      subtitle: 'Update your occupation',
      icon: '👤',
      onPress: () => setIsEditModalVisible(true),
    },
    {
      id: 'subscription',
      title: 'Subscription',
      subtitle: 'Manage your subscription and payment',
      icon: '💎',
      onPress: handleSubscription,
    },
    {
      id: 'change-password',
      title: 'Change password',
      subtitle: 'Update your password',
      icon: '🔒',
      onPress: () => setIsChangePasswordModalVisible(true),
    },
    {
      id: 'support',
      title: 'Support',
      subtitle: 'Contact support and help',
      icon: '📞',
      onPress: handleSupport,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App options and notifications',
      icon: '⚙️',
      onPress: handleSettings,
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Logout from account',
      icon: '🚪',
      onPress: handleLogout,
      variant: 'danger' as const,
      showArrow: false,
    },

  ];

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Loading user information...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 mb-10">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header with gradient background */}
        <ProfileHeader
          user={user}
          onChangeAvatar={handleChangeAvatar}
        />

        {/* Additional Profile Info */}
        <View className="px-6 pb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm">

            {/* Date of Birth */}
            <View className="flex-row items-center mb-4">
              <Text className="text-sm font-semibold text-gray-600 flex-1">
                Date of Birth:
              </Text>
              <Text className="text-base font-medium text-gray-800">
                {user?.dob || 'Not updated'}
              </Text>
            </View>

            {/* Occupation */}
            <View className="flex-row items-center">
              <Text className="text-sm font-semibold text-gray-600 flex-1">
                Occupation:
              </Text>
              <Text className="text-base font-medium text-gray-800">
                {user.parentProfile?.occupation || 'Not updated'}
              </Text>
            </View>

          </View>
        </View>

        {/* Menu Items */}
        <MenuSection items={menuItems} />
      </ScrollView>

      {/* Modals */}
      <EditParentProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      <ChangePasswordModal
        visible={isChangePasswordModalVisible}
        onClose={() => setIsChangePasswordModalVisible(false)}
      />
    </View>
  );
};

export default ParentProfileScreen;
