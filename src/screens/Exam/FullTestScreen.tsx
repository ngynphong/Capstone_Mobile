import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react-native';

import { Exam } from '../../types/examTypes';
import { ExamService } from '../../services/examService';
import { useScroll } from '../../context/ScrollContext';
import { useAppToast } from '../../utils/toast';

const FullTestScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { examId } = route.params as { examId: string };

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [startTime] = useState(Date.now());
  const { handleScroll } = useScroll();
  const toast = useAppToast();

  useEffect(() => {
    loadExamData();
  }, [examId]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const loadExamData = async () => {
    try {
      setLoading(true);
      const examResponse = await ExamService.getExamById({ id: examId });

      setExam(examResponse.data);
      setTimeRemaining(examResponse.data.duration * 60); // Convert minutes to seconds
    } catch (error) {
      console.error('Error loading exam data:', error);
      toast.error('Failed to load exam data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Hết thời gian!',
      'Bạn đã hết thời gian làm bài. Bài làm sẽ được nộp tự động.',
      [
        { text: 'Xem kết quả', onPress: () => submitTest() },
      ]
    );
  };

  const submitTest = () => {
    Alert.alert(
      'Nộp bài thi',
      'Bạn có muốn nộp bài không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Nộp bài', style: 'destructive', onPress: () => confirmSubmission() },
      ]
    );
  };

  const confirmSubmission = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Mock submission - in real app, this would submit to backend
      Alert.alert(
        'Hoàn thành!',
        `Bài làm của bạn đã được nộp!\n\nThời gian: ${formatTime(timeSpent)}\nĐiểm số sẽ được tính toán sau.`,
        [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      console.error('Error submitting test:', error);
      Alert.alert('Error', 'Failed to submit test. Please try again.');
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3CBCB2" />
        <Text className="text-gray-600 mt-4">Loading full test...</Text>
      </View>
    );
  }

  if (!exam) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Exam not found</Text>
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

          <View className="flex-row items-center bg-red-50 px-3 py-2 rounded-lg">
            <Clock size={16} color="#EF4444" />
            <Text className="text-red-600 ml-1 font-medium">
              {formatTime(timeRemaining)}
            </Text>
          </View>
        </View>

        {/* Exam Info */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {exam.title} - Full Test
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-600">
              ⏱️ {exam.duration} phút
            </Text>
            <View className="flex-row items-center">
              <BookOpen size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">
                {exam.questionContents.length} câu hỏi
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="bg-white rounded-2xl p-6 my-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-bold text-gray-900 mb-6">
            Nội dung bài thi
          </Text>

          {exam.questionContents.length > 0 ? (
            <View className="space-y-4">
              {exam.questionContents.map((content, index) => (
                <View key={index} className="mb-4">
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    Câu {index + 1}:
                  </Text>
                  <Text className="text-gray-700 leading-6">
                    {content}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-600 text-center py-8">
              Chưa có nội dung câu hỏi cho bài thi này.
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <View className="mb-8">
          <TouchableOpacity
            onPress={submitTest}
            className="bg-teal-400 px-6 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-lg">
              Nộp bài
            </Text>
          </TouchableOpacity>
        </View>

        {/* Warning */}
        <View className="bg-red-50 rounded-xl p-4 mb-8">
          <Text className="text-sm font-medium text-red-800 mb-2">⚠️ Lưu ý:</Text>
          <Text className="text-sm text-red-700">
            • Thời gian sẽ được tính cho toàn bộ bài thi{'\n'}
            • Hãy đọc kỹ tất cả câu hỏi trước khi nộp bài{'\n'}
            • Sau khi nộp bài sẽ không thể thay đổi câu trả lời
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default FullTestScreen;
