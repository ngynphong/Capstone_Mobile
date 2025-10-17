import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import MenuSection from '../../components/Profile/MenuSection';
import EditProfileModal from '../../components/Profile/EditProfileModal';
import ChangePasswordModal from '../../components/Profile/ChangePasswordModal';

const ProfileScreen = () => {
  const { user, logout, refreshUser } = useAuth();
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
    // TODO: Implement avatar change functionality
    Alert.alert('Change Avatar', 'Avatar change functionality will be implemented soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings functionality will be implemented soon!');
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: '👤',
      onPress: () => setIsEditModalVisible(true),
    },
    {
      id: 'change-password',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: '🔒',
      onPress: () => setIsChangePasswordModalVisible(true),
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      icon: '⚙️',
      onPress: handleSettings,
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out from your account',
      icon: '🚪',
      onPress: handleLogout,
      variant: 'danger' as const,
      showArrow: false,
    },
  ];

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Loading user data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with gradient background */}
        <ProfileHeader
          user={user}
          onChangeAvatar={handleChangeAvatar}
        />

        {/* Menu Items */}
        <MenuSection items={menuItems} />
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={isEditModalVisible}
        user={user}
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

export default ProfileScreen;
