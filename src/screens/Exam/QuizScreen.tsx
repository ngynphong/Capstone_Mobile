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
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react-native';

import { useScroll } from '../../context/ScrollContext';
import { useGetAllQuestions } from '../../hooks/useQuestion';

const QuizScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { examId } = route.params as { examId: string };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const { handleScroll } = useScroll();

  // Use questions from API and filter for MCQ only
  const { questions: allQuestions, loading, error } = useGetAllQuestions({ pageSize: 50 });
  const questions = allQuestions.filter(q => q.type === 'mcq');
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Get the correct answer for questions
  const getCorrectAnswer = (question: any) => {
    if (question.type === 'mcq' && question.answers && question.answers.length > 0) {
      // For MCQ, assume the first answer is correct
      return question.answers[0].content;
    }
    if (question.type === 'frq' && question.answers && question.answers.length > 0) {
      return question.answers[0].content;
    }
    return '';
  };

  // Calculate current score
  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      const correctAns = getCorrectAnswer(question);
      if (answers[question.id] === correctAns) {
        correct++;
      }
    });
    return correct;
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  // Handle next question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[questions[currentIndex + 1]?.id] || '');
      setShowResult(false);
    } else {
      // Quiz completed
      const finalScore = calculateScore();
      const percentage = Math.round((finalScore / questions.length) * 100);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      Alert.alert(
        'Hoàn thành Quiz!',
        `Điểm số: ${finalScore}/${questions.length} (${percentage}%)\nThời gian: ${timeSpent}s`,
        [
          { text: 'Xem lại', onPress: () => reviewAnswers() },
          { text: 'Làm lại', onPress: () => resetQuiz() },
          { text: 'Thoát', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(answers[questions[currentIndex - 1]?.id] || '');
      setShowResult(false);
    }
  };

  // Check answer
  const checkAnswer = () => {
    if (!selectedAnswer) {
      Alert.alert('Chọn đáp án', 'Vui lòng chọn một đáp án trước khi tiếp tục.');
      return;
    }
    setShowResult(true);
  };

  // Reset quiz
  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer('');
    setAnswers({});
    setShowResult(false);
  };

  // Review answers
  const reviewAnswers = () => {
    // Navigate to results screen or show review modal
    Alert.alert('Tính năng đang phát triển', 'Chức năng xem lại đáp án sẽ có trong phiên bản tiếp theo.');
  };

  // Get option letter
  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  // Get option background color
  const getOptionBgColor = (optionText: string, index: number) => {
    if (!showResult) {
      return selectedAnswer === optionText ? 'bg-teal-100 border-teal-300' : 'bg-white border-gray-200';
    }

    const correctAnswer = getCorrectAnswer(currentQuestion);
    if (optionText === correctAnswer) {
      return 'bg-green-100 border-green-300';
    }
    if (optionText === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'bg-red-100 border-red-300';
    }
    return 'bg-gray-50 border-gray-200';
  };

  // Get option text color
  const getOptionTextColor = (optionText: string, index: number) => {
    if (!showResult) {
      return selectedAnswer === optionText ? 'text-teal-700' : 'text-gray-700';
    }

    const correctAnswer = getCorrectAnswer(currentQuestion);
    if (optionText === correctAnswer) {
      return 'text-green-800';
    }
    if (optionText === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'text-red-800';
    }
    return 'text-gray-500';
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3CBCB2" />
        <Text className="text-gray-600 mt-4">Loading questions...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">Error Loading Questions</Text>
        <Text className="text-gray-600 text-center mb-6">{error}</Text>
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
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">No Questions Available</Text>
        <Text className="text-gray-600 text-center mb-6">
          No questions found. Please try again later.
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
            onPress={resetQuiz}
            className="flex-row items-center"
          >
            <RotateCcw size={20} color="#3CBCB2" />
            <Text className="text-teal-600 ml-1">Làm lại</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600">
              Bài học: {currentIndex + 1} • Loại: MCQ • Chế độ: Quiz
            </Text>
            <Text className="text-sm text-gray-600">
              Câu {currentIndex + 1} / {questions.length}
            </Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-2">
            <View
              className="bg-teal-400 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Score */}
        <View className="flex-row justify-center">
          <Text className="text-lg font-semibold text-gray-900">
            Điểm: {calculateScore()}/{currentIndex + (showResult ? 1 : 0)} đúng
          </Text>
        </View>
      </View>

      {/* Question Card */}
      <ScrollView className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll} 
        scrollEventThrottle={16} 
      >
        <View className="bg-white rounded-2xl p-6 my-6 shadow-sm border border-gray-100">
          {/* Question */}
          <Text className="text-xl font-bold text-gray-900 mb-6 text-center">
            {currentQuestion.content}
          </Text>

          {/* Options */}
          <View className="space-y-3">
            {currentQuestion.answers && currentQuestion.answers.length > 0 ? (
              currentQuestion.answers.map((answer, index) => (
                <TouchableOpacity
                  key={`${currentQuestion.id}-${index}`}
                  onPress={() => !showResult && handleAnswerSelect(answer.content)}
                  disabled={showResult}
                  className={`p-4 my-1 rounded-xl border-2 ${getOptionBgColor(answer.content, index)}`}
                >
                  <View className="flex-row items-center">
                    <Text className={`text-lg font-semibold mr-3 ${getOptionTextColor(answer.content, index)}`}>
                      {getOptionLetter(index)}.
                    </Text>
                    <Text className={`text-base flex-1 ${getOptionTextColor(answer.content, index)}`}>
                      {answer.content}
                    </Text>
                    {showResult && answer.content === getCorrectAnswer(currentQuestion) && (
                      <CheckCircle size={20} color="#10B981" />
                    )}
                    {showResult && answer.content === selectedAnswer && answer.content !== getCorrectAnswer(currentQuestion) && (
                      <XCircle size={20} color="#EF4444" />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="p-4 bg-gray-100 rounded-xl">
                <Text className="text-gray-600 text-center">No options available for this question</Text>
              </View>
            )}
          </View>

          {/* Explanation - Note: QuestionBankItem doesn't have explanation field */}
          {showResult && (
            <View className="mt-6 p-4 bg-blue-50 rounded-xl">
              <Text className="text-sm font-medium text-blue-800 mb-2">Kết quả:</Text>
              <Text className="text-sm text-blue-700">
                Đáp án đúng: {getCorrectAnswer(currentQuestion)}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            className={`flex-row items-center px-6 py-3 rounded-xl ${currentIndex === 0 ? 'bg-gray-100' : 'bg-white border border-gray-200'
              }`}
          >
            <Text className={`font-medium ${currentIndex === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
              ← Trước
            </Text>
          </TouchableOpacity>

          {!showResult ? (
            <TouchableOpacity
              onPress={checkAnswer}
              className="bg-teal-400 px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Kiểm tra</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              className="bg-teal-400 px-8 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">
                {currentIndex === questions.length - 1 ? 'Hoàn thành' : 'Tiếp →'}
              </Text>
            </TouchableOpacity>
          )}

        </View>

        {/* Progress Summary */}
        <View className="bg-gray-50 rounded-xl p-4 mb-8">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-600">
              Tiến độ: {currentIndex + 1} / {questions.length}
            </Text>
            <Text className="text-sm text-gray-600">
              {Math.round(progress)}% hoàn thành
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default QuizScreen;
