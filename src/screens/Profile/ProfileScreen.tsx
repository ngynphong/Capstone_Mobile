import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Modal, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useScroll } from '../../context/ScrollContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/types';
import ProfileHeader from '../../components/Profile/ProfileHeader';
import MenuSection from '../../components/Profile/MenuSection';
import EditProfileModal from '../../components/Profile/EditProfileModal';
import ChangePasswordModal from '../../components/Profile/ChangePasswordModal';
import { useStudentConnection } from '../../hooks/useStudentConnection';
import { useStudent } from '../../hooks/useStudent';
import {
  User,
  Wallet,
  Lock,
  BarChart3,
  PiggyBank,
  FileText,
  Link,
  Settings,
  LogOut,
  School,
  Phone,
  Goal,
  Bell,
} from 'lucide-react-native';
import { useNotifications } from '../../hooks/useNotifications';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout, refreshUser } = useAuth();
  const { handleScroll } = useScroll();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isConnectionCodeModalVisible, setIsConnectionCodeModalVisible] = useState(false);
  const [isStudentProfileModalVisible, setIsStudentProfileModalVisible] = useState(false);
  const { connectionCode, loading: connectionLoading, fetchConnectionCode } = useStudentConnection();
  const { updateStudentProfile, loading: studentLoading } = useStudent();
  const { unreadCount } = useNotifications();

  // Student profile edit fields
  const [studentSchoolName, setStudentSchoolName] = useState('');
  const [studentEmergencyContact, setStudentEmergencyContact] = useState('');
  const [studentParentPhone, setStudentParentPhone] = useState('');
  const [studentGoal, setStudentGoal] = useState('');

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

  const handleConnectionCode = async () => {
    await fetchConnectionCode();
    setIsConnectionCodeModalVisible(true);
  };

  const handleSaveStudentProfile = async () => {
    try {
      await updateStudentProfile({
        schoolName: studentSchoolName,
        emergencyContact: studentEmergencyContact,
        parentPhone: studentParentPhone,
        goal: studentGoal,
      });
      await refreshUser();
      setIsStudentProfileModalVisible(false);
    } catch (error) {
      console.error('Failed to update student profile:', error);
    }
  };

  React.useEffect(() => {
    if (isStudentProfileModalVisible && user?.studentProfile) {
      setStudentSchoolName(user.studentProfile.schoolName);
      setStudentEmergencyContact(user.studentProfile.emergencyContact);
      setStudentParentPhone(user.studentProfile.parentPhone);
      setStudentGoal(user.studentProfile.goal);
    }
  }, [isStudentProfileModalVisible, user?.studentProfile]);

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: <User size={20} color="#3CBCB2" />,
      onPress: () => setIsEditModalVisible(true),
    },
    {
      id: 'my-wallet',
      title: 'My Wallet',
      subtitle: 'Manage tokens and subscription',
      icon: <Wallet size={20} color="#3CBCB2" />,
      onPress: () => navigation.navigate('Store'),
    },
    {
      id: 'change-password',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: <Lock size={20} color="#3CBCB2" />,
      onPress: () => setIsChangePasswordModalVisible(true),
    },
    {
      id: 'exam-stats',
      title: 'Exam Statistics',
      subtitle: 'View your exam performance and progress',
      icon: <BarChart3 size={20} color="#3CBCB2" />,
      onPress: () => navigation.navigate('StudentExamStats'),
    },
    {
      id: 'financial-stats',
      title: 'Financial Statistics',
      subtitle: 'View your spending and purchase history',
      icon: <PiggyBank size={20} color="#3CBCB2" />,
      onPress: () => navigation.navigate('StudentFinancialStats'),
    },
    {
      id: 'exam',
      title: 'Exams',
      subtitle: 'Do Exams and view results',
      icon: <FileText size={20} color="#3CBCB2" />,
      onPress: () => navigation.navigate('ExamResults'),
    },
    {
      id: 'connection-code',
      title: 'Connection Code',
      subtitle: 'Share your code with parents to connect',
      icon: <Link size={20} color="#3CBCB2" />,
      onPress: handleConnectionCode,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'View all notifications',
      icon: <Bell size={20} color="#3CBCB2" />,
      onPress: () => navigation.navigate('Notifications'),
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      icon: <Settings size={20} color="#3CBCB2" />,
      onPress: handleSettings,
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out from your account',
      icon: <LogOut size={20} color="#EF4444" />,
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
    <View className="flex-1 bg-gray-50 mb-10">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll} // scroll behavior 
        scrollEventThrottle={16} // scroll behavior 
      >
        {/* Header with gradient background */}
        <ProfileHeader
          user={user}
          onChangeAvatar={handleChangeAvatar}
        />

        {/* Student Profile Card - only show for students */}
        {user.studentProfile && (
          <View className="mx-6 mt-4 mb-2">
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <Text className="text-lg font-bold text-gray-800 mb-4">Student Profile</Text>

              <View className="space-y-3">
                <View className="flex-row items-center gap-2 py-2">
                  <School size={20} color="#3CBCB2" />
                  <Text className="text-gray-600 flex-1">School Name</Text>
                  <Text className="text-gray-800 font-medium">{user.studentProfile.schoolName}</Text>
                </View>
                <View className="flex-row items-center gap-2 py-2">
                  <Phone size={20} color="#3CBCB2" />
                  <Text className="text-gray-600 flex-1">Emergency Contact</Text>
                  <Text className="text-gray-800 font-medium">{user.studentProfile.emergencyContact}</Text>
                </View>
                <View className="flex-row items-center gap-2 py-2">
                  <Phone size={20} color="#3CBCB2" />
                  <Text className="text-gray-600 flex-1">Parent Phone</Text>
                  <Text className="text-gray-800 font-medium">{user.studentProfile.parentPhone}</Text>
                </View>
                <View className="flex-row items-center gap-2 py-2">
                  <View className="flex-row items-center gap-2 w-[20%]">
                    <Goal size={20} color="#3CBCB2" />
                    <Text className="text-gray-600 flex-1">Goal</Text>
                  </View>
                  {user.studentProfile.goal ? (
                    <Text className="text-gray-800 font-medium">{user.studentProfile.goal}</Text>
                  ) : (
                    <Text className="text-gray-600">What result do you want to achieve ?</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                className="bg-teal-500 py-3 px-4 rounded-xl items-center mt-4"
                onPress={() => setIsStudentProfileModalVisible(true)}
              >
                <Text className="text-white font-semibold">Edit Information</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <MenuSection items={menuItems} />
      </ScrollView>

      {/* Student Profile Edit Modal */}
      <Modal
        visible={isStudentProfileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsStudentProfileModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-center px-6">
            <View className="bg-white rounded-xl p-6 max-h-[85%]">
              <Text className="text-xl font-bold text-gray-800 mb-6 text-center">
                Edit Student Profile
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Form fields will go here */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">School Name</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Enter school name"
                    value={studentSchoolName}
                    onChangeText={setStudentSchoolName}
                  />

                  <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">Emergency Contact</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Enter emergency contact"
                    value={studentEmergencyContact}
                    onChangeText={setStudentEmergencyContact}
                  // keyboardType="number-pad"
                  />

                  <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">Parent Phone</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Enter parent phone"
                    value={studentParentPhone}
                    onChangeText={setStudentParentPhone}
                  // keyboardType="phone-pad"
                  />

                  <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">Goal</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Enter goal"
                    value={studentGoal}
                    onChangeText={setStudentGoal}
                  />
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
                    onPress={() => setIsStudentProfileModalVisible(false)}
                  >
                    <Text className="text-gray-700 font-medium">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-teal-500 py-3 rounded-xl items-center"
                    onPress={handleSaveStudentProfile}
                    disabled={studentLoading}
                  >
                    {studentLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-medium">Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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

      {/* Connection Code Modal */}
      <Modal
        visible={isConnectionCodeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsConnectionCodeModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 py-8">
            <View className="items-center mb-6">
              <Text className="text-xl font-bold text-gray-800 mb-2">Connection Code</Text>
              <Text className="text-gray-600 text-center">
                Share this code with your parent to connect your account
              </Text>
            </View>

            {connectionLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#3CBCB2" />
                <Text className="text-gray-500 mt-4">Loading connection code...</Text>
              </View>
            ) : connectionCode ? (
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-3">
                  Your connection code:
                </Text>
                <View className="bg-gray-100 rounded-xl p-6 items-center">
                  <Text className="text-3xl font-bold text-teal-600 mb-2">
                    {connectionCode}
                  </Text>
                  <Text className="text-gray-600 text-center text-sm">
                    Request your parent to enter this code when connecting your account
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center py-8">
                <Text className="text-gray-500">Unable to load connection code</Text>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-200 py-3 rounded-xl items-center"
                onPress={() => setIsConnectionCodeModalVisible(false)}
              >
                <Text className="text-gray-700 font-medium">Close</Text>
              </TouchableOpacity>
              {connectionCode && (
                <TouchableOpacity className="flex-1 bg-teal-500 py-3 rounded-xl items-center flex-row justify-center">
                  <Text className="text-white font-medium">Share</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
