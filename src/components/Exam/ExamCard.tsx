import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Clock, Users, BookOpen, TrendingUp} from 'lucide-react-native';
import {Exam} from '../../types/examTypes';

interface ExamCardProps {
  exam: Exam;
  onPress: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({exam, onPress}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyDotColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100"
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
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
          <Text className="text-sm text-gray-600">Level {exam.level}</Text>
        </View>
        <View className="flex-row items-center">
          <View
            className={`w-2 h-2 rounded-full mr-2`}
            style={{backgroundColor: getDifficultyDotColor(exam.difficulty)}}
          />
          <Text
            className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(exam.difficulty)}`}
          >
            {exam.difficulty}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row items-center mb-4 gap-2">
        <View className="flex-row items-center">
          <BookOpen size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {exam.sentences} Sentences
          </Text>
        </View>
        <View className="flex-row items-center">
          <Users size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {exam.questions} Number
          </Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {exam.duration} Min
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mb-4">
        <View className="w-full bg-gray-200 rounded-full h-2">
          <View
            className="bg-teal-400 h-2 rounded-full"
            style={{width: `${Math.min(100, (exam.attempts || 0) / 5)}%`}}
          />
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <TrendingUp size={16} color="#3CBCB2" />
          <Text className="text-sm text-gray-600 ml-1">
            {exam.attempts || 0} people attempt
          </Text>
        </View>
        <TouchableOpacity className="bg-gray-100 px-4 py-2 rounded-lg">
          <Text className="text-sm font-medium text-gray-700">Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ExamCard;
