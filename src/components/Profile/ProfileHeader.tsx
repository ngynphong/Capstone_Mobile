import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { User } from '../../context/AuthContext';

interface ProfileHeaderProps {
  user: User;
  onChangeAvatar?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onChangeAvatar }) => {
  console.log('🎨 ProfileHeader rendering with user:', user);

  const getUserDisplayName = () => {
    if (user?.firstName || user?.lastName) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      console.log('👤 Display name:', name);
      return name;
    }
    const emailName = user?.email || 'User';
    console.log('👤 Fallback to email:', emailName);
    return emailName;
  };

  const getUserInitials = () => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    const initials = (first + last).toUpperCase() || 'U';
    console.log('🔤 User initials:', initials);
    return initials;
  };

  return (
    <View
      className="pt-16 pb-10 px-6 rounded-b-3xl"
      style={{
        backgroundColor: '#3CBCB2', // Fallback color
      }}
    >
      <View className="items-center">
        {/* Avatar */}
        <View className="relative mb-6">
          <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center border-4 border-white/30">
            {user?.avatar || user?.imgUrl ? (
              <Image
                source={{ uri: user.avatar || user.imgUrl }}
                className="w-28 h-28 rounded-full"
              />
            ) : (
              <Text className="text-white text-4xl font-bold">{getUserInitials()}</Text>
            )}
          </View>

          {/* Change Avatar Button */}
          <TouchableOpacity
            className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-lg"
            onPress={onChangeAvatar}
          >
            <Text className="text-[#3CBCB2] text-sm font-semibold">✏️</Text>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View className="items-center">
          <Text className="text-2xl font-bold text-white mb-2">
            {getUserDisplayName()}
          </Text>
          <Text className="text-white/80 text-base mb-2">{user?.email}</Text>

          {user?.roles && user.roles.length > 0 && (
            <View className="bg-white/20 px-4 py-2 rounded-full">
              <Text className="text-white text-sm font-medium">
                {user.roles.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;
