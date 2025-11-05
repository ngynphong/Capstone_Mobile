import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, BookOpen } from 'lucide-react-native';
import { Exam } from '../../types/examTypes';

interface ExamCardProps {
  exam: Exam;
  onPress: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            {exam.title}
          </Text>
          <Text className="text-sm text-gray-600">
            {exam.createdByName}
          </Text>
        </View>
      </View>

      {/* Description */}
      {exam.description && (
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {exam.description}
        </Text>
      )}

      {/* Stats */}
      <View className="flex-row items-center mb-4 gap-4">
        <View className="flex-row items-center">
          <BookOpen size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {exam.questionContents.length} câu hỏi
          </Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {exam.duration} phút
          </Text>
        </View>
      </View>

      {/* Subjects */}
      {exam.subjectNames.length > 0 && (
        <View className="mb-4">
          <Text className="text-xs text-gray-500 mb-1">Môn học:</Text>
          <View className="flex-row flex-wrap gap-1">
            {exam.subjectNames.slice(0, 3).map((subject, index) => (
              <View key={index} className="bg-gray-100 px-2 py-1 rounded">
                <Text className="text-xs text-gray-700">{subject}</Text>
              </View>
            ))}
            {exam.subjectNames.length > 3 && (
              <View className="bg-gray-100 px-2 py-1 rounded">
                <Text className="text-xs text-gray-700">+{exam.subjectNames.length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-600">
            {exam.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-500">
            {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExamCard;
