import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Clock, BookOpen, CheckCircle, Circle, Save } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ActiveExam } from '../../types/examTypes';
import { useExamAttempt } from '../../hooks/useExamAttempt';
import { useAutoSave } from '../../hooks/useAutoSave';
import LatexText from '../../components/common/LatexText';
import MathKeyboard from '../../components/common/MathKeyboard';

const FullTestScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { attempt } = route.params as { attempt: ActiveExam };

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [key: string]: { selectedAnswerId?: string, frqAnswerText?: string } }>({});
  const [currentSection, setCurrentSection] = useState<'mcq' | 'frq'>('mcq');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const { submitAttempt, saveProgress, subscribeAttemptResult } = useExamAttempt();

  // AI Grading modal state
  const [showGradingModal, setShowGradingModal] = useState<boolean>(false);
  const [isWaitingForGrading, setIsWaitingForGrading] = useState<boolean>(false);
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [gradingError, setGradingError] = useState<string | null>(null);

  // Auto-save hook
  const { lastSaved, isSaving, saveNow } = useAutoSave(
    attempt?.examAttemptId || null,
    attempt?.attemptSessionToken || null,
    saveProgress,
    answers,
    true, // enabled
    1000 // 1 second debounce
  );

  // Animation values
  const submitButtonScale = useState(new Animated.Value(1))[0];
  const successOpacity = useState(new Animated.Value(0))[0];
  const successScale = useState(new Animated.Value(0.8))[0];

  // Hide tab bar when entering test
  useFocusEffect(
    React.useCallback(() => {
      // Hide tab bar when screen is focused
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' },
      });

      // Show tab bar when screen loses focus
      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: 'flex' },
        });
      };
    }, [navigation])
  );

  // Khôi phục đáp án đã lưu khi component mount
  useEffect(() => {
    if (attempt?.questions) {
      const savedAnswers: { [key: string]: { selectedAnswerId?: string, frqAnswerText?: string } } = {};

      // Nguồn 1: Kiểm tra savedAnswer trong từng question
      attempt.questions.forEach(question => {
        if (question.savedAnswer && question.savedAnswer !== null) {
          if (question.savedAnswer.selectedAnswerId) {
            savedAnswers[question.examQuestionId] = {
              selectedAnswerId: question.savedAnswer.selectedAnswerId,
            };
          }
          if (question.savedAnswer.frqAnswerText) {
            savedAnswers[question.examQuestionId] = {
              ...savedAnswers[question.examQuestionId],
              frqAnswerText: question.savedAnswer.frqAnswerText,
            };
          }
        }
      });

      // Nguồn 2: Kiểm tra attempt.savedAnswer.answers (SaveProgressPayload)
      if (attempt.savedAnswer?.answers && attempt.savedAnswer.answers.length > 0) {
        // console.log('Có savedAnswer từ attempt.savedAnswer.answers');
        attempt.savedAnswer.answers.forEach(ans => {
          if (ans.selectedAnswerId || ans.frqAnswerText) {
            savedAnswers[ans.examQuestionId] = {
              ...(ans.selectedAnswerId && { selectedAnswerId: ans.selectedAnswerId }),
              ...(ans.frqAnswerText && { frqAnswerText: ans.frqAnswerText }),
            };
          }
        });
      }

      setAnswers(savedAnswers);
      // console.log('Đã khôi phục answers:', savedAnswers);
    }
  }, [attempt]);

  useEffect(() => {
    const initTimer = async () => {
      if (!attempt) return;

      const storageKey = `exam_start_time_${attempt.examAttemptId}`;

      // Priority 1: remainTime từ API (cross-device sync)
      // Khi thi trên thiết bị khác hoặc API trả về remainTime, dùng giá trị này
      if (attempt.remainTime !== undefined && attempt.remainTime > 0) {
        console.log('[Timer] Using remainTime from API:', attempt.remainTime, 'seconds');
        setTimeRemaining(attempt.remainTime);
        // Update AsyncStorage với thời điểm hiện tại để xử lý app restart
        await AsyncStorage.setItem(storageKey, Date.now().toString());
        return;
      }

      // Priority 2, 3, 4: Fallback logic cho cùng thiết bị
      let startTimeMs: number;
      const savedStartTime = await AsyncStorage.getItem(storageKey);

      if (savedStartTime) {
        // Đã thi trước đó trên cùng thiết bị, dùng thời gian đã lưu
        startTimeMs = parseInt(savedStartTime, 10);
      } else if (attempt.startTime) {
        // API trả về startTime
        startTimeMs = new Date(attempt.startTime).getTime();
        await AsyncStorage.setItem(storageKey, startTimeMs.toString());
      } else {
        // Lần đầu thi, lưu thời gian hiện tại
        startTimeMs = Date.now();
        await AsyncStorage.setItem(storageKey, startTimeMs.toString());
      }

      const nowMs = Date.now();
      const elapsedSeconds = Math.floor((nowMs - startTimeMs) / 1000);
      const totalDurationSeconds = attempt.durationInMinute * 60;
      const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

      if (remainingSeconds <= 0) {
        handleTimeUp();
        setTimeRemaining(0);
      } else {
        setTimeRemaining(remainingSeconds);
      }
    };

    initTimer();
  }, [attempt]);

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

  const handleTimeUp = () => {
    Alert.alert(
      'Time up!',
      'You have run out of time. Your answers will be automatically submitted.',
      [
        { text: 'View results', onPress: () => submitTest() },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel & Submit',
      'Are you sure you want to cancel? Your current answers will be submitted automatically.',
      [
        { text: 'Continue Exam', style: 'cancel' },
        { text: 'Cancel & Submit', style: 'destructive', onPress: () => confirmSubmission() },
      ]
    );
  };

  const submitTest = () => {
    Alert.alert(
      'Submit',
      'You are sure to submit this test?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: () => confirmSubmission() },
      ]
    );
  };

  const confirmSubmission = async () => {
    try {
      setIsSubmitting(true);

      // Animate submit button
      Animated.timing(submitButtonScale, {
        toValue: 0.95,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();

      // Prepare answers from state
      const submissionAnswers = attempt.questions.map(question => ({
        examQuestionId: question.examQuestionId,
        selectedAnswerId: answers[question.examQuestionId]?.selectedAnswerId || null,
        frqAnswerText: answers[question.examQuestionId]?.frqAnswerText || null,
      }));

      await submitAttempt(attempt.examAttemptId, {
        answers: submissionAnswers,
        attemptSessionToken: attempt.attemptSessionToken
      });

      // Reset button animation
      Animated.timing(submitButtonScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();

      setIsSubmitting(false);

      // Navigate back to ExamLibrary with grading params to show modal there
      navigation.navigate('ExamLibrary', {
        gradingAttemptId: attempt.examAttemptId,
        showGradingModal: true
      });

    } catch (error) {
      console.error('Error submitting test:', error);
      setIsSubmitting(false);

      // Reset button animation on error
      Animated.timing(submitButtonScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();

      Alert.alert('Error', 'Failed to submit test. Please try again.');
    }
  };

  // Handle waiting for AI grading result
  const handleWaitForGrading = async () => {
    setIsWaitingForGrading(true);
    setGradingError(null);
    try {
      const result = await subscribeAttemptResult(attempt.examAttemptId);
      if (result) {
        setGradingResult(result);
      } else {
        setGradingError('Failed to get grading result. Please try again.');
      }
    } catch (error: any) {
      console.error('Error getting grading result:', error);
      if (error.message === 'GRADING_IN_PROGRESS') {
        setGradingError('AI is still processing your exam. Results will be updated in "Exam History" when completed.');
      } else if (error.message === 'GRADING_TIMEOUT') {
        setGradingError('AI is taking longer than expected. Results will be updated in "Exam History" when completed.');
      } else {
        setGradingError('AI grading is currently unavailable. Results will be updated later.');
      }
    } finally {
      setIsWaitingForGrading(false);
    }
  };

  // Handle skip waiting and go back
  const handleSkipGrading = () => {
    setShowGradingModal(false);
    setShowSuccess(true);

    // Animate success message
    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(successScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      navigation.goBack();
    }, 2000);
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
              <Text className="text-white font-medium text-sm">Cancel</Text>
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
              ⏱️ {attempt.durationInMinute} minutes
            </Text>
            <View className="flex-row items-center">
              <BookOpen size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">
                {attempt.questions.length} questions
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-sm text-gray-600">Progress</Text>
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

          {/* Auto-save Status */}
          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              {isSaving ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#3CBCB2" />
                  <Text className="text-xs text-teal-600 ml-1">Saving...</Text>
                </View>
              ) : lastSaved ? (
                <View className="flex-row items-center">
                  <Save size={12} color="#10B981" />
                  <Text className="text-xs text-green-600 ml-1">
                    Saved: {lastSaved.toLocaleTimeString()}
                  </Text>
                </View>
              ) : (
                <Text className="text-xs text-gray-500">Not saved</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={saveNow}
              disabled={isSaving}
              className="flex-row items-center"
            >
              <Text className="text-xs text-teal-600">Save now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Tabs */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
          <TouchableOpacity
            onPress={() => setCurrentSection('mcq')}
            className={`flex-1 py-2 rounded-lg ${currentSection === 'mcq' ? 'bg-teal-400' : ''}`}
          >
            <Text className={`font-semibold text-center text-sm ${currentSection === 'mcq' ? 'text-white' : 'text-gray-600'}`}>
              Multiple Choice ({mcqQuestions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCurrentSection('frq')}
            className={`flex-1 py-2 rounded-lg ${currentSection === 'frq' ? 'bg-teal-400' : ''}`}
          >
            <Text className={`font-semibold text-center text-sm ${currentSection === 'frq' ? 'text-white' : 'text-gray-600'}`}>
              Essay ({frqQuestions.length})
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
            {currentSection === 'mcq' ? 'Multiple Choice' : 'Essay'}
          </Text>

          {currentSection === 'mcq' ? (
            // MCQ Section
            mcqQuestions.length > 0 ? (
              <View className="space-y-4">
                {mcqQuestions.map((question, index) => (
                  <View key={question.examQuestionId} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      Question {index + 1}:
                    </Text>
                    <LatexText
                      content={question.question.content}
                      textStyle={{ fontSize: 16, lineHeight: 24, color: '#374151' }}
                    />
                    {question.question.answers && question.question.answers.length > 0 && (
                      <View className="flex flex-col gap-2">
                        {question.question.answers.map((answer, answerIndex) => {
                          const isSelected = answers[question.examQuestionId]?.selectedAnswerId === answer.id;
                          return (
                            <TouchableOpacity
                              key={answer.id}
                              onPress={() => handleAnswerSelect(question.examQuestionId, answer.id)}
                              className={`flex-row items-center p-3 rounded-lg border ${isSelected ? 'bg-teal-100 border-teal-400' : 'bg-white border-gray-300'
                                }`}
                            >
                              {isSelected ? (
                                <CheckCircle size={20} color="#3CBCB2" />
                              ) : (
                                <Circle size={20} color="#6B7280" />
                              )}
                              <LatexText
                                content={`${String.fromCharCode(65 + answerIndex)}. ${answer.content}`}
                                textStyle={{ marginLeft: 12, fontSize: 16, color: isSelected ? '#115e59' : '#374151', fontWeight: isSelected ? '500' : '400' }}
                              />
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
                No multiple choice questions in this exam.
              </Text>
            )
          ) : (
            // FRQ Section
            frqQuestions.length > 0 ? (
              <View className="space-y-4">
                {frqQuestions.map((question, index) => (
                  <View key={question.examQuestionId} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      Question {mcqQuestions.length + index + 1}:
                    </Text>
                    <LatexText
                      content={question.question.content}
                      textStyle={{ fontSize: 16, lineHeight: 24, color: '#374151' }}
                    />
                    <MathKeyboard
                      value={answers[question.examQuestionId]?.frqAnswerText || ''}
                      onChangeText={(text) => handleFRQInput(question.examQuestionId, text)}
                      placeholder="Enter your answer..."
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-600 text-center py-8">
                No multiple choice questions in this exam.
              </Text>
            )
          )}
        </View>

        {/* Submit Button */}
        <View className="mb-8">
          <Animated.View
            style={{
              transform: [{ scale: submitButtonScale }],
            }}
          >
            <TouchableOpacity
              onPress={submitTest}
              disabled={isSubmitting}
              className={`px-6 py-4 rounded-xl items-center ${isSubmitting ? 'bg-teal-300' : 'bg-teal-400'
                }`}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white font-semibold text-lg ml-2">
                    Submitting...
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Warning */}
        <View className="bg-red-50 rounded-xl p-4 mb-8">
          <Text className="text-sm font-medium text-red-800 mb-2">⚠️ Warning:</Text>
          <Text className="text-sm text-red-700">
            • The time will be calculated for the entire exam{'\n'}
            • Please read all questions before submitting{'\n'}
            • After submitting, you will not be able to change your answers
          </Text>
        </View>
      </ScrollView>

      {/* AI Grading Modal */}
      <Modal
        visible={showGradingModal}
        transparent
        animationType="fade"
        onRequestClose={handleSkipGrading}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 350,
          }}>
            {/* Header */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-teal-100 rounded-full items-center justify-center mb-3">
                <CheckCircle size={36} color="#3CBCB2" />
              </View>
              <Text className="text-xl font-bold text-gray-900 text-center">
                Submit successfully!
              </Text>
            </View>

            {/* Content based on state */}
            {!isWaitingForGrading && !gradingResult && !gradingError && (
              <View>
                <Text className="text-gray-600 text-center mb-4">
                  AI is grading your exam. Do you want to wait for the result?
                </Text>
                <Text className="text-gray-500 text-sm text-center mb-6">
                  (Sometimes grading may take a few minutes or need manual grading)
                </Text>

                <TouchableOpacity
                  onPress={handleWaitForGrading}
                  className="bg-teal-500 py-3 rounded-xl mb-3"
                >
                  <Text className="text-white text-center font-semibold">
                    Wait for result
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSkipGrading}
                  className="bg-gray-100 py-3 rounded-xl"
                >
                  <Text className="text-gray-700 text-center font-medium">
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Loading state */}
            {isWaitingForGrading && (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#3CBCB2" />
                <Text className="text-gray-600 text-center mt-4">
                  Waiting for AI to grade your exam...
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-2">
                  Please wait a moment
                </Text>
              </View>
            )}

            {/* Error state */}
            {gradingError && (
              <View>
                <Text className="text-red-500 text-center mb-4">
                  {gradingError}
                </Text>
                <TouchableOpacity
                  onPress={handleWaitForGrading}
                  className="bg-teal-500 py-3 rounded-xl mb-3"
                >
                  <Text className="text-white text-center font-semibold">
                    Retry
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSkipGrading}
                  className="bg-gray-100 py-3 rounded-xl"
                >
                  <Text className="text-gray-700 text-center font-medium">
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Result display */}
            {gradingResult && (
              <View>
                <View className="bg-green-50 rounded-xl p-4 mb-4">
                  <Text className="text-green-800 text-center text-lg font-bold mb-2">
                    Score: {gradingResult.totalScore ?? gradingResult.score ?? 'N/A'} / {gradingResult.maxScore ?? attempt.passingScore ?? '100'}
                  </Text>
                  <Text className="text-green-600 text-center">
                    {gradingResult.passed ? '✅ Pass' : gradingResult.passed === false ? '❌ Fail' : 'Completed'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowGradingModal(false);
                    navigation.goBack();
                  }}
                  className="bg-teal-500 py-3 rounded-xl"
                >
                  <Text className="text-white text-center font-semibold">
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Animation Overlay */}
      {showSuccess && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: successOpacity,
          }}
        >
          <Animated.View
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 40,
              alignItems: 'center',
              transform: [{ scale: successScale }],
            }}
          >
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <CheckCircle size={40} color="#10B981" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              Submit successfully!
            </Text>
            <Text className="text-gray-600 text-center">
              Your exam has been submitted.{'\n'}Redirecting...
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

export default FullTestScreen;
