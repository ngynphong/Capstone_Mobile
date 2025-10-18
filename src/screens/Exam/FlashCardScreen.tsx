import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  ArrowLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react-native';

import {ExamStackParamList} from '../../types/examTypes';

type NavigationProp = NativeStackNavigationProp<ExamStackParamList>;
type RouteProps = RouteProp<ExamStackParamList, 'FlashCard'>;

const FlashCardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const {session} = route.params;

  const [currentIndex, setCurrentIndex] = useState(session.currentIndex);
  const [showAnswer, setShowAnswer] = useState(false);
  const [learnedCards, setLearnedCards] = useState<Set<number>>(new Set());

  const currentQuestion = session.questions[currentIndex];
  const progress = ((currentIndex + 1) / session.questions.length) * 100;

  // Simple card flip without animation
  const flipCard = () => {
    console.log('Flip card triggered, current showAnswer:', showAnswer);
    setShowAnswer(!showAnswer);
  };

  // Handle next card
  const handleNext = () => {
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Completed all cards
      Alert.alert(
        'Hoàn thành!',
        `Bạn đã học xong tất cả ${session.questions.length} câu hỏi!`,
        [
          {text: 'Làm lại', onPress: () => resetSession()},
          {text: 'Thoát', onPress: () => navigation.goBack()},
        ],
      );
    }
  };

  // Handle previous card
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  // Reset session
  const resetSession = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setLearnedCards(new Set());
  };

  // Mark card as learned
  const markAsLearned = () => {
    setLearnedCards(prev => new Set([...prev, currentIndex]));
    handleNext();
  };

  // Simple state-based card display

  if (!currentQuestion) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">No questions available</Text>
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
            onPress={resetSession}
            className="flex-row items-center"
          >
            <RotateCcw size={20} color="#3CBCB2" />
            <Text className="text-teal-600 ml-1">Trang chủ</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-600">
              Bài học: {currentIndex + 1} • Loại: MCQ • Chế độ: Flashcard
            </Text>
            <Text className="text-sm text-gray-600">
              Câu {currentIndex + 1} / {session.questions.length}
            </Text>
          </View>
          <View className="w-full bg-gray-200 rounded-full h-2">
            <View
              className="bg-teal-400 h-2 rounded-full"
              style={{width: `${progress}%`}}
            />
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 mt-10 px-6">
        {/* Flash Card - Simple version without animation */}
        <View className="items-center mb-8">
          {!showAnswer ? (
            /* Front of card */
            <View className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 w-full">
              <View className="items-center justify-center min-h-[200px]">
                <TouchableOpacity
                  onPress={flipCard}
                  className="items-center w-full"
                >
                  <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
                    {currentQuestion.question}
                  </Text>
                  <View className="flex-row items-center justify-center">
                    <Eye size={20} color="#3CBCB2" />
                    <Text className="text-teal-600 ml-2">
                      Nhấn để lật và xem đáp án
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Back of card */
            <View className="bg-teal-50 rounded-2xl p-8 shadow-lg border border-teal-200 w-full">
              <View className="min-h-[200px] justify-center items-center">
                <Text className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Đáp án
                </Text>
                <Text className="text-lg text-gray-800 mb-4 text-center">
                  {currentQuestion.correctAnswer}
                </Text>
                {currentQuestion.explanation && (
                  <Text className="text-sm text-gray-600 text-center italic">
                    {currentQuestion.explanation}
                  </Text>
                )}
                <TouchableOpacity
                  onPress={flipCard}
                  className="mt-4 bg-white px-4 py-2 rounded-lg border border-gray-200"
                >
                  <Text className="text-gray-700 font-medium">
                    Lật lại câu hỏi
                  </Text>
                </TouchableOpacity>
              </View>
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
            <ChevronLeft
              size={20}
              color={currentIndex === 0 ? '#9CA3AF' : '#374151'}
            />
            <Text
              className={`ml-2 ${currentIndex === 0 ? 'text-gray-400' : 'text-gray-700'}`}
            >
              Trước
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={markAsLearned}
            className="bg-teal-400 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">
              {currentIndex === session.questions.length - 1
                ? 'Hoàn thành'
                : 'Tiếp'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className="flex-row items-center px-6 py-3 rounded-xl bg-white border border-gray-200"
          >
            <Text className="text-gray-700 mr-2">Bỏ qua</Text>
            <ChevronRight size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Progress Summary */}
        <View className="bg-blue-50 rounded-xl p-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-blue-800">
              Đã học: {learnedCards.size} / {session.questions.length}
            </Text>
            <Text className="text-sm text-blue-800">
              {Math.round((learnedCards.size / session.questions.length) * 100)}
              % hoàn thành
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FlashCardScreen;
