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
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleChangeAvatar = () => {
    Alert.alert('Đổi ảnh đại diện', 'Chức năng thay đổi ảnh đại diện sẽ được phát triển sớm!');
  };

  const handleSettings = () => {
    Alert.alert('Cài đặt', 'Chức năng cài đặt sẽ được phát triển sớm!');
  };

  const handleSubscription = () => {
    Alert.alert('Gói đăng ký', 'Chức năng quản lý gói đăng ký sẽ được phát triển sớm!');
  };

  const handleSupport = () => {
    Alert.alert('Hỗ trợ', 'Chức năng hỗ trợ sẽ được phát triển sớm!');
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Chỉnh sửa hồ sơ',
      subtitle: 'Cập nhật nghề nghiệp',
      icon: '👤',
      onPress: () => setIsEditModalVisible(true),
    },
    {
      id: 'subscription',
      title: 'Gói đăng ký',
      subtitle: 'Quản lý gói đăng ký và thanh toán',
      icon: '💎',
      onPress: handleSubscription,
    },
    {
      id: 'change-password',
      title: 'Đổi mật khẩu',
      subtitle: 'Cập nhật mật khẩu tài khoản',
      icon: '🔒',
      onPress: () => setIsChangePasswordModalVisible(true),
    },
    {
      id: 'support',
      title: 'Hỗ trợ',
      subtitle: 'Liên hệ hỗ trợ và trợ giúp',
      icon: '📞',
      onPress: handleSupport,
    },
    {
      id: 'settings',
      title: 'Cài đặt',
      subtitle: 'Tùy chọn ứng dụng và thông báo',
      icon: '⚙️',
      onPress: handleSettings,
    },
    {
      id: 'logout',
      title: 'Đăng xuất',
      subtitle: 'Đăng xuất khỏi tài khoản',
      icon: '🚪',
      onPress: handleLogout,
      variant: 'danger' as const,
      showArrow: false,
    },

  ];

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Đang tải thông tin người dùng...</Text>
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
                Ngày sinh:
              </Text>
              <Text className="text-base font-medium text-gray-800">
                {user?.dob || 'Chưa cập nhật'}
              </Text>
            </View>

            {/* Occupation */}
            <View className="flex-row items-center">
              <Text className="text-sm font-semibold text-gray-600 flex-1">
                Nghề nghiệp:
              </Text>
              <Text className="text-base font-medium text-gray-800">
                {user.parentProfile?.occupation || 'Chưa cập nhật'}
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
