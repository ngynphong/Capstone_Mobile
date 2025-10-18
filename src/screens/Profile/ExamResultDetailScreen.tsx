import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Award,
  TrendingUp,
} from 'lucide-react-native';

// import {useAuth} from '../../context/AuthContext';
import {useScroll} from '../../context/ScrollContext';
import {ExamService} from '../../services/examService';
import {ProfileStackParamList} from '../../types/types';
import {Exam, QuizAnswer, FRQAnswer} from '../../types/examTypes';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;
type RouteProps = RouteProp<ProfileStackParamList, 'ExamResultDetail'>;

const ExamResultDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const {attempt} = route.params;

  // const {user} = useAuth();
  const {handleScroll} = useScroll();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExamDetails();
  }, [attempt.examId]);

  const loadExamDetails = async () => {
    try {
      setLoading(true);
      const examData = await ExamService.getExamById(attempt.examId);
      if (examData) {
        setExam(examData);
      }
    } catch (error) {
      console.error('Error loading exam details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
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
    return "Keep studying and try again. You'll get better!";
  };

  const renderAnswer = (
    answer: QuizAnswer | FRQAnswer,
    index: number,
  ): React.ReactElement => {
    const isMCQ = 'selectedAnswer' in answer;

    return (
      <View
        key={answer.questionId}
        className="bg-white rounded-xl p-4 mb-3 border border-gray-100"
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-base font-medium text-gray-900 flex-1 mr-2">
            Question {index + 1}
          </Text>
          {isMCQ && (
            <View
              className={`px-2 py-1 rounded-full ${answer.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}
            >
              <Text
                className={`text-xs font-medium ${answer.isCorrect ? 'text-green-800' : 'text-red-800'}`}
              >
                {answer.isCorrect ? 'Correct' : 'Incorrect'}
              </Text>
            </View>
          )}
        </View>

        {isMCQ ? (
          <View className="mt-2">
            <Text className="text-sm text-gray-600 mb-1">
              Your answer:{' '}
              <Text className="font-medium">{answer.selectedAnswer}</Text>
            </Text>
            {!answer.isCorrect && (
              <Text className="text-sm text-green-600">
                This answer was incorrect
              </Text>
            )}
          </View>
        ) : (
          <View className="mt-2">
            <Text className="text-sm text-gray-600 mb-1">
              Your answer: <Text className="font-medium">{answer.answer}</Text>
            </Text>
            <Text className="text-xs text-gray-500">
              Word count: {answer.wordCount} • Time spent:{' '}
              {Math.floor(answer.timeSpent / 60)}m {answer.timeSpent % 60}s
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Loading exam details...</Text>
      </View>
    );
  }

  if (!exam) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Exam not found</Text>
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
          <Text className="text-xl font-bold text-gray-900">
            Exam Result Details
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{paddingTop: 16, paddingBottom: 100}}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Score Overview */}
        <View
          className={`bg-white rounded-xl p-6 mb-4 border ${getScoreBgColor(attempt.score)}`}
        >
          <View className="items-center mb-4">
            <View
              className={`w-20 h-20 rounded-full items-center justify-center mb-3 ${getScoreBgColor(attempt.score)}`}
            >
              <Award
                size={32}
                color={attempt.score >= 70 ? '#10B981' : '#EF4444'}
              />
            </View>
            <Text
              className={`text-3xl font-bold ${getScoreColor(attempt.score)}`}
            >
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
              <Calendar size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 mt-1">
                {formatDate(attempt.startTime)}
              </Text>
            </View>
            <View className="items-center flex-1">
              <Clock size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 mt-1">
                {formatTimeSpent(attempt.timeSpent)}
              </Text>
            </View>
            <View className="items-center flex-1">
              <TrendingUp size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 mt-1">
                {Math.round(
                  (attempt.correctAnswers / attempt.totalQuestions) * 100,
                )}
                % Accuracy
              </Text>
            </View>
          </View>
        </View>

        {/* Exam Information */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Exam Information
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Title:</Text>
              <Text className="text-gray-900 font-medium">{exam.title}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subject:</Text>
              <Text className="text-gray-900 font-medium">
                {exam.subject.name}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Level:</Text>
              <Text className="text-gray-900 font-medium">{exam.level}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Difficulty:</Text>
              <Text className="text-gray-900 font-medium">
                {exam.difficulty}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Duration:</Text>
              <Text className="text-gray-900 font-medium">
                {exam.duration} minutes
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Answers */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Question Breakdown
          </Text>
          {attempt.answers.length === 0 ? (
            <Text className="text-gray-600 text-center py-4">
              No detailed answers available
            </Text>
          ) : (
            attempt.answers.map((answer, index) => renderAnswer(answer, index))
          )}
        </View>

        {/* Tips for Improvement */}
        {attempt.score < 70 && (
          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              💡 Tips for Improvement:
            </Text>
            <Text className="text-sm text-blue-700">
              • Review the topics you missed and practice similar questions
              {'\n'}• Take more time to understand each question before
              answering{'\n'}• Consider reviewing the subject material before
              retaking the exam
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ExamResultDetailScreen;
