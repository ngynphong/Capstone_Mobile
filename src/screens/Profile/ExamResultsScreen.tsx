import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useScroll } from '../../context/ScrollContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamService } from '../../services/examService';
import { ExamAttempt, Exam } from '../../types/examTypes';
import { ProfileStackParamList } from '../../types/types';
import { ChevronLeft, Calendar, Clock, CheckCircle, Target } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

interface ExamResultsScreenProps {
  navigation: any;
}

const ExamResultsScreen: React.FC<ExamResultsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { handleScroll } = useScroll();
  const typedNavigation = useNavigation<NavigationProp>();
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [exams, setExams] = useState<Map<string, Exam>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExamResults();
  }, [user]);

  const loadExamResults = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const attempts = await ExamService.getUserExamAttempts(user.id);
      setExamAttempts(attempts);

      // Load exam details for each attempt
      const examMap = new Map<string, Exam>();
      for (const attempt of attempts) {
        if (!examMap.has(attempt.examId)) {
          const exam = await ExamService.getExamById(attempt.examId);
          if (exam) {
            examMap.set(attempt.examId, exam);
          }
        }
      }
      setExams(examMap);
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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

  const renderExamResult = (attempt: ExamAttempt) => {
    const exam = exams.get(attempt.examId);
    if (!exam) return null;

    return (
      <TouchableOpacity
        key={attempt.id}
        className={`bg-white rounded-xl p-4 mb-3 border ${getScoreBgColor(attempt.score)}`}
        onPress={() => {
          typedNavigation.navigate('ExamResultDetail', { attempt });
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {exam.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              {exam.subject.name} • {exam.level} • {exam.difficulty}
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
            <Calendar size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {formatDate(attempt.startTime)}
            </Text>
          </View>

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
        </View>

        {attempt.completed && (
          <View className="flex-row items-center mt-2">
            <CheckCircle size={16} color="#10B981" />
            <Text className="text-sm text-green-600 ml-1">Completed</Text>
          </View>
        )}
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
              {examAttempts
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .map(renderExamResult)}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ExamResultsScreen;
