import React, { useState } from 'react';
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
import { useParent } from '../../hooks/useParent';
import { useParentDashboardStats } from '../../hooks/useParentDashboardStats';
import { ChildInfo } from '../../types/parent';
import {
    BookOpen,
    Award,
    Clock,
    Target,
    Star,
    Calendar,
    BarChart3,
    Users,
    ChevronDown,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ParentExamStatsScreen = () => {
    const { children, loading: childrenLoading, fetchChildren } = useParent();
    const [selectedChild, setSelectedChild] = useState<ChildInfo | null>(null);
    const [showChildPicker, setShowChildPicker] = useState(false);
    const { stats, loading: statsLoading, fetchStats } = useParentDashboardStats(selectedChild?.studentId || null);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = new Animated.Value(0);

    useFocusEffect(
        React.useCallback(() => {
            fetchChildren();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
            useNativeDriver: true,
        }).start();
    }, []));

    useFocusEffect(
        React.useCallback(() => {
        // Auto-select first child if available
        if (children.length > 0 && !selectedChild) {
            setSelectedChild(children[0]);
        }
    }, [children]));

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchChildren();
        if (selectedChild) {
            await fetchStats();
        }
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

    const maxTopicScore = stats?.topicPerformance
        ? Math.max(...Object.values(stats.topicPerformance), 100)
        : 100;

    const handleSelectChild = (child: ChildInfo) => {
        setSelectedChild(child);
        setShowChildPicker(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View style={{ backgroundColor: '#3CBCB2' }} className="px-6 pt-4 pb-8 rounded-b-3xl shadow-lg">
                <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1 mr-4">
                        <Text className="text-white/70 text-xs font-medium uppercase tracking-wider">
                            {getGreeting()}
                        </Text>
                        <Text className="text-white text-2xl font-bold mt-2 mb-1">
                            Child Exam Statistics
                        </Text>
                        <Text className="text-white/80 text-sm leading-5">
                            Track your child's progress{'\n'}in exams 📚
                        </Text>
                    </View>

                    {/* Icon */}
                    <View className="items-center">
                        <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center">
                            <BarChart3 size={32} color="white" />
                        </View>
                    </View>
                </View>

                {/* Child Selector */}
                <TouchableOpacity
                    className="bg-white/10 rounded-xl px-4 py-3 flex-row items-center justify-between"
                    onPress={() => setShowChildPicker(!showChildPicker)}
                >
                    {selectedChild ? (
                        <View className="flex-row items-center flex-1">
                            <Image
                                source={{ uri: selectedChild.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=random' }}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <View className="flex-1">
                                <Text className="text-white font-bold">{selectedChild.studentName}</Text>
                                <Text className="text-white/70 text-xs">{selectedChild.email}</Text>
                            </View>
                        </View>
                    ) : (
                        <View className="flex-row items-center">
                            <Users size={20} color="white" />
                            <Text className="text-white ml-2">Select a child</Text>
                        </View>
                    )}
                    <ChevronDown size={20} color="white" />
                </TouchableOpacity>

                {/* Child Picker Dropdown */}
                {showChildPicker && children.length > 0 && (
                    <View className="bg-white rounded-xl mt-2 shadow-lg overflow-hidden">
                        {children.map((child) => (
                            <TouchableOpacity
                                key={child.studentId}
                                className={`flex-row items-center p-3 border-b border-gray-100 ${selectedChild?.studentId === child.studentId ? 'bg-teal-50' : ''
                                    }`}
                                onPress={() => handleSelectChild(child)}
                            >
                                <Image
                                    source={{ uri: child.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=random' }}
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800">{child.studentName}</Text>
                                    <Text className="text-gray-500 text-xs">{child.email}</Text>
                                </View>
                                {selectedChild?.studentId === child.studentId && (
                                    <View className="w-5 h-5 bg-teal-500 rounded-full items-center justify-center">
                                        <Text className="text-white text-xs">✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Quick Stats Bar */}
                {selectedChild && stats && (
                    <View className="flex-row items-center justify-between bg-white/10 rounded-xl px-4 py-3 mt-3">
                        <View className="items-center flex-1">
                            <Text className="text-white text-xl font-bold">{stats.totalExamsTaken || 0}</Text>
                            <Text className="text-white/70 text-xs mt-0.5">Exams</Text>
                        </View>
                        <View className="w-px h-8 bg-white/20" />
                        <View className="items-center flex-1">
                            <Text className="text-white text-xl font-bold">{stats.averageScore?.toFixed(1) || 0}</Text>
                            <Text className="text-white/70 text-xs mt-0.5">Average</Text>
                        </View>
                        <View className="w-px h-8 bg-white/20" />
                        <View className="items-center flex-1">
                            <Text className="text-white text-xl font-bold">{stats.examsInProgress || 0}</Text>
                            <Text className="text-white/70 text-xs mt-0.5">In Progress</Text>
                        </View>
                    </View>
                )}
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3CBCB2']} />
                }
                showsVerticalScrollIndicator={false}
            >
                {childrenLoading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#3CBCB2" />
                        <Text className="text-gray-500 mt-4">Loading children...</Text>
                    </View>
                ) : children.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20 px-6">
                        <View className="w-24 h-24 bg-teal-100 rounded-full items-center justify-center mb-6">
                            <Users size={48} color="#3CBCB2" />
                        </View>
                        <Text className="text-gray-800 font-bold text-xl mb-2 text-center">
                            No children linked
                        </Text>
                        <Text className="text-gray-500 text-center leading-6">
                            Go to the "Children" tab to link{'\n'}with your child's account
                        </Text>
                    </View>
                ) : !selectedChild ? (
                    <View className="flex-1 items-center justify-center py-20 px-6">
                        <View className="w-24 h-24 bg-teal-100 rounded-full items-center justify-center mb-6">
                            <Users size={48} color="#3CBCB2" />
                        </View>
                        <Text className="text-gray-800 font-bold text-xl mb-2 text-center">
                            Select a child
                        </Text>
                        <Text className="text-gray-500 text-center leading-6">
                            Tap the selector above to choose{'\n'}a child to view statistics
                        </Text>
                    </View>
                ) : statsLoading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#3CBCB2" />
                        <Text className="text-gray-500 mt-4">Loading statistics...</Text>
                    </View>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <View className="px-6 py-6">
                            <Text className="text-lg font-bold text-gray-800 mb-4">📊 Overview</Text>
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
                                        <Text className="text-white text-3xl font-bold">{stats?.averageScore?.toFixed(1) || 0}</Text>
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
                                        <Text className="text-white text-lg font-bold" numberOfLines={2}>
                                            {stats?.recommendedTopic || 'None'}
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
                                        Your child hasn't taken{'\n'}any exams yet
                                    </Text>
                                </View>
                            ) : (
                                <View className="space-y-3">
                                    {stats.recentAttempts.slice(0, 5).map((attempt) => (
                                        <View
                                            key={attempt.attemptId}
                                            className="bg-white rounded-2xl p-4 shadow-sm mb-2"
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
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Bottom Spacing */}
                        <View className="h-24" />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ParentExamStatsScreen;
