import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useScroll } from '../../context/ScrollContext';
import { useNavigation } from '@react-navigation/native';
import { MockAttempt } from '../../types/examTypes';
import { ChevronLeft, Clock, CheckCircle, Target } from 'lucide-react-native';

interface ExamResultsScreenProps {
  navigation: any;
}

const ExamResultsScreen: React.FC<ExamResultsScreenProps> = ({ navigation }) => {
  const { handleScroll } = useScroll();
  const typedNavigation = useNavigation<any>();
  const [examAttempts, setExamAttempts] = useState<MockAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExamResults();
  }, []);

  const loadExamResults = async () => {
    try {
      setLoading(true);
      // Mock data for now since API doesn't provide exam attempts
      const mockAttempts: MockAttempt[] = [
        {
          examId: '1',
          score: 85,
          totalQuestions: 10,
          correctAnswers: 8,
          timeSpent: 450, // 7:30
        },
        {
          examId: '2',
          score: 92,
          totalQuestions: 15,
          correctAnswers: 14,
          timeSpent: 720, // 12:00
        },
        {
          examId: '3',
          score: 78,
          totalQuestions: 12,
          correctAnswers: 9,
          timeSpent: 380, // 6:20
        },
      ];
      setExamAttempts(mockAttempts);
    } catch (error) {
      console.error('Error loading exam results:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExamResults();
    setRefreshing(false);
  };

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

  const renderExamResult = (attempt: MockAttempt, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        className={`bg-white rounded-xl p-4 mb-3 border ${getScoreBgColor(attempt.score)}`}
        onPress={() => {
          typedNavigation.navigate('ExamResultDetail', { attempt });
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              Mock Exam {attempt.examId}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              Practice Session
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full border ${getScoreBgColor(attempt.score)}`}>
            <Text className={`text-sm font-semibold ${getScoreColor(attempt.score)}`}>
              {attempt.score}%
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Clock size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {formatTimeSpent(attempt.timeSpent)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Target size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {attempt.correctAnswers}/{attempt.totalQuestions}
            </Text>
          </View>

          <View className="flex-row items-center">
            <CheckCircle size={16} color="#10B981" />
            <Text className="text-sm text-green-600 ml-1">Completed</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Loading exam results...</Text>
      </View>
    );
  }

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
          <Text className="text-xl font-bold text-gray-900">Exam Results</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {examAttempts.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Target size={64} color="#D1D5DB" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              No Exam Results Yet
            </Text>
            <Text className="text-gray-600 text-center px-8">
              Complete your first exam to see your results here. Your progress will be tracked and displayed.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Stats */}
            <View className="bg-white rounded-xl p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Your Progress
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-teal-600">
                    {examAttempts.length}
                  </Text>
                  <Text className="text-sm text-gray-600">Total Exams</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-blue-600">
                    {Math.round(examAttempts.reduce((acc, attempt) => acc + attempt.score, 0) / examAttempts.length)}%
                  </Text>
                  <Text className="text-sm text-gray-600">Average Score</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {Math.max(...examAttempts.map(attempt => attempt.score))}%
                  </Text>
                  <Text className="text-sm text-gray-600">Best Score</Text>
                </View>
              </View>
            </View>

            {/* Exam Results List */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Recent Results
              </Text>
              {examAttempts.map((attempt, index) => renderExamResult(attempt, index))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ExamResultsScreen;
