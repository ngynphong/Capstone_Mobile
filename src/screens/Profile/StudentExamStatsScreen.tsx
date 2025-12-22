import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useStudentDashboardStats } from '../../hooks/useStudentDashboardStats';
import { ProfileStackParamList } from '../../types/types';
import {
    TrendingUp,
    BookOpen,
    Award,
    Clock,
    Target,
    ChevronLeft,
    Star,
    Calendar,
    BarChart3,
    ChartNoAxesGantt,
    BookCheck,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

const StudentExamStatsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { user } = useAuth();
    const { stats, loading, fetchStats } = useStudentDashboardStats();
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#F59E0B';
        return '#EF4444';
    };

    const getPerformanceLevel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Need improvement';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    color={i <= rating ? '#F59E0B' : '#E5E7EB'}
                    fill={i <= rating ? '#F59E0B' : 'none'}
                />
            );
        }
        return stars;
    };

    // Get max score in topic performance for progress bar calculation
    const maxTopicScore = stats?.topicPerformance
        ? Math.max(...Object.values(stats.topicPerformance), 100)
        : 100;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View style={{ backgroundColor: '#3CBCB2' }} className="px-6 pt-4 pb-8 rounded-b-3xl shadow-lg">
                {/* Back Button and Title */}
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold flex-1">Exam Statistics</Text>
                </View>

                <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1 mr-4">
                        <Text className="text-white/70 text-xs font-medium uppercase tracking-wider">
                            {getGreeting()}
                        </Text>
                        <Text className="text-white text-2xl font-bold mt-2 mb-1">
                            {user?.firstName || 'Student'}
                        </Text>
                        <Text className="text-white/80 text-sm leading-5">
                            Track your progress{'\n'}in exams
                        </Text>
                        <BookCheck size={20} color="white" />
                    </View>

                    {/* User Avatar */}
                    <View className="items-center">
                        <View className="w-16 h-16 bg-white rounded-full items-center justify-center p-0.5">
                            <View className="w-full h-full bg-teal-500 rounded-full items-center justify-center overflow-hidden">
                                {user?.imgUrl ? (
                                    <Image
                                        source={{ uri: user.imgUrl }}
                                        className="w-full h-full rounded-full"
                                    />
                                ) : (
                                    <Text className="text-2xl">👤</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Stats Bar */}
                <View className="flex-row items-center justify-between bg-white/10 rounded-xl px-4 py-3 backdrop-blur">
                    <View className="items-center flex-1">
                        <Text className="text-white text-xl font-bold">{stats?.totalExamsTaken || 0}</Text>
                        <Text className="text-white/70 text-xs mt-0.5">Exams</Text>
                    </View>
                    <View className="w-px h-8 bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-white text-xl font-bold">{stats?.averageScore?.toFixed(1) || 0}</Text>
                        <Text className="text-white/70 text-xs mt-0.5">Average Score</Text>
                    </View>
                    <View className="w-px h-8 bg-white/20" />
                    <View className="items-center flex-1">
                        <Text className="text-white text-xl font-bold">{stats?.examsInProgress || 0}</Text>
                        <Text className="text-white/70 text-xs mt-0.5">Exams In Progress</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3CBCB2']} />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading && !stats ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#3CBCB2" />
                        <Text className="text-gray-500 mt-4">Loading statistics...</Text>
                    </View>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <View className="px-6 py-6">
                            <View className="flex-row items-center gap-2 mb-4">
                                <ChartNoAxesGantt color={"#3CBCB2"} />
                                <Text className="text-lg font-bold text-gray-800">Overview</Text>
                            </View>
                            <View className="flex-row flex-wrap justify-between">
                                {/* Total Exams */}
                                <View className="w-[48%] mb-4">
                                    <View style={{ backgroundColor: '#3B82F6' }} className="rounded-2xl p-4 shadow-md">
                                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                                            <BookOpen size={20} color="white" />
                                        </View>
                                        <Text className="text-white text-3xl font-bold">{stats?.totalExamsTaken || 0}</Text>
                                        <Text className="text-white/90 text-sm mt-1">Exams taken</Text>
                                    </View>
                                </View>

                                {/* Average Score */}
                                <View className="w-[48%] mb-4">
                                    <View style={{ backgroundColor: '#10B981' }} className="rounded-2xl p-4 shadow-md">
                                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                                            <Award size={20} color="white" />
                                        </View>
                                        <Text className="text-white text-3xl font-bold">{stats?.averageScore?.toFixed(1) || 0}%</Text>
                                        <Text className="text-white/90 text-sm mt-1">Average score</Text>
                                    </View>
                                </View>

                                {/* Exams In Progress */}
                                <View className="w-[48%] mb-4">
                                    <View style={{ backgroundColor: '#8B5CF6' }} className="rounded-2xl p-4 shadow-md">
                                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                                            <Clock size={20} color="white" />
                                        </View>
                                        <Text className="text-white text-3xl font-bold">{stats?.examsInProgress || 0}</Text>
                                        <Text className="text-white/90 text-sm mt-1">Exams in progress</Text>
                                    </View>
                                </View>

                                {/* Recommended Topic */}
                                <View className="w-[48%] mb-4">
                                    <View style={{ backgroundColor: '#F59E0B' }} className="rounded-2xl p-4 shadow-md">
                                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                                            <Target size={20} color="white" />
                                        </View>
                                        <Text className="text-white text-base font-bold" numberOfLines={2}>
                                            {stats?.recommendedTopic || 'Chưa có'}
                                        </Text>
                                        <Text className="text-white/90 text-sm mt-1">Recommended topic</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Topic Performance */}
                        {stats?.topicPerformance && Object.keys(stats.topicPerformance).length > 0 && (
                            <View className="px-6 pb-6">
                                <View className="flex-row items-center mb-4">
                                    <BarChart3 size={20} color="#374151" />
                                    <Text className="text-lg font-bold text-gray-800 ml-2">Topic performance</Text>
                                </View>
                                <View className="bg-white rounded-2xl p-4 shadow-sm">
                                    {Object.entries(stats.topicPerformance).map(([topic, score], index) => (
                                        <View key={topic} className={index > 0 ? 'mt-4' : ''}>
                                            <View className="flex-row justify-between mb-2">
                                                <Text className="text-gray-700 font-medium flex-1 mr-2" numberOfLines={1}>
                                                    {topic}
                                                </Text>
                                                <Text
                                                    className="font-bold"
                                                    style={{ color: getScoreColor(score) }}
                                                >
                                                    {score.toFixed(1)}%
                                                </Text>
                                            </View>
                                            <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(score / maxTopicScore) * 100}%`,
                                                        backgroundColor: getScoreColor(score),
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Recent Attempts */}
                        <View className="px-6 pb-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <Calendar size={20} color="#374151" />
                                    <Text className="text-lg font-bold text-gray-800 ml-2">Recent attempts</Text>
                                </View>
                                {stats?.recentAttempts && stats.recentAttempts.length > 3 && (
                                    <TouchableOpacity onPress={() => navigation.navigate('ExamResults')}>
                                        <Text className="text-teal-600 font-medium">View all</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {!stats?.recentAttempts || stats.recentAttempts.length === 0 ? (
                                <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                                    <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-4">
                                        <BookOpen size={40} color="#3CBCB2" />
                                    </View>
                                    <Text className="text-gray-800 font-semibold text-lg mb-2">
                                        No exam attempts
                                    </Text>
                                    <Text className="text-gray-500 text-center">
                                        Start taking exams to see{'\n'}your learning results
                                    </Text>
                                </View>
                            ) : (
                                <View className="space-y-3">
                                    {stats.recentAttempts.slice(0, 5).map((attempt, index) => (
                                        <TouchableOpacity
                                            key={attempt.attemptId}
                                            className="bg-white rounded-2xl p-4 shadow-sm mb-2"
                                            activeOpacity={0.7}
                                        >
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-1 mr-3">
                                                    <Text className="font-bold text-gray-800 text-base" numberOfLines={2}>
                                                        {attempt.title}
                                                    </Text>
                                                    <Text className="text-sm text-gray-500 mt-1">
                                                        {formatDate(attempt.startTime)}
                                                    </Text>
                                                    <View className="flex-row items-center mt-2">
                                                        <View
                                                            className="px-2 py-1 rounded-full mr-2"
                                                            style={{
                                                                backgroundColor:
                                                                    attempt.status === 'COMPLETED'
                                                                        ? '#D1FAE5'
                                                                        : attempt.status === 'IN_PROGRESS'
                                                                            ? '#FEF3C7'
                                                                            : '#F3F4F6',
                                                            }}
                                                        >
                                                            <Text
                                                                className="text-xs font-medium"
                                                                style={{
                                                                    color:
                                                                        attempt.status === 'COMPLETED'
                                                                            ? '#059669'
                                                                            : attempt.status === 'IN_PROGRESS'
                                                                                ? '#D97706'
                                                                                : '#6B7280',
                                                                }}
                                                            >
                                                                {attempt.status === 'COMPLETED'
                                                                    ? 'Completed'
                                                                    : attempt.status === 'IN_PROGRESS'
                                                                        ? 'In progress'
                                                                        : attempt.status}
                                                            </Text>
                                                        </View>
                                                        {attempt.rating > 0 && (
                                                            <View className="flex-row items-center">
                                                                {renderStars(attempt.rating)}
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                                <View className="items-center">
                                                    <Text
                                                        className="font-bold text-2xl"
                                                        style={{ color: getScoreColor(attempt.score) }}
                                                    >
                                                        {attempt.score.toFixed(0)}
                                                    </Text>
                                                    <Text className="text-xs text-gray-500 mt-1">Score</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Bottom Spacing */}
                        <View className="h-20" />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default StudentExamStatsScreen;
