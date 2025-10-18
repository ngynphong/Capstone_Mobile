import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ArrowLeft, RotateCcw, Clock, Save} from 'lucide-react-native';

import {ExamStackParamList} from '../../types/examTypes';
import {useScroll} from '../../context/ScrollContext';
import {useAppToast} from '../../utils/toast';

type NavigationProp = NativeStackNavigationProp<ExamStackParamList>;
type RouteProps = RouteProp<ExamStackParamList, 'FRQ'>;

const FRQScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const {session} = route.params;

  const [currentIndex, setCurrentIndex] = useState(session.currentIndex);
  const [answers, setAnswers] = useState<Record<string, string>>(
    session.answers || {},
  );
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60); // 30 minutes default
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [startTime] = useState(Date.now());
  const [savedAnswers, setSavedAnswers] = useState<Set<string>>(new Set());
  const {handleScroll} = useScroll();
  const toast = useAppToast();

  const currentQuestion = session.questions[currentIndex];
  const progress = ((currentIndex + 1) / session.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            Alert.alert(
              'Hết thời gian!',
              'Bạn đã hết thời gian làm bài. Hãy nộp bài để xem kết quả.',
              [{text: 'Nộp bài', onPress: () => submitAllAnswers()}],
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  // Update current answer when question changes
  useEffect(() => {
    setCurrentAnswer(answers[currentQuestion?.id] || '');
  }, [currentIndex, currentQuestion]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer change
  const handleAnswerChange = (text: string) => {
    setCurrentAnswer(text);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: text,
    }));
  };

  // Save current answer
  const saveCurrentAnswer = () => {
    setSavedAnswers(prev => new Set([...prev, currentQuestion.id]));
    toast.success('Đáp án của bạn đã được lưu thành công.');
  };

  // Handle next question
  const handleNext = () => {
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitAllAnswers();
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Submit all answers
  const submitAllAnswers = () => {
    const completedAnswers = Object.keys(answers).length;
    const totalQuestions = session.questions.length;

    Alert.alert(
      'Nộp bài',
      `Bạn đã hoàn thành ${completedAnswers}/${totalQuestions} câu hỏi. Bạn có muốn nộp bài không?`,
      [
        {text: 'Hủy', style: 'cancel'},
        {text: 'Nộp bài', onPress: () => confirmSubmission()},
      ],
    );
  };

  // Confirm submission
  const confirmSubmission = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const wordCount = Object.values(answers).reduce((total, answer) => {
      return total + answer.split(' ').filter(word => word.length > 0).length;
    }, 0);

    Alert.alert(
      'Hoàn thành!',
      `Bài làm của bạn đã được nộp!\n\nThời gian: ${formatTime(timeSpent)}\nTổng số từ: ${wordCount}\nCâu đã trả lời: ${Object.keys(answers).length}/${session.questions.length}`,
      [
        {text: 'Xem kết quả', onPress: () => navigation.goBack()},
        {text: 'Làm lại', onPress: () => resetSession()},
      ],
    );
  };

  // Reset session
  const resetSession = () => {
    setCurrentIndex(0);
    setAnswers({});
    setCurrentAnswer('');
    setTimeRemaining(30 * 60);
    setIsTimerActive(true);
    setSavedAnswers(new Set());
  };

  // Toggle timer
  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  if (!currentQuestion) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">No questions available</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
              onPress={resetSession}
              className="flex-row items-center"
            >
              <RotateCcw size={20} color="#3CBCB2" />
              <Text className="text-teal-600 ml-1">Làm lại</Text>
            </TouchableOpacity>
          </View>

          {/* Progress and Timer */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-gray-600">
                Bài học: {currentIndex + 1} • Loại: Tự luận • Câu{' '}
                {currentIndex + 1} / {session.questions.length}
              </Text>
              <TouchableOpacity
                onPress={toggleTimer}
                className={`flex-row items-center px-3 py-1 rounded-lg ${
                  isTimerActive ? 'bg-teal-100' : 'bg-gray-100'
                }`}
              >
                <Clock
                  size={16}
                  color={isTimerActive ? '#3CBCB2' : '#9CA3AF'}
                />
                <Text
                  className={`ml-1 text-sm ${isTimerActive ? 'text-teal-700' : 'text-gray-500'}`}
                >
                  {formatTime(timeRemaining)}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="w-full bg-gray-200 rounded-full h-2">
              <View
                className="bg-teal-400 h-2 rounded-full"
                style={{width: `${progress}%`}}
              />
            </View>
          </View>

          {/* Question Counter */}
          <View className="flex-row justify-center">
            <Text className="text-sm text-gray-600">
              Đã trả lời: {Object.keys(answers).length} /{' '}
              {session.questions.length} câu
            </Text>
          </View>
        </View>

        {/* Question and Answer Area */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll} // scroll behavior
          scrollEventThrottle={16} // scroll behavior
        >
          <View className="bg-white rounded-2xl p-6 my-6 shadow-sm border border-gray-100">
            {/* Question */}
            <Text className="text-xl font-bold text-gray-900 mb-6">
              {currentQuestion.question}
            </Text>

            {/* Answer Input */}
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-gray-900 min-h-[200px] text-base"
              placeholder="Nhập câu trả lời của bạn ở đây..."
              placeholderTextColor="#9CA3AF"
              value={currentAnswer}
              onChangeText={handleAnswerChange}
              multiline
              textAlignVertical="top"
              style={{maxHeight: 300}}
            />

            {/* Character/Word Count */}
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-sm text-gray-600">
                Từ:{' '}
                {
                  currentAnswer.split(' ').filter(word => word.length > 0)
                    .length
                }
              </Text>
              <Text className="text-sm text-gray-600">
                Ký tự: {currentAnswer.length}
              </Text>
            </View>

            {/* Auto-save indicator */}
            {savedAnswers.has(currentQuestion.id) && (
              <View className="flex-row items-center mt-2">
                <Text className="text-sm text-green-600">✓ Đã lưu tự động</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between items-center mb-8">
            <TouchableOpacity
              onPress={handlePrevious}
              disabled={currentIndex === 0}
              className={`flex-row items-center px-6 py-3 rounded-xl ${
                currentIndex === 0
                  ? 'bg-gray-100'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <Text
                className={`font-medium ${currentIndex === 0 ? 'text-gray-400' : 'text-gray-700'}`}
              >
                ← Trước
              </Text>
            </TouchableOpacity>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={saveCurrentAnswer}
                className="flex-row items-center bg-gray-100 px-4 py-3 rounded-xl"
              >
                <Save size={16} color="#6B7280" />
                <Text className="text-gray-700 ml-2 font-medium">Lưu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                className="bg-teal-400 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">
                  {currentIndex === session.questions.length - 1
                    ? 'Nộp bài'
                    : 'Tiếp →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Summary */}
          <View className="bg-blue-50 rounded-xl p-4 mb-8">
            <Text className="text-sm font-medium text-blue-800 mb-2">
              Tiến độ làm bài:
            </Text>
            <View className="space-y-2">
              {session.questions.map((question, index) => (
                <View
                  key={question.id}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-sm text-blue-700">
                    Câu {index + 1}:{' '}
                    {answers[question.id] ? 'Đã trả lời' : 'Chưa trả lời'}
                  </Text>
                  {answers[question.id] && (
                    <Text className="text-xs text-blue-600">
                      {
                        answers[question.id]
                          .split(' ')
                          .filter(word => word.length > 0).length
                      }{' '}
                      từ
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View className="bg-green-50 rounded-xl p-4 mb-8">
            <Text className="text-sm font-medium text-green-800 mb-2">
              💡 Mẹo làm bài:
            </Text>
            <Text className="text-sm text-green-700">
              • Đọc kỹ câu hỏi và yêu cầu{'\n'}• Cấu trúc câu trả lời rõ ràng
              {'\n'}• Sử dụng từ vựng phong phú{'\n'}• Kiểm tra lỗi chính tả
              trước khi nộp
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default FRQScreen;
