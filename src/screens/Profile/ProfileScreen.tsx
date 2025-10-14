import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = () => {
  const { logout } = useAuth();
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Profile Screen</Text>
      <View>
        <TouchableOpacity onPress={logout} className='bg-red-500 p-4 rounded-md'>
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;