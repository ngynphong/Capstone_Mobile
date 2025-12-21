import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/userService';
import { ChangePasswordRequest } from '../../types/userTypes';
import { useAppToast } from '../../utils/toast';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useAppToast();
  const { logout } = useAuth();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken') || '';
      const passwordData: ChangePasswordRequest = {
        token,
        currentPassword,
        newPassword,
      };
      console.log('Password data', passwordData)
      await changePassword(passwordData);
      toast.success('Password changed successfully! Please login again with your new password.');

      // Close modal and logout user
      onClose();
      resetForm();

      // Logout user after successful password change
      setTimeout(() => {
        logout();
      }, 1500); // Delay to allow user to see the success toast
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-[#3CBCB2] px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-white text-lg">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Change Password</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Form */}
        <ScrollView className="flex-1 px-6 py-6">
          <View className="mb-6">
            <Text className="text-gray-700 text-lg font-medium mb-3">Current Password</Text>
            <View className="relative">
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className="text-gray-500 text-lg opacity-60">
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 text-lg font-medium mb-3">New Password</Text>
            <View className="relative">
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Text className="text-gray-500 text-lg opacity-60">
                  {showNewPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-gray-700 text-lg font-medium mb-3">Confirm New Password</Text>
            <View className="relative">
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text className="text-gray-500 text-lg opacity-60">
                  {showConfirmPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#3CBCB2] py-5 rounded-xl mb-6"
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text className="text-white text-center text-xl font-bold">
              {isLoading ? 'Changing...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    paddingRight: 48,
  },
});

export default ChangePasswordModal;
