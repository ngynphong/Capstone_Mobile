import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Clock, BookOpen, Play, FileText, Star } from 'lucide-react-native';

import { useScroll } from '../../context/ScrollContext';
import { useAppToast } from '../../utils/toast';
import { useExamDetails } from '../../hooks/useExam';
import { useExamAttempt } from '../../hooks/useExamAttempt';
import { useExamTemplateRatings } from '../../hooks/useExamTemplateRatings';

const ExamDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { examId } = route.params as { examId: string };

    const { handleScroll } = useScroll();
    const toast = useAppToast();

    const { exam, loading, error } = useExamDetails(examId);
    const { startSingleAttempt, loading: attemptLoading } = useExamAttempt();
    const { ratings, loading: ratingsLoading, pagination } = useExamTemplateRatings(examId);
    const [isStartingTest, setIsStartingTest] = useState(false);

    useEffect(() => {
        if (error) {
            toast.error('Failed to load exam details');
            navigation.goBack();
        }
    }, [error, toast, navigation]);



    const handleFullTest = () => {
        if (exam) {
            // Show confirmation for full test
            Alert.alert(
                'Full Test Warning',
                `This is a full test including both Multiple Choice and Free Response sections. The timer will start immediately. The exam costs ${exam.tokenCost.toLocaleString('vi-VN')} VNĐ.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Start Full Test',
                        style: 'destructive',
                        onPress: () => startFullTest(),
                    },
                ]
            );
        }
    };

    const startFullTest = async () => {
        if (exam) {
            setIsStartingTest(true);
            try {
                const attempt = await startSingleAttempt({ templateId: exam.id });
                if (attempt) {
                    // Navigate to FullTest with attempt data
                    navigation.navigate('FullTest', { attempt });
                }
            } catch (error) {
                console.error('Failed to start full test:', error);
                toast.error('Failed to start full test');
            } finally {
                setIsStartingTest(false);
            }
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
            <ScrollView showsVerticalScrollIndicator={false}
                onScroll={handleScroll} // scroll behavior
                scrollEventThrottle={16}
                className="flex-1">
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
                        <View className="flex-1 mb-4">
                            <Text className="text-xl font-bold text-gray-900 mb-2">
                                {exam.title}
                            </Text>
                            <Text className="text-gray-600 mb-3">
                                {exam.description || 'Comprehensive exam covering various topics'}
                            </Text>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-sm font-medium text-gray-700">Created by:</Text>
                                <Text className="text-sm text-gray-600 ml-2">{exam.createdBy}</Text>
                            </View>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-sm font-medium text-gray-700">Subjects:</Text>
                                <Text className="text-sm text-gray-600 ml-2">{exam.subject.name}</Text>
                            </View>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-sm font-medium text-gray-700">Passing Score:</Text>
                                <Text className="text-sm text-gray-600 ml-2">{exam.passingScore}</Text>
                            </View>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-sm font-medium text-gray-700">Cost:</Text>
                                <Text className="text-sm text-gray-600 ml-2">{exam.tokenCost.toLocaleString('vi-VN')} VNĐ</Text>
                            </View>
                            <View className="flex-row items-center mb-2">
                                <Text className="text-sm font-medium text-gray-700">Status:</Text>
                                <Text className={`text-sm ml-2 px-2 py-1 rounded-full ${exam.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {exam.isActive ? 'Active' : 'Inactive'}
                                </Text>
                            </View>
                        </View>

                        {/* Stats */}
                        <View className="flex-row items-center space-x-6">
                            <View className="flex-row items-center">
                                <Clock size={18} color="#6B7280" />
                                <Text className="text-sm text-gray-600 ml-2">
                                    {exam.duration} Min
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <BookOpen size={18} color="#6B7280" />
                                <Text className="text-sm text-gray-600 ml-2">
                                    {exam.rules.reduce((sum, rule) => sum + rule.numberOfQuestions, 0)} Questions
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Main Content */}
                <View className="flex-1 px-6 gap-2">

                    <TouchableOpacity
                        onPress={handleFullTest}
                        className="bg-white rounded-2xl p-6 mt-4 border border-gray-100"
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

                    {/* Reviews Section */}
                    <View className="bg-white rounded-2xl p-6 mb-4 border border-gray-100"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-yellow-100 rounded-xl items-center justify-center mr-3">
                                    <Star size={20} color="#F59E0B" fill="#F59E0B" />
                                </View>
                                <View>
                                    <Text className="text-lg font-semibold text-gray-900">
                                        Reviews
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        {pagination?.totalElement || 0} reviews
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center bg-yellow-50 px-3 py-1.5 rounded-full">
                                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                                <Text className="text-sm font-semibold text-yellow-700 ml-1">
                                    {exam.averageRating?.toFixed(1) || 'N/A'}
                                </Text>
                            </View>
                        </View>

                        {ratingsLoading ? (
                            <View className="py-4 items-center">
                                <ActivityIndicator size="small" color="#3CBCB2" />
                            </View>
                        ) : ratings.length === 0 ? (
                            <View className="py-4 items-center">
                                <Text className="text-gray-500">No ratings yet</Text>
                            </View>
                        ) : (
                            <View>
                                {ratings.slice(0, 3).map((rating, index) => (
                                    <View key={index} className="border-t border-gray-100 pt-3 mt-3">
                                        <View className="flex-row items-start">
                                            <Image
                                                source={{ uri: rating.rateBy.imgUrl || 'https://via.placeholder.com/40' }}
                                                className="w-10 h-10 rounded-full bg-gray-200"
                                            />
                                            <View className="flex-1 ml-3">
                                                <View className="flex-row items-center justify-between">
                                                    <Text className="text-sm font-medium text-gray-900">
                                                        {rating.rateBy.firstName} {rating.rateBy.lastName}
                                                    </Text>
                                                    <View className="flex-row items-center">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={12}
                                                                color="#F59E0B"
                                                                fill={star <= rating.rating ? "#F59E0B" : "none"}
                                                            />
                                                        ))}
                                                    </View>
                                                </View>
                                                {rating.comment && (
                                                    <Text className="text-sm text-gray-600 mt-1">
                                                        {rating.comment}
                                                    </Text>
                                                )}
                                                <Text className="text-xs text-gray-400 mt-1">
                                                    {new Date(rating.ratingTime).toLocaleDateString('vi-VN')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                                {ratings.length > 3 && (
                                    <TouchableOpacity className="mt-4 py-2">
                                        <Text className="text-center text-teal-600 font-medium">
                                            See all {pagination?.totalElement} ratings
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Full Test Mode Card */}


                    {/* Tips */}
                    <View className="bg-blue-50 rounded-xl p-4 mb-8">
                        <Text className="text-sm font-medium text-blue-800 mb-2">💡 Tips:</Text>
                        <Text className="text-sm text-blue-700">
                            • No time limit - take your time to think carefully about each question.{'\n'}
                            • You can practice multiple times to improve your skills{'\n'}
                            • Track your learning progress
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Loading Overlay */}
            {isStartingTest && (
                <View className="absolute inset-0 bg-white bg-opacity-50 justify-center items-center">
                    <View className="bg-white rounded-2xl p-8 items-center shadow-lg">
                        <ActivityIndicator size="large" color="#3CBCB2" />
                        <Text className="text-gray-900 font-semibold mt-4 text-lg">
                            Initializing the test...
                        </Text>
                        <Text className="text-gray-600 text-center mt-2">
                            Please wait a moment
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default ExamDetailScreen;
