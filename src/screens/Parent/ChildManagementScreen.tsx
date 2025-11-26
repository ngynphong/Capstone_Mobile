import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useParent } from '../../hooks/useParent';
import {
  Plus,
  UserMinus,
  Mail,
  Key,
  Check,
  Users,
  X,
  Info,
  Award,
  BookOpen,
} from 'lucide-react-native';
import { useAppToast } from '../../utils/toast';

const ChildManagementScreen = () => {
  const {
    children,
    loading,
    fetchChildren,
    linkStudent,
    unlinkStudent,
  } = useParent();
  const [linkingModalVisible, setLinkingModalVisible] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [connectionCode, setConnectionCode] = useState('');
  const [linkingLoading, setLinkingLoading] = useState(false);
  const toast = useAppToast();

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleLinkStudent = async () => {
    if (!studentEmail.trim() || !connectionCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mã kết nối');
      return;
    }

    setLinkingLoading(true);
    try {
      const success = await linkStudent(studentEmail.trim(), connectionCode.trim());
      if (success) {
        setStudentEmail('');
        setConnectionCode('');
        setLinkingModalVisible(false);
        await fetchChildren(); // Refresh the list
      }
    } finally {
      setLinkingLoading(false);
    }
  };

  const handleUnlinkStudent = (email: string, studentName: string) => {
    Alert.alert(
      'Xác nhận hủy liên kết',
      `Bạn có chắc muốn hủy liên kết với học sinh ${studentName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkStudent(email);
              await fetchChildren(); // Refresh the list
            } catch (error) {
              console.error('Error unlinking student:', error);
            }
          },
        },
      ]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Gradient */}
      <View
        style={{ backgroundColor: '#3CBCB2' }}
        className="px-6 pt-4 pb-6 rounded-b-3xl shadow-lg"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-white/70 text-xs font-medium uppercase tracking-wider">
              Quản lý
            </Text>
            <Text className="text-white text-3xl font-bold mt-2 mb-1">
              Học sinh
            </Text>
            <Text className="text-white/80 text-sm leading-5">
              Liên kết và quản lý{'\n'}tài khoản học sinh
            </Text>
          </View>
          <TouchableOpacity
            className="bg-white px-5 py-3 rounded-xl flex-row items-center shadow-md"
            onPress={() => setLinkingModalVisible(true)}
          >
            <Plus size={20} color="#3CBCB2" />
            <Text className="text-teal-600 font-bold ml-2">Liên kết</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#3CBCB2" />
            <Text className="text-gray-500 mt-4">Đang tải...</Text>
          </View>
        ) : children.length === 0 ? (
          <View className="items-center py-12">
            <LinearGradient
              colors={['#3CBCB2', '#2A9D8F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
            >
              <Users size={48} color="white" />
            </LinearGradient>
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              Chưa có học sinh nào
            </Text>
            <Text className="text-gray-600 text-center mb-6 px-8">
              Bắt đầu bằng cách nhấn nút "Liên kết" để kết nối với tài khoản học sinh của con bạn.
            </Text>
            <TouchableOpacity
              className="bg-teal-500 px-6 py-3 rounded-xl flex-row items-center shadow-md"
              onPress={() => setLinkingModalVisible(true)}
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Liên kết học sinh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="py-6">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              📚 Học sinh đã liên kết ({children.length})
            </Text>
            <View className="space-y-4">
              {children.map((child) => (
                <View
                  key={child.studentId}
                 
                  className="bg-white rounded-2xl p-4 shadow-md"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Image
                        source={{ uri: child.avatarUrl || 'https://via.placeholder.com/100' }}
                        className="w-14 h-14 rounded-full mr-3"
                      />
                      <View className="flex-1">
                        <Text className="font-bold text-gray-800 text-base">{child.studentName}</Text>
                        <Text className="text-sm text-gray-500 mt-0.5">{child.email}</Text>
                        <View className="flex-row items-center mt-2 space-x-2">
                          <View className="bg-blue-50 px-2 py-1 rounded-full flex-row items-center">
                            <BookOpen size={12} color="#3B82F6" />
                            <Text className="text-xs text-blue-600 ml-1 font-medium">
                              {child.totalExamsTaken} bài
                            </Text>
                          </View>
                          <View
                            className="px-2 py-1 rounded-full flex-row items-center"
                            style={{ backgroundColor: `${getScoreColor(child.averageScore)}20` }}
                          >
                            <Award size={12} color={getScoreColor(child.averageScore)} />
                            <Text
                              className="text-xs ml-1 font-semibold"
                              style={{ color: getScoreColor(child.averageScore) }}
                            >
                              {child.averageScore}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="bg-red-50 p-3 rounded-full ml-2"
                      onPress={() => handleUnlinkStudent(child.email, child.studentName)}
                    >
                      <UserMinus size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Link Student Modal */}
      <Modal
        visible={linkingModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLinkingModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl px-6 py-8">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-gray-800">
                    Liên kết học sinh 🔗
                  </Text>
                  <Text className="text-gray-600 mt-1">
                    Nhập thông tin để kết nối
                  </Text>
                </View>
                <TouchableOpacity
                  className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                  onPress={() => setLinkingModalVisible(false)}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Info Banner */}
              <View className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-6 flex-row">
                <Info size={20} color="#3CBCB2" />
                <Text className="text-sm text-teal-700 ml-2 flex-1">
                  Học sinh cần chia sẻ mã kết nối từ cài đặt tài khoản của họ
                </Text>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Email học sinh *
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <Mail size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base"
                    placeholder="student@example.com"
                    value={studentEmail}
                    onChangeText={setStudentEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Connection Code Input */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Mã kết nối *
                </Text>
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <Key size={20} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-3 text-base font-mono"
                    placeholder="Nhập mã kết nối"
                    value={connectionCode}
                    onChangeText={setConnectionCode}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
                  onPress={() => setLinkingModalVisible(false)}
                  disabled={linkingLoading}
                >
                  <Text className="text-gray-700 font-semibold">Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-4 rounded-xl items-center flex-row justify-center"
                  onPress={handleLinkStudent}
                  disabled={linkingLoading}
                  style={{ backgroundColor: linkingLoading ? '#9CA3AF' : '#3CBCB2' }}
                >
                  {linkingLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Check size={20} color="white" />
                      <Text className="text-white font-semibold ml-2">Liên kết</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default ChildManagementScreen;
