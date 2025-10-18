import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Clock, FileText, Edit3, CheckCircle, AlertTriangle } from 'lucide-react-native';

import { Exam, Question, ExamStackParamList } from '../../types/examTypes';
import { ExamService } from '../../services/examService';
import { useScroll } from '../../context/ScrollContext';
import { useAppToast } from '../../utils/toast';

type NavigationProp = NativeStackNavigationProp<ExamStackParamList>;
type RouteProps = RouteProp<ExamStackParamList, 'FullTest'>;

type TestSection = 'MCQ' | 'FRQ';

const FullTestScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { examId } = route.params;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<TestSection>('MCQ');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
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
      const [examData, questionsData] = await Promise.all([
        ExamService.getExamById(examId),
        ExamService.getExamQuestions(examId),
      ]);

      if (examData) {
        setExam(examData);
        setQuestions(questionsData);
        setTimeRemaining(examData.duration * 60); // Convert minutes to seconds
      } else {
        toast.error('Exam not found');
        navigation.goBack();
      }
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

  // Get current question
  const getCurrentQuestions = () => {
    return questions.filter(q => q.type === currentSection);
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Handle answer selection for MCQ
  const handleMCQAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Handle FRQ answer
  const handleFRQAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Navigate between questions
  const navigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Move to next section or submit
  const handleNextSection = () => {
    if (currentSection === 'MCQ') {
      setCurrentSection('FRQ');
      setCurrentQuestionIndex(0);
    } else {
      submitTest();
    }
  };

  // Submit test
  const submitTest = () => {
    const mcqQuestions = questions.filter(q => q.type === 'MCQ');
    const frqQuestions = questions.filter(q => q.type === 'FRQ');

    const mcqAnswered = mcqQuestions.filter(q => answers[q.id]).length;
    const frqAnswered = frqQuestions.filter(q => answers[q.id]).length;

    Alert.alert(
      'Nộp bài thi',
      `Bạn đã hoàn thành:\n\n📝 Trắc nghiệm: ${mcqAnswered}/${mcqQuestions.length}\n✍️ Tự luận: ${frqAnswered}/${frqQuestions.length}\n\nBạn có muốn nộp bài không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Nộp bài', style: 'destructive', onPress: () => confirmSubmission() },
      ]
    );
  };

  const confirmSubmission = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(answers).length;

      // Calculate score (mock calculation)
      const correctAnswers = Math.floor(answeredQuestions * 0.7); // Assume 70% correct for demo

      // Create exam attempt
      const attemptData = {
        examId,
        userId: 'current-user', // In real app, get from auth context
        startTime: new Date(startTime),
        endTime: new Date(),
        score: Math.round((correctAnswers / totalQuestions) * 100),
        totalQuestions,
        correctAnswers,
        timeSpent,
        answers: [], // Would be populated with actual answers
        completed: true,
      };

      // Submit attempt and navigate to results
      const attempt = await ExamService.submitExamAttempt(attemptData);
      navigation.navigate('TestResults', { attempt });

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

  if (questions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">No Questions Available</Text>
        <Text className="text-gray-600 text-center mb-6">
          This exam doesn't have any questions yet. Please try another exam or contact support.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-teal-400 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Error loading question</Text>
      </View>
    );
  }

  const mcqQuestions = questions.filter(q => q.type === 'MCQ');
  const frqQuestions = questions.filter(q => q.type === 'FRQ');

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
            <AlertTriangle size={16} color="#EF4444" />
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
              ⏱️ {exam.duration} phút • 📝 {exam.questions} câu hỏi
            </Text>
            <Text className="text-sm text-gray-500">
              {exam.attempts} người đã thử
            </Text>
          </View>
        </View>

        {/* Section Tabs */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${currentSection === 'MCQ' ? 'bg-teal-400' : ''
              }`}
          >
            <Text className={`font-semibold text-center ${currentSection === 'MCQ' ? 'text-white' : 'text-gray-600'
              }`}>
              Trắc nghiệm ({mcqQuestions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${currentSection === 'FRQ' ? 'bg-purple-400' : ''
              }`}
          >
            <Text className={`font-semibold text-center ${currentSection === 'FRQ' ? 'text-white' : 'text-gray-600'
              }`}>
              Tự luận ({frqQuestions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600">
              Câu {currentQuestionIndex + 1} / {currentQuestions.length} ({currentSection})
            </Text>
            <Text className="text-sm text-gray-600">
              Tiến độ: {Object.keys(answers).length} / {questions.length}
            </Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-2">
            <View
              className="bg-teal-400 h-2 rounded-full"
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </View>
        </View>
      </View>

      {/* Question Content */}
      <ScrollView className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll} // scroll behavior 
        scrollEventThrottle={16} // scroll behavior 
      >
        <View className="bg-white rounded-2xl p-6 my-6 shadow-sm border border-gray-100">
          {/* Question */}
          <Text className="text-xl font-bold text-gray-900 mb-6">
            {currentQuestion.question}
          </Text>

          {/* MCQ Options */}
          {currentQuestion.type === 'MCQ' && currentQuestion.options && (
            <View className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleMCQAnswer(currentQuestion.id, option)}
                  className={`p-4 my-1 rounded-xl border-2 ${answers[currentQuestion.id] === option
                    ? 'bg-teal-100 border-teal-300'
                    : 'bg-white border-gray-200'
                    }`}
                >
                  <View className="flex-row items-center">
                    <Text className={`text-lg font-semibold mr-3 ${answers[currentQuestion.id] === option ? 'text-teal-700' : 'text-gray-700'
                      }`}>
                      {String.fromCharCode(65 + index)}.
                    </Text>
                    <Text className={`text-base flex-1 ${answers[currentQuestion.id] === option ? 'text-teal-700' : 'text-gray-700'
                      }`}>
                      {option}
                    </Text>
                    {answers[currentQuestion.id] === option && (
                      <CheckCircle size={20} color="#3CBCB2" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* FRQ Text Input */}
          {currentQuestion.type === 'FRQ' && (
            <View>
              <Text className="text-gray-600 mb-4">
                Nhập câu trả lời của bạn (không giới hạn độ dài)
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-gray-900 min-h-[150px] text-base"
                placeholder="Nhập câu trả lời của bạn..."
                placeholderTextColor="#9CA3AF"
                value={answers[currentQuestion.id] || ''}
                onChangeText={(text) => handleFRQAnswer(currentQuestion.id, text)}
                multiline
                textAlignVertical="top"
                style={{ maxHeight: 300 }}
              />
              <Text className="text-sm text-gray-500 mt-2 text-right">
                {answers[currentQuestion.id]?.length || 0} ký tự
              </Text>
            </View>
          )}
        </View>

        {/* Question Navigation */}
        <View className="bg-white rounded-2xl p-4 mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-3">
            Chọn câu hỏi ({currentSection}):
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-2">
              {currentQuestions.map((question, index) => (
                <TouchableOpacity
                  key={question.id}
                  onPress={() => navigateToQuestion(index)}
                  className={`w-10 h-10 mx-1 rounded-lg items-center justify-center ${index === currentQuestionIndex
                    ? 'bg-teal-400'
                    : answers[question.id]
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-gray-100'
                    }`}
                >
                  <Text className={`font-medium ${index === currentQuestionIndex
                    ? 'text-white'
                    : answers[question.id]
                      ? 'text-green-800'
                      : 'text-gray-600'
                    }`}>
                    {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity
            onPress={() => navigateToQuestion(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-xl ${currentQuestionIndex === 0 ? 'bg-gray-100' : 'bg-white border border-gray-200'
              }`}
          >
            <Text className={`font-medium ${currentQuestionIndex === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
              ← Trước
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextSection}
            className="bg-teal-400 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">
              {currentSection === 'MCQ' ? 'Chuyển phần →' : 'Nộp bài'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateToQuestion(Math.min(currentQuestions.length - 1, currentQuestionIndex + 1))}
            disabled={currentQuestionIndex === currentQuestions.length - 1}
            className={`px-6 py-3 rounded-xl ${currentQuestionIndex === currentQuestions.length - 1 ? 'bg-gray-100' : 'bg-white border border-gray-200'
              }`}
          >
            <Text className={`font-medium ${currentQuestionIndex === currentQuestions.length - 1 ? 'text-gray-400' : 'text-gray-700'
              }`}>
              Tiếp →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Warning */}
        <View className="bg-red-50 rounded-xl p-4 mb-8">
          <Text className="text-sm font-medium text-red-800 mb-2">⚠️ Lưu ý:</Text>
          <Text className="text-sm text-red-700">
            • Thời gian sẽ được tính cho toàn bộ bài thi{'\n'}
            • Không thể quay lại phần trước khi chuyển tiếp{'\n'}
            • Hãy kiểm tra kỹ trước khi nộp bài
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default FullTestScreen;
