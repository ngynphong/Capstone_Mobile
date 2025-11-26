import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useParent } from '../../hooks/useParent';
import { ChildInfo } from '../../types/parent';
import { UserMinus } from 'lucide-react-native';

const ChildProgressScreen = () => {
  const { children, loading, fetchChildren, examHistory, loadingHistory, fetchChildExamHistory, unlinkStudent } = useParent();
  const [selectedChild, setSelectedChild] = useState<ChildInfo | null>(null);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleChildSelect = (child: ChildInfo) => {
    setSelectedChild(child);
    fetchChildExamHistory(child.studentId, 0, 10);
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
              // Clear selection if unlinked child was selected
              if (selectedChild?.email === email) {
                setSelectedChild(null);
              }
            } catch (error) {
              console.error('Error unlinking student:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={{ backgroundColor: '#3CBCB2' }} className="px-6 pt-4 pb-6 rounded-b-3xl shadow-lg">
        <Text className="text-white/70 text-xs font-medium uppercase tracking-wider">
          Theo dõi
        </Text>
        <Text className="text-white text-3xl font-bold mt-2 mb-1">
          Báo cáo tiến độ
        </Text>
        <Text className="text-white/80 text-sm leading-5">
          Chi tiết kết quả học tập của con bạn
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3CBCB2" />
          <Text className="text-gray-600 mt-4">Đang tải danh sách học sinh...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
          {children.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-2xl font-bold text-gray-800 mb-4">📊 Báo cáo</Text>
              <Text className="text-gray-600 text-center leading-6">
                Chưa có học sinh nào được liên kết để xem báo cáo.
              </Text>
            </View>
          ) : (
            <View>
              <Text className="text-lg font-bold text-gray-800 mb-4">
                📝 Danh sách học sinh ({children.length})
              </Text>
              {children.map((child, index) => (
                <TouchableOpacity
                  key={child.studentId}
                  className={`rounded-2xl p-4 mb-3 shadow-sm ${
                    selectedChild?.studentId === child.studentId ? 'bg-teal-50 border-2 border-teal-200' : 'bg-white'
                  }`}
                  onPress={() => handleChildSelect(child)}
                >
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: child.avatarUrl || 'https://via.placeholder.com/100' }}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800 text-base">{child.studentName}</Text>
                      <Text className="text-sm text-gray-500">{child.email}</Text>
                      <Text className="text-xs text-gray-400 mt-1">
                        Bài thi: {child.totalExamsTaken} | Điểm TB: {child.averageScore}%
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="bg-red-50 p-3 rounded-full ml-2"
                      onPress={() => handleUnlinkStudent(child.email, child.studentName)}
                    >
                      <UserMinus size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}

              {selectedChild && (
                <View className="mt-6">
                  <Text className="text-lg font-bold text-gray-800 mb-4">
                    📝 Lịch sử bài thi - {selectedChild.studentName}
                  </Text>

                  {loadingHistory ? (
                    <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                      <ActivityIndicator size="large" color="#3CBCB2" />
                      <Text className="text-gray-500 mt-4">Đang tải lịch sử...</Text>
                    </View>
                  ) : examHistory.length === 0 ? (
                    <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                      <Text className="text-gray-500 text-center">
                        Chưa có bài thi nào được ghi lại.
                      </Text>
                    </View>
                  ) : (
                    examHistory.map((item, index) => (
                      <View key={item.attemptId} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="font-bold text-gray-800 text-base flex-1">
                            Bài thi #{item.examId.slice(0, 8)}
                          </Text>
                          <Text
                            style={{
                              color: item.score >= 80 ? '#10B981' : item.score >= 60 ? '#F59E0B' : '#EF4444',
                              fontSize: 18,
                              fontWeight: 'bold',
                            }}
                          >
                            {item.score} Point
                          </Text>
                        </View>
                        <Text className="text-sm text-gray-600">
                          Mã attempt: {item.attemptId.slice(0, 8)}
                        </Text>
                        <Text className="text-sm text-gray-500 mt-1">
                          Bắt đầu: {new Date(item.startTime).toLocaleString('vi-VN')}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          Kết thúc: {item.endTime ? new Date(item.endTime).toLocaleString('vi-VN') : 'Chưa kết thúc'}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          Người làm: {item.doneBy}
                        </Text>
                        <View className="flex-row justify-between items-center mt-2">
                          <View
                            className="px-3 py-1 rounded-full"
                            style={{
                              backgroundColor: item.status === 'COMPLETED' ? '#D1FAE5' : '#FEE2E2',
                            }}
                          >
                            <Text
                              className="text-xs font-medium"
                              style={{
                                color: item.status === 'COMPLETED' ? '#059669' : '#DC2626',
                              }}
                            >
                              {item.status}
                            </Text>
                          </View>
                          {item.rating > 0 && (
                            <Text className="text-sm">⭐ {item.rating}</Text>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ChildProgressScreen;
