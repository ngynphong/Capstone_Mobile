import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ProgressBarAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Clock, BookOpen, CheckCircle, Circle } from 'lucide-react-native';

import { ActiveExam } from '../../types/examTypes';
import { useExamAttempt } from '../../hooks/useExamAttempt';

const FullTestScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { attempt } = route.params as { attempt: ActiveExam };

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [answers, setAnswers] = useState<{[key: string]: {selectedAnswerId?: string, frqAnswerText?: string}}>({});
  const [currentSection, setCurrentSection] = useState<'mcq' | 'frq'>('mcq');
  const [isRestored, setIsRestored] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { submitAttempt } = useExamAttempt();

  // Auto-save key for this exam attempt
  const autoSaveKey = `exam_${attempt?.examAttemptId}_progress`;
  const attemptDataKey = `exam_${attempt?.examAttemptId}_attempt_data`;
  const timeDataKey = `exam_${attempt?.examAttemptId}_time_data`;

  // Hide tab bar when entering test
  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      // Show tab bar when leaving
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'flex' },
      });
    };
  }, [navigation]);

  useEffect(() => {
    if (attempt && !isRestored) {
      setTimeRemaining(attempt.durationInMinute * 60); // Convert minutes to seconds
    }
  }, [attempt, isRestored]);

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

  // Load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!attempt?.examAttemptId) return;

      try {
        const savedData = await AsyncStorage.getItem(autoSaveKey);
        const savedTimeData = await AsyncStorage.getItem(timeDataKey);

        if (savedData) {
          const parsedAnswers = JSON.parse(savedData);
          setAnswers(parsedAnswers);

          // Load saved time if available
          if (savedTimeData) {
            const savedTime = parseInt(savedTimeData, 10);
            if (savedTime > 0) {
              setTimeRemaining(savedTime);
            }
          }

          setIsRestored(true);
          Alert.alert(
            'Tiếp tục làm bài',
            'Đã khôi phục tiến độ làm bài từ lần trước.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    };

    loadSavedProgress();
  }, [attempt?.examAttemptId, autoSaveKey, timeDataKey]);

  // Save attempt data on mount
  useEffect(() => {
    const saveAttemptData = async () => {
      if (!attempt?.examAttemptId) return;

      try {
        await AsyncStorage.setItem(attemptDataKey, JSON.stringify(attempt));
      } catch (error) {
        console.error('Error saving attempt data:', error);
      }
    };

    saveAttemptData();
  }, [attempt, attemptDataKey]);

  // Auto-save effect every 30 seconds
  useEffect(() => {
    if (!attempt?.examAttemptId) return;

    const autoSaveInterval = setInterval(async () => {
      setIsSaving(true);
      try {
        // Always save answers (even if empty) and time
        await AsyncStorage.setItem(autoSaveKey, JSON.stringify(answers));
        await AsyncStorage.setItem(timeDataKey, timeRemaining.toString());

        // Update last saved time
        const now = new Date();
        setLastSaved(now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }));

        console.log('Auto-saved exam progress and time at', now.toLocaleTimeString());
      } catch (error) {
        console.error('Error auto-saving:', error);
      } finally {
        setIsSaving(false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [attempt?.examAttemptId, autoSaveKey, timeDataKey]); // Removed answers and timeRemaining from dependencies

  // Separate effect to save when answers change
  useEffect(() => {
    const saveAnswers = async () => {
      if (!attempt?.examAttemptId || Object.keys(answers).length === 0) return;

      try {
        await AsyncStorage.setItem(autoSaveKey, JSON.stringify(answers));
        console.log('Saved answers immediately due to change');
      } catch (error) {
        console.error('Error saving answers:', error);
      }
    };

    saveAnswers();
  }, [answers, attempt?.examAttemptId, autoSaveKey]);

  // Clear saved progress when exam is completed or cancelled
  const clearSavedProgress = async () => {
    try {
      await AsyncStorage.removeItem(autoSaveKey);
      await AsyncStorage.removeItem(attemptDataKey);
      await AsyncStorage.removeItem(timeDataKey);
    } catch (error) {
      console.error('Error clearing saved progress:', error);
    }
  };

  const handleTimeUp = async () => {
    try {
      // Automatically submit the exam when time runs out
      const submissionAnswers = attempt.questions.map(question => ({
        examQuestionId: question.examQuestionId,
        selectedAnswerId: answers[question.examQuestionId]?.selectedAnswerId || null,
        frqAnswerText: answers[question.examQuestionId]?.frqAnswerText || null,
      }));

      await submitAttempt(attempt.examAttemptId, { answers: submissionAnswers });

      // Clear saved progress after automatic submission
      await clearSavedProgress();

      Alert.alert(
        'Hết thời gian!',
        'Bạn đã hết thời gian làm bài. Bài làm đã được nộp tự động.',
        [
          { text: 'Xem kết quả', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      console.error('Error auto-submitting test:', error);
      Alert.alert('Error', 'Failed to auto-submit test. Please try again.');
    }
  };

  const handleCancel = () => {
    const answeredQuestions = Object.keys(answers).length;

    if (answeredQuestions > 0) {
      // If user has answered some questions, offer to submit or cancel
      Alert.alert(
        'Chưa hoàn thành bài thi',
        `Bạn đã trả lời ${answeredQuestions} câu hỏi. Bạn hủy bỏ sẽ mất điểm những câu chưa hoàn thành?`,
        [
          { text: 'Tiếp tục làm bài', style: 'cancel' },
          {
            text: 'Nộp bài hiện tại',
            style: 'default',
            onPress: () => confirmSubmission(),
          },
          {
            text: 'Hủy bỏ',
            style: 'destructive',
            onPress: async () => {
              await clearSavedProgress();
              await confirmSubmission();
              navigation.goBack();
            }
          },
        ]
      );
    } else {
      // If no answers, just confirm cancellation
      Alert.alert(
        'Hủy bài thi',
        'Bạn có chắc muốn hủy và nộp bài thi không?',
        [
          { text: 'Tiếp tục làm bài', style: 'cancel' },
          {
            text: 'Hủy bài thi',
            style: 'destructive',
            onPress: async () => {
              await clearSavedProgress();
              await confirmSubmission();
              navigation.goBack();
            }
          },
        ]
      );
    }
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
    setIsSubmitting(true);
    try {
      // Prepare answers from state
      const submissionAnswers = attempt.questions.map(question => ({
        examQuestionId: question.examQuestionId,
        selectedAnswerId: answers[question.examQuestionId]?.selectedAnswerId || null,
        frqAnswerText: answers[question.examQuestionId]?.frqAnswerText || null,
      }));

      await submitAttempt(attempt.examAttemptId, { answers: submissionAnswers });

      // Clear saved progress after successful submission
      await clearSavedProgress();

      Alert.alert(
        'Hoàn thành!',
        'Bài làm của bạn đã được nộp thành công!',
        [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]
      );
    } catch (error) {
      console.error('Error submitting test:', error);
      Alert.alert('Error', 'Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedAnswerId: answerId,
      }
    }));
  };

  // Handle FRQ text input
  const handleFRQInput = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        frqAnswerText: text,
      }
    }));
  };

  // Calculate progress
  const getProgress = () => {
    const totalQuestions = attempt.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    return answeredQuestions / totalQuestions;
  };

  // Filter questions by type
  const mcqQuestions = attempt.questions.filter(q => q.question.type === 'mcq');
  const frqQuestions = attempt.questions.filter(q => q.question.type === 'frq');

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

  if (!attempt) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Exam attempt not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            {/* <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="flex-row items-center mr-4"
            >
              <ArrowLeft size={24} color="#374151" />
              <Text className="text-gray-700 ml-2">Quay lại</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={handleCancel}
              className="bg-red-500 px-3 py-2 rounded-lg"
            >
              <Text className="text-white font-medium text-sm">Hủy bài thi</Text>
            </TouchableOpacity>
          </View>

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
            {attempt.title} - Full Test
          </Text>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600">
              ⏱️ {attempt.durationInMinute} phút
            </Text>
            <View className="flex-row items-center">
              <BookOpen size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">
                {attempt.questions.length} câu hỏi
              </Text>
            </View>
          </View>

          {/* Auto-save Status */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              {isSaving ? (
                <>
                  <View className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2" />
                  <Text className="text-sm text-blue-600">Đang lưu...</Text>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle size={14} color="#10B981" />
                  <Text className="text-sm text-green-600 ml-1">
                    Đã lưu lúc {lastSaved}
                  </Text>
                </>
              ) : (
                <>
                  <Circle size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-500 ml-1">
                    Chưa lưu
                  </Text>
                </>
              )}
            </View>
            <Text className="text-xs text-gray-400">
              Tự động lưu mỗi 30 giây
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="mt-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-sm text-gray-600">Tiến độ làm bài</Text>
              <Text className="text-sm text-gray-600">
                {Object.keys(answers).length}/{attempt.questions.length}
              </Text>
            </View>
            {Platform.OS === 'android' ? (
              <ProgressBarAndroid
                styleAttr="Horizontal"
                indeterminate={false}
                progress={getProgress()}
                color="#3CBCB2"
              />
            ) : (
              <View className="w-full bg-gray-200 rounded-full h-2">
                <View
                  className="bg-teal-400 h-2 rounded-full"
                  style={{ width: `${getProgress() * 100}%` }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Section Tabs */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
          <TouchableOpacity
            onPress={() => setCurrentSection('mcq')}
            className={`flex-1 py-2 rounded-lg ${currentSection === 'mcq' ? 'bg-teal-400' : ''}`}
          >
            <Text className={`font-semibold text-center text-sm ${currentSection === 'mcq' ? 'text-white' : 'text-gray-600'}`}>
              Trắc nghiệm ({mcqQuestions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentSection('frq')}
            className={`flex-1 py-2 rounded-lg ${currentSection === 'frq' ? 'bg-teal-400' : ''}`}
          >
            <Text className={`font-semibold text-center text-sm ${currentSection === 'frq' ? 'text-white' : 'text-gray-600'}`}>
              Tự luận ({frqQuestions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        // onScroll={handleScroll}
        // scrollEventThrottle={16}
      >
        <View className="bg-white rounded-2xl p-6 my-6 shadow-sm border border-gray-100">
          <Text className="text-xl font-bold text-gray-900 mb-6">
            {currentSection === 'mcq' ? 'Phần Trắc Nghiệm' : 'Phần Tự Luận'}
          </Text>

          {currentSection === 'mcq' ? (
            // MCQ Section
            mcqQuestions.length > 0 ? (
              <View className="space-y-4">
                {mcqQuestions.map((question, index) => (
                  <View key={question.examQuestionId} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      Câu {index + 1}:
                    </Text>
                    <Text className="text-gray-700 leading-6 mb-4">
                      {question.question.content}
                    </Text>
                    {question.question.answers && question.question.answers.length > 0 && (
                      <View className="flex flex-col gap-2">
                        {question.question.answers.map((answer, answerIndex) => {
                          const isSelected = answers[question.examQuestionId]?.selectedAnswerId === answer.id;
                          return (
                            <TouchableOpacity
                              key={answer.id}
                              onPress={() => handleAnswerSelect(question.examQuestionId, answer.id)}
                              className={`flex-row items-center p-3 rounded-lg border ${
                                isSelected ? 'bg-teal-100 border-teal-400' : 'bg-white border-gray-300'
                              }`}
                            >
                              {isSelected ? (
                                <CheckCircle size={20} color="#3CBCB2" />
                              ) : (
                                <Circle size={20} color="#6B7280" />
                              )}
                              <Text className={`ml-3 text-base ${isSelected ? 'text-teal-800 font-medium' : 'text-gray-700'}`}>
                                {String.fromCharCode(65 + answerIndex)}. {answer.content}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-600 text-center py-8">
                Không có câu hỏi trắc nghiệm trong bài thi này.
              </Text>
            )
          ) : (
            // FRQ Section
            frqQuestions.length > 0 ? (
              <View className="space-y-4">
                {frqQuestions.map((question, index) => (
                  <View key={question.examQuestionId} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      Câu {mcqQuestions.length + index + 1}:
                    </Text>
                    <Text className="text-gray-700 leading-6 mb-4">
                      {question.question.content}
                    </Text>
                    <TextInput
                      multiline
                      numberOfLines={4}
                      placeholder="Nhập câu trả lời của bạn..."
                      value={answers[question.examQuestionId]?.frqAnswerText || ''}
                      onChangeText={(text) => handleFRQInput(question.examQuestionId, text)}
                      className="bg-white border border-gray-300 rounded-lg p-3 text-gray-700 min-h-[100px]"
                      textAlignVertical="top"
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-600 text-center py-8">
                Không có câu hỏi tự luận trong bài thi này.
              </Text>
            )
          )}
        </View>

        {/* Submit Button */}
        <View className="mb-8">
          <TouchableOpacity
            onPress={submitTest}
            disabled={isSubmitting}
            className={`px-6 py-4 rounded-xl items-center flex-row justify-center ${
              isSubmitting ? 'bg-gray-400' : 'bg-teal-400'
            }`}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Đang nộp...
                </Text>
              </>
            ) : (
              <Text className="text-white font-semibold text-lg">
                Nộp bài
              </Text>
            )}
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
