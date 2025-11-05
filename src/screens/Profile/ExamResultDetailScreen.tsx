import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Calendar, Clock, CheckCircle, Target, Award, TrendingUp } from 'lucide-react-native';

import { useScroll } from '../../context/ScrollContext';
import { ExamService } from '../../services/examService';
import { MockAttempt } from '../../types/examTypes';

const ExamResultDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { attempt } = route.params as { attempt: MockAttempt };

  const { handleScroll } = useScroll();

  const formatTimeSpent = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return 'Excellent work! Outstanding performance.';
    if (score >= 80) return 'Great job! You have a solid understanding.';
    if (score >= 70) return 'Good effort! Keep practicing to improve.';
    return 'Keep studying and try again. You\'ll get better!';
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Exam Result Details</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Score Overview */}
        <View className={`bg-white rounded-xl p-6 mb-4 border ${getScoreBgColor(attempt.score)}`}>
          <View className="items-center mb-4">
            <View className={`w-20 h-20 rounded-full items-center justify-center mb-3 ${getScoreBgColor(attempt.score)}`}>
              <Award size={32} color={attempt.score >= 70 ? '#10B981' : '#EF4444'} />
            </View>
            <Text className={`text-3xl font-bold ${getScoreColor(attempt.score)}`}>
              {attempt.score}%
            </Text>
            <Text className="text-gray-600 text-center mt-1">
              {attempt.correctAnswers} out of {attempt.totalQuestions} correct
            </Text>
          </View>

          <Text className="text-center text-gray-700 mb-4">
            {getPerformanceMessage(attempt.score)}
          </Text>

          {/* Quick Stats */}
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Clock size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 mt-1">
                {formatTimeSpent(attempt.timeSpent)}
              </Text>
            </View>
            <View className="items-center flex-1">
              <Target size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 mt-1">
                {Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100)}% Accuracy
              </Text>
            </View>
            <View className="items-center flex-1">
              <CheckCircle size={20} color="#10B981" />
              <Text className="text-sm text-gray-600 mt-1">
                Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Performance Analysis */}
        <View className="bg-white rounded-xl p-6 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">Total Questions</Text>
              <Text className="font-semibold text-gray-900">{attempt.totalQuestions}</Text>
            </View>

            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">Correct Answers</Text>
              <Text className="font-semibold text-green-600">{attempt.correctAnswers}</Text>
            </View>

            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">Incorrect Answers</Text>
              <Text className="font-semibold text-red-600">{attempt.totalQuestions - attempt.correctAnswers}</Text>
            </View>

            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">Time Spent</Text>
              <Text className="font-semibold text-gray-900">{formatTimeSpent(attempt.timeSpent)}</Text>
            </View>
          </View>
        </View>

        {/* Tips for Improvement */}
        {attempt.score < 70 && (
          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Improvement:</Text>
            <Text className="text-sm text-blue-700">
              • Review the topics you missed and practice similar questions{'\n'}
              • Take more time to understand each question before answering{'\n'}
              • Consider reviewing the subject material before retaking the exam
            </Text>
          </View>
        )}

        {/* Action Button */}
        <View className="mb-8">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-teal-400 py-4 rounded-xl"
          >
            <Text className="text-white font-bold text-center text-lg">
              Back to Results
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ExamResultDetailScreen;
