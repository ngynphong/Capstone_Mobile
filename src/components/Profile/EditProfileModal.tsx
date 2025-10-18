import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { User } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/userService';
import { UpdateProfileRequest } from '../../types/userTypes';
import { useAppToast } from '../../utils/toast';

interface EditProfileModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  onClose,
  onProfileUpdated,
}) => {
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useAppToast();

  // Update local state when user prop changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setDob(user.dob || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData: UpdateProfileRequest = {
        firstName,
        lastName,
        dob,
      };

      await updateUserProfile(updateData);
      toast.success('Profile updated successfully!');

      // Refresh user data in AuthContext
      onProfileUpdated?.();

      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setDob(user?.dob || '');
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
          <Text className="text-white text-xl font-bold">Edit Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Form */}
        <ScrollView className="flex-1 px-6 py-6">
          <View className="mb-6">
            <Text className="text-gray-700 text-lg font-medium mb-3">First Name</Text>
            <TextInput
              className="border-2 border-gray-200 rounded-xl px-4 py-4 text-base bg-gray-50"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 text-lg font-medium mb-3">Last Name</Text>
            <TextInput
              className="border-2 border-gray-200 rounded-xl px-4 py-4 text-base bg-gray-50"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-8">
            <Text className="text-gray-700 text-lg font-medium mb-3">Date of Birth</Text>
            <TextInput
              className="border-2 border-gray-200 rounded-xl px-4 py-4 text-base bg-gray-50"
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            className="bg-[#3CBCB2] py-5 rounded-xl mb-6"
            onPress={handleUpdateProfile}
            disabled={isLoading}
          >
            <Text className="text-white text-center text-xl font-bold">
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
