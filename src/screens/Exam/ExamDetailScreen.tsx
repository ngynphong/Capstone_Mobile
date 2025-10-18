import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Clock, Users, BookOpen, TrendingUp, Play, FileText } from 'lucide-react-native';

import { Exam, ExamStackParamList } from '../../types/examTypes';
import { ExamService } from '../../services/examService';
import { useScroll } from '../../context/ScrollContext';
import { useAppToast } from '../../utils/toast';

type NavigationProp = NativeStackNavigationProp<ExamStackParamList>;
type RouteProps = RouteProp<ExamStackParamList, 'ExamDetail'>;

const ExamDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { examId } = route.params;

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);

    const { handleScroll } = useScroll();
    const toast = useAppToast();

    useEffect(() => {
        loadExamDetails();
    }, [examId]);

    const loadExamDetails = async () => {
        try {
            setLoading(true);
            const examData = await ExamService.getExamById(examId);
            if (examData) {
                setExam(examData);
            } else {
                toast.error('Exam not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading exam details:', error);
            toast.error('Failed to load exam details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handlePracticeMode = () => {
        if (exam) {
            navigation.navigate('PracticeMode', { examId: exam.id });
        }
    };

    const handleFullTest = () => {
        if (exam) {
            Alert.alert(
                'Full Test Warning',
                'This is a full test including both Multiple Choice and Free Response sections. The timer will start immediately.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Start Full Test', style: 'destructive', onPress: () => startFullTest() },
                ]
            );
        }
    };

    const startFullTest = () => {
        if (exam) {
            navigation.navigate('FullTest', { examId: exam.id });
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-100 text-green-800';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'Hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyDotColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy':
                return '#10B981';
            case 'Medium':
                return '#F59E0B';
            case 'Hard':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#3CBCB2" />
                <Text className="text-gray-600 mt-4">Loading exam details...</Text>
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
                        <Text className="text-2xl font-bold text-gray-900">Exam Test</Text>
                    </View>
                </View>

                {/* Exam Info Card */}
                <View className="bg-white rounded-2xl p-6 border border-gray-100">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900 mb-2">
                                {exam.title} - Level {exam.level}
                            </Text>
                            <Text className="text-gray-600 mb-3">
                                {exam.description || 'Comprehensive exam covering various topics'}
                            </Text>
                        </View>
                        <View className="flex-row items-center ml-4">
                            <View
                                className={`w-3 h-3 rounded-full mr-2`}
                                style={{ backgroundColor: getDifficultyDotColor(exam.difficulty) }}
                            />
                            <Text className={`text-sm font-medium px-3 py-1 rounded-full ${getDifficultyColor(exam.difficulty)}`}>
                                {exam.difficulty}
                            </Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View className="flex-row items-center mb-4 space-x-6">
                        <View className="flex-row items-center">
                            <BookOpen size={18} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                                {exam.sentences} Sentences
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Users size={18} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                                {exam.questions} Questions
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Clock size={18} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                                {exam.duration} Min
                            </Text>
                        </View>
                    </View>

                    {/* Progress */}
                    <View className="mb-4">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-sm text-gray-600">Popularity</Text>
                            <Text className="text-sm text-gray-600">
                                {exam.attempts || 0} attempts
                            </Text>
                        </View>
                        <View className="w-full bg-gray-200 rounded-full h-2">
                            <View
                                className="bg-teal-400 h-2 rounded-full"
                                style={{ width: `${Math.min(100, (exam.attempts || 0) / 5)}%` }}
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* Main Content */}
            <ScrollView className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll} // scroll behavior 
                scrollEventThrottle={16}
            >
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                    Chọn hình thức luyện tập phù hợp với bạn
                </Text>

                {/* Practice Mode Card */}
                <TouchableOpacity
                    onPress={handlePracticeMode}
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
                            <Play size={24} color="#3CBCB2" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900 mb-1">
                                Practice
                            </Text>
                            <Text className="text-gray-600">
                                Choose specific question types to practice
                            </Text>
                        </View>
                    </View>

                    <View className="bg-teal-50 rounded-xl p-4">
                        <Text className="text-sm text-gray-600 mb-2">
                            • Multiple Choice (MCQ) - Trắc nghiệm{'\n'}
                            • Free Response (FRQ) - Tự luận{'\n'}
                            • Flash cards and quiz modes available
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Full Test Mode Card */}
                <TouchableOpacity
                    onPress={handleFullTest}
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
                            <FileText size={24} color="#8B5CF6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900 mb-1">
                                Full Test
                            </Text>
                            <Text className="text-gray-600">
                                Complete exam with both MCQ and FRQ sections
                            </Text>
                        </View>
                    </View>

                    <View className="bg-orange-50 rounded-xl p-4">
                        <Text className="text-sm text-gray-600 mb-2">
                            ⚠️ Warning: Timer starts immediately{'\n'}
                            • Complete Multiple Choice section{'\n'}
                            • Continue to Free Response section{'\n'}
                            • Full exam experience
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Tips */}
                <View className="bg-blue-50 rounded-xl p-4 mb-8">
                    <Text className="text-sm font-medium text-blue-800 mb-2">💡 Tips:</Text>
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

export default ExamDetailScreen;
