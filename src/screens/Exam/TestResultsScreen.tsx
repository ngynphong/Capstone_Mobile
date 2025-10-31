import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock, Award, Target, TrendingUp, Star } from 'lucide-react-native';

import { ExamAttempt, ExamStackParamList, Question } from '../../types/examTypes';
import { useScroll } from '../../context/ScrollContext';
import { useAppToast } from '../../utils/toast';

type NavigationProp = NativeStackNavigationProp<ExamStackParamList>;
type RouteProps = RouteProp<ExamStackParamList, 'TestResults'>;

interface ResultsData {
  attempt: ExamAttempt;
  questions: Question[];
  examTitle: string;
  examLevel: string;
}

const TestResultsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { attempt } = route.params;

  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hasRated, setHasRated] = useState(false);

  const { handleScroll } = useScroll();
  const toast = useAppToast();

  useEffect(() => {
    loadResultsData();
  }, [attempt]);

  const loadResultsData = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch the exam details and questions here
      // For now, we'll use mock data based on the attempt
      const mockResultsData: ResultsData = {
        attempt,
        questions: [], // Would be loaded from API
        examTitle: 'Full Test',
        examLevel: 'B1',
      };
      setResultsData(mockResultsData);
    } catch (error) {
      console.error('Error loading results data:', error);
      Alert.alert('Error', 'Failed to load results data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate results statistics
  const calculateStats = () => {
    if (!resultsData) return null;

    const { attempt } = resultsData;
    const totalQuestions = attempt.totalQuestions;
    const correctAnswers = attempt.correctAnswers;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      scorePercentage,
      timeSpent: attempt.timeSpent,
    };
  };

  // Get performance level
  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Xuất sắc', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 80) return { level: 'Giỏi', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 70) return { level: 'Khá', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (percentage >= 60) return { level: 'Trung bình', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { level: 'Cần cố gắng', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  // Handle rating submission
  const handleSubmitRating = () => {
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    // Mock submission
    setHasRated(true);
    toast.success('Cảm ơn bạn đã đánh giá!');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Loading results...</Text>
      </View>
    );
  }

  if (!resultsData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">No results data available</Text>
      </View>
    );
  }

  const stats = calculateStats();
  const performance = stats ? getPerformanceLevel(stats.scorePercentage) : null;

  if (!stats || !performance) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Error calculating results</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center"
          >
            <ArrowLeft size={24} color="#374151" />
            <Text className="text-gray-700 ml-2">Quay lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ExamLibrary')}
            className="flex-row items-center"
          >
            <RotateCcw size={20} color="#3CBCB2" />
            <Text className="text-teal-600 ml-1">Làm lại</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View className="items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Kết quả bài thi</Text>
          <Text className="text-gray-600">Full Test - Level {resultsData.examLevel}</Text>
        </View>
      </View>

      {/* Main Results */}
      <ScrollView className="flex-1 px-6 mt-2"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll} // scroll behavior 
        scrollEventThrottle={16} // scroll behavior 
      >
        {/* Score Overview */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <View className="items-center mb-6">
            <View className={`w-20 h-20 rounded-full ${performance.bgColor} items-center justify-center mb-4`}>
              <Award size={32} color={performance.color.includes('green') ? '#10B981' :
                performance.color.includes('blue') ? '#3B82F6' :
                  performance.color.includes('yellow') ? '#F59E0B' :
                    performance.color.includes('orange') ? '#F97316' : '#EF4444'} />
            </View>
            <Text className={`text-3xl font-bold ${performance.color} mb-2`}>
              {stats.scorePercentage}%
            </Text>
            <Text className={`text-lg font-semibold ${performance.color}`}>
              {performance.level}
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 items-center">
              <View className="flex-row items-center mb-2">
                <CheckCircle size={20} color="#10B981" />
                <Text className="text-green-600 font-semibold ml-1">Đúng</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">{stats.correctAnswers}</Text>
            </View>

            <View className="flex-1 items-center">
              <View className="flex-row items-center mb-2">
                <XCircle size={20} color="#EF4444" />
                <Text className="text-red-600 font-semibold ml-1">Sai</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">{stats.incorrectAnswers}</Text>
            </View>

            <View className="flex-1 items-center">
              <View className="flex-row items-center mb-2">
                <Clock size={20} color="#6B7280" />
                <Text className="text-gray-600 font-semibold ml-1">Thời gian</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">{formatTime(stats.timeSpent)}</Text>
            </View>
          </View>
        </View>

        {/* Performance Analysis */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Phân tích kết quả</Text>

          <View className="flex-col gap-1">
            <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
              <View className="flex-row items-center">
                <Target size={20} color="#3CBCB2" />
                <Text className="text-gray-700 ml-2">Độ chính xác</Text>
              </View>
              <Text className={`font-semibold ${performance.color}`}>
                {stats.scorePercentage}%
              </Text>
            </View>

            <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
              <View className="flex-row items-center">
                <TrendingUp size={20} color="#3CBCB2" />
                <Text className="text-gray-700 ml-2">Tốc độ làm bài</Text>
              </View>
              <Text className="text-gray-700 font-semibold">
                {Math.round(stats.totalQuestions / (stats.timeSpent / 60))} câu/phút
              </Text>
            </View>

            <View className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg">
              <View className="flex-row items-center">
                <Award size={20} color="#3CBCB2" />
                <Text className="text-gray-700 ml-2">Xếp hạng</Text>
              </View>
              <Text className={`font-semibold ${performance.color}`}>
                {performance.level}
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Breakdown */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Chi tiết câu hỏi</Text>

          <View className="flex-col gap-1">
            {/* MCQ Section */}
            <View className="p-4 border border-gray-200 rounded-lg">
              <Text className="font-medium text-gray-900 mb-2">Trắc nghiệm (MCQ)</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">Đúng: 8/10</Text>
                <Text className="text-sm text-gray-600">Sai: 2/10</Text>
                <Text className="text-sm font-semibold text-green-600">80%</Text>
              </View>
            </View>

            {/* FRQ Section */}
            <View className="p-4 border border-gray-200 rounded-lg">
              <Text className="font-medium text-gray-900 mb-2">Tự luận (FRQ)</Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">Đúng: 3/5</Text>
                <Text className="text-sm text-gray-600">Sai: 2/5</Text>
                <Text className="text-sm font-semibold text-blue-600">60%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View className="bg-blue-50 rounded-2xl p-6 mb-6">
          <Text className="text-lg font-semibold text-blue-800 mb-4">💡 Khuyến nghị</Text>

          <View className="space-y-2">
            <Text className="text-sm text-blue-700">
              • Ôn tập lại các câu trắc nghiệm sai để cải thiện độ chính xác
            </Text>
            <Text className="text-sm text-blue-700">
              • Luyện tập thêm phần tự luận để nâng cao kỹ năng viết
            </Text>
            <Text className="text-sm text-blue-700">
              • Thời gian làm bài khá tốt, tiếp tục duy trì tốc độ này
            </Text>
            <Text className="text-sm text-blue-700">
              • Có thể thử các bài thi khó hơn để nâng cao trình độ
            </Text>
          </View>
        </View>

        {/* Rating Section */}
        {!hasRated ? (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Đánh giá bài thi</Text>

            {/* Star Rating */}
            <View className="flex-row justify-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  className="mx-1"
                >
                  <Star
                    size={32}
                    color="#F59E0B"
                    fill={star <= rating ? "#F59E0B" : "none"}
                    strokeWidth={star <= rating ? 0 : 1.5}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-900 min-h-[100px] text-base border border-gray-200 mb-4"
              placeholder="Chia sẻ nhận xét của bạn về bài thi này..."
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmitRating}
              className="bg-teal-400 px-6 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold">Gửi đánh giá</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-green-50 rounded-2xl p-6 mb-6 border border-green-200">
            <Text className="text-center text-green-800 font-semibold">
              ✅ Cảm ơn bạn đã đánh giá bài thi!
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity
            onPress={() => navigation.navigate('ExamLibrary')}
            className="bg-gray-100 px-6 py-3 rounded-xl flex-1 mr-2"
          >
            <Text className="text-gray-700 font-semibold text-center">Về thư viện</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('FullTest', { examId: attempt.examId })}
            className="bg-teal-400 px-6 py-3 rounded-xl flex-1 ml-2"
          >
            <Text className="text-white font-semibold text-center">Làm lại</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TestResultsScreen;
