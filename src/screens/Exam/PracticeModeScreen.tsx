import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, FileText, Edit3, Clock, BookOpen } from 'lucide-react-native';

import { Exam } from '../../types/examTypes';
import { ExamService } from '../../services/examService';
import { useAppToast } from '../../utils/toast';
import { useScroll } from '../../context/ScrollContext';

const PracticeModeScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { examId } = route.params as { examId: string };

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);

    const toast = useAppToast();
    const { handleScroll } = useScroll();

    useEffect(() => {
        loadExamData();
    }, [examId]);

    const loadExamData = async () => {
        try {
            setLoading(true);
            const examResponse = await ExamService.getExamById({ id: examId });

            setExam(examResponse.data);
        } catch (error) {
            console.error('Error loading exam data:', error);
            toast.error('Failed to load exam data');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleMCQPractice = () => {
        // Navigate to Quiz screen with mock data for now
        navigation.navigate('Quiz', { examId });
    };

    const handleFRQPractice = () => {
        // Navigate to FRQ screen with mock data for now
        navigation.navigate('FRQ', { examId });
    };

    const handleFlashCard = () => {
        // Navigate to FlashCard screen with mock data for now
        navigation.navigate('FlashCard', { examId });
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#3CBCB2" />
                <Text className="text-gray-600 mt-4">Loading practice modes...</Text>
            </View>
        );
    }

    if (!exam) {
        return null;
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 shadow-sm">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-4 p-2"
                    >
                        <ArrowLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900">Practice Mode</Text>
                    </View>
                </View>

                {/* Exam Info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                        {exam.title}
                    </Text>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-600">
                            ⏱️ {exam.duration} phút • 📝 {exam.questionContents.length} câu hỏi
                        </Text>
                    </View>
                </View>

                {/* Mode Selection Tabs */}
                <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
                    <TouchableOpacity className="flex-1 bg-teal-400 rounded-lg py-3">
                        <Text className="text-white font-semibold text-center">Practice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 py-3"
                        onPress={() => navigation.navigate('FullTest', { examId })}
                    >
                        <Text className="text-gray-600 font-medium text-center">Full Test</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <ScrollView className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll} // scroll behavior 
                scrollEventThrottle={16} // scroll behavior 
            >
                <Text className="text-lg font-semibold text-gray-900 mb-6">
                    Chọn hình thức luyện tập phù hợp với bạn
                </Text>

                {/* MCQ Practice Card */}
                <TouchableOpacity
                    onPress={handleMCQPractice}
                    className="bg-white rounded-2xl p-6 mb-4 border border-gray-100"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <View className="flex-row items-center mb-4">
                        <View className="w-12 h-12 bg-teal-100 rounded-xl items-center justify-center mr-4">
                            <FileText size={24} color="#3CBCB2" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900 mb-1">
                                Trắc nghiệm (MCQ)
                            </Text>
                            <Text className="text-gray-600">
                                Luyện tập các câu hỏi trắc nghiệm để cải thiện tốc độ và độ chính xác
                            </Text>
                        </View>
                    </View>

                    <View className="bg-teal-50 rounded-xl p-4 mb-4">
                        <Text className="text-sm text-gray-600 mb-3">
                            Chọn chế độ luyện tập
                        </Text>

                        {/* Practice Mode Selection */}
                        <TouchableOpacity
                            onPress={handleFlashCard}
                            className="bg-white rounded-lg p-3 mb-3 border border-gray-200"
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-teal-100 rounded-lg items-center justify-center mr-3">
                                    <BookOpen size={16} color="#3CBCB2" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-medium text-gray-900">Flash Card</Text>
                                    <Text className="text-sm text-gray-600">Nhấn vào card để lật và xem đáp án</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleMCQPractice}
                            className="bg-white rounded-lg p-3 border border-gray-200"
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center mr-3">
                                    <Clock size={16} color="#8B5CF6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-medium text-gray-900">Bài Quiz</Text>
                                    <Text className="text-sm text-gray-600">Làm bài trắc nghiệm thông thường</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-600">
                            📝 Có sẵn
                        </Text>
                        <Text className="text-sm font-medium text-teal-600">
                            Bắt đầu làm bài →
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* FRQ Practice Card */}
                <TouchableOpacity
                    onPress={handleFRQPractice}
                    className="bg-white rounded-2xl p-6 mb-8 border border-gray-100"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <View className="flex-row items-center mb-4">
                        <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center mr-4">
                            <Edit3 size={24} color="#8B5CF6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900 mb-1">
                                Tự luận (FRQ)
                            </Text>
                            <Text className="text-gray-600">
                                Rèn luyện kỹ năng viết và trả lời các câu hỏi mở để hiểu sâu hơn về chủ đề
                            </Text>
                        </View>
                    </View>

                    <View className="bg-purple-50 rounded-xl p-4">
                        <Text className="text-sm text-gray-600 mb-2">
                            • Viết câu trả lời chi tiết{'\n'}
                            • Có đếm thời gian{'\n'}
                            • Luyện tập kỹ năng diễn đạt
                        </Text>
                    </View>

                    <View className="flex-row justify-between items-center mt-4">
                        <Text className="text-sm text-gray-600">
                            ✍️ Có sẵn
                        </Text>
                        <Text className="text-sm font-medium text-purple-600">
                            Bắt đầu làm bài →
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Tips */}
                <View className="bg-blue-50 rounded-xl p-4 mb-8">
                    <Text className="text-sm font-medium text-blue-800 mb-2">💡 Mẹo:</Text>
                    <Text className="text-sm text-blue-700">
                        • Không giới hạn thời gian - hãy dành thời gian suy nghĩ kỹ từng câu hỏi{'\n'}
                        • Có thể luyện tập nhiều lần để cải thiện kỹ năng{'\n'}
                        • Theo dõi tiến độ học tập của bạn
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default PracticeModeScreen;
