import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Clock, BookOpen } from 'lucide-react-native';
import { Exam, ExamTemplate } from '../../types/examTypes';

interface ExamCardProps {
  exam: Exam | ExamTemplate;
  onPress: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onPress }) => {
  // Helper functions to handle different exam types
  const getCreatedBy = (exam: Exam | ExamTemplate) => {
    return 'createdByName' in exam ? exam.createdByName : exam.createdBy;
  };

  const getQuestionCount = (exam: Exam | ExamTemplate) => {
    return 'questionContents' in exam
      ? exam.questionContents.length
      : exam.rules.reduce((sum, rule) => sum + rule.numberOfQuestions, 0);
  };

  const getSubjectNames = (exam: Exam | ExamTemplate) => {
    return 'subjectNames' in exam ? exam.subjectNames : [exam.subject.name];
  };

  const getCreatedAt = (exam: Exam | ExamTemplate) => {
    return 'createdAt' in exam ? exam.createdAt : exam.createdAt || '';
  };

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
            {getCreatedBy(exam)}
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
            {getQuestionCount(exam)} câu hỏi
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
      {getSubjectNames(exam).length > 0 && (
        <View className="mb-4">
          <Text className="text-xs text-gray-500 mb-1">Môn học:</Text>
          <View className="flex-row flex-wrap gap-1">
            {getSubjectNames(exam).slice(0, 3).map((subject, index) => (
              <View key={index} className="bg-gray-100 px-2 py-1 rounded">
                <Text className="text-xs text-gray-700">{subject}</Text>
              </View>
            ))}
            {getSubjectNames(exam).length > 3 && (
              <View className="bg-gray-100 px-2 py-1 rounded">
                <Text className="text-xs text-gray-700">+{getSubjectNames(exam).length - 3}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {exam.tokenCost ? (
        <View className="mb-4">
          <Text className="text-xs text-gray-500 mb-1">Token Cost:</Text>
          <Text className="text-sm text-gray-600">{exam.tokenCost} 💰</Text>
        </View>
      ) :
        <View className="mb-4">
          <Text className="text-xs text-gray-500 mb-1">Token Cost:</Text>
          <Text className="text-sm text-gray-600">Free</Text>
        </View>}

      {/* Footer */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-600">Status:</Text>
          <Text className={`text-sm ml-2 px-2 py-1 rounded-full ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {exam.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-500">
            {getCreatedAt(exam) && getCreatedAt(exam) !== '' ? new Date(getCreatedAt(exam)!).toLocaleDateString('vi-VN') : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ExamCard;
