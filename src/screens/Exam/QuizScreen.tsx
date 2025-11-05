import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react-native';

import { useScroll } from '../../context/ScrollContext';

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

  // Mock questions for now - in real app, these would come from API
  const questions = [
    {
      id: '1',
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and most populous city of France.'
    },
    {
      id: '2',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      explanation: '2 + 2 equals 4 in basic arithmetic.'
    },
    {
      id: '3',
      question: 'What is the largest planet in our solar system?',
      options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
      correctAnswer: 'Jupiter',
      explanation: 'Jupiter is the largest planet in our solar system.'
    },
  ];

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Calculate current score
  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
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
  const getOptionBgColor = (option: string, index: number) => {
    if (!showResult) {
      return selectedAnswer === option ? 'bg-teal-100 border-teal-300' : 'bg-white border-gray-200';
    }

    const correctAnswer = currentQuestion.correctAnswer;
    if (option === correctAnswer) {
      return 'bg-green-100 border-green-300';
    }
    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'bg-red-100 border-red-300';
    }
    return 'bg-gray-50 border-gray-200';
  };

  // Get option text color
  const getOptionTextColor = (option: string, index: number) => {
    if (!showResult) {
      return selectedAnswer === option ? 'text-teal-700' : 'text-gray-700';
    }

    const correctAnswer = currentQuestion.correctAnswer;
    if (option === correctAnswer) {
      return 'text-green-800';
    }
    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'text-red-800';
    }
    return 'text-gray-500';
  };

  if (!currentQuestion) {
    console.log('Quiz Error - No current question:', { currentIndex });
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">No Question Available</Text>
        <Text className="text-gray-600 text-center mb-6">
          Current Index: {currentIndex}
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Total Questions: {questions.length}
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
            {currentQuestion.question}
          </Text>

          {/* Options */}
          <View className="space-y-3">
            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={`${currentQuestion.id}-${index}`}
                  onPress={() => !showResult && handleAnswerSelect(option)}
                  disabled={showResult}
                  className={`p-4 my-1 rounded-xl border-2 ${getOptionBgColor(option, index)}`}
                >
                  <View className="flex-row items-center">
                    <Text className={`text-lg font-semibold mr-3 ${getOptionTextColor(option, index)}`}>
                      {getOptionLetter(index)}.
                    </Text>
                    <Text className={`text-base flex-1 ${getOptionTextColor(option, index)}`}>
                      {option}
                    </Text>
                    {showResult && option === currentQuestion.correctAnswer && (
                      <CheckCircle size={20} color="#10B981" />
                    )}
                    {showResult && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
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

          {/* Explanation */}
          {showResult && currentQuestion.explanation && (
            <View className="mt-6 p-4 bg-blue-50 rounded-xl">
              <Text className="text-sm font-medium text-blue-800 mb-2">Giải thích:</Text>
              <Text className="text-sm text-blue-700">{currentQuestion.explanation}</Text>
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
