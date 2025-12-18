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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { useParent } from '../../hooks/useParent';
import { TrendingUp, Users, BookOpen, Award, ChevronRight, Star } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ParentDashboardScreen = () => {
  const { user } = useAuth();
  const { children, loading, fetchChildren } = useParent();
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
    }, [fetchChildren])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChildren();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalChildren = children.length;
  const totalExamsTaken = children.reduce((sum, child) => sum + child.totalExamsTaken, 0);
  const averageScore = totalChildren > 0
    ? Math.round(children.reduce((sum, child) => sum + child.averageScore, 0) / totalChildren)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Average';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pb-20">
      {/* Header */}
      <View style={{ backgroundColor: '#3CBCB2' }} className="px-6 pt-4 pb-8 rounded-b-3xl shadow-lg">
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-white/70 text-xs font-medium uppercase tracking-wider">
              {getGreeting()}
            </Text>
            <Text className="text-white text-3xl font-bold mt-2 mb-1">
              {user?.firstName || 'Parent'}
            </Text>
            <Text className="text-white/80 text-sm leading-5">
              Follow your child's progress 📚
            </Text>
          </View>

          {/* User Avatar with Gradient Border */}
          <View className="items-center">
            <View className="w-16 h-16 bg-white rounded-full items-center justify-center p-0.5">
              <View className="w-full h-full bg-teal-500 rounded-full items-center justify-center">
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
            <Text className="text-white text-xl font-bold">{totalChildren}</Text>
            <Text className="text-white/70 text-xs mt-0.5">Children</Text>
          </View>
          <View className="w-px h-8 bg-white/20" />
          <View className="items-center flex-1">
            <Text className="text-white text-xl font-bold">{totalExamsTaken}</Text>
            <Text className="text-white/70 text-xs mt-0.5">Exams</Text>
          </View>
          <View className="w-px h-8 bg-white/20" />
          <View className="items-center flex-1">
            <Text className="text-white text-xl font-bold">{averageScore}</Text>
            <Text className="text-white/70 text-xs mt-0.5">Average Score</Text>
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
        {/* Stats Cards */}
        <View className="px-6 py-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">📊 Detailed overview</Text>
          <View className="flex-row flex-wrap justify-between">
            {/* Children Count */}
            <View className="w-[48%] mb-4">
              <View style={{ backgroundColor: '#3B82F6' }} className="rounded-2xl p-4 shadow-md">
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                  <Users size={20} color="white" />
                </View>
                <Text className="text-white text-3xl font-bold">{totalChildren}</Text>
                <Text className="text-white/90 text-sm mt-1">Children</Text>
              </View>
            </View>

            {/* Average Score */}
            <View className="w-[48%] mb-4">
              <View style={{ backgroundColor: '#10B981' }} className="rounded-2xl p-4 shadow-md">
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                  <Award size={20} color="white" />
                </View>
                <Text className="text-white text-3xl font-bold">{averageScore}</Text>
                <Text className="text-white/90 text-sm mt-1">Average Score</Text>
              </View>
            </View>

            {/* Total Exams */}
            <View className="w-[48%] mb-4">
              <View style={{ backgroundColor: '#8B5CF6' }} className="rounded-2xl p-4 shadow-md">
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                  <BookOpen size={20} color="white" />
                </View>
                <Text className="text-white text-3xl font-bold">{totalExamsTaken}</Text>
                <Text className="text-white/90 text-sm mt-1">Exams</Text>
              </View>
            </View>

            {/* Performance Trend */}
            <View className="w-[48%] mb-4">
              <View style={{ backgroundColor: '#F59E0B' }} className="rounded-2xl p-4 shadow-md">
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-3">
                  <TrendingUp size={20} color="white" />
                </View>
                <Text className="text-white text-3xl font-bold">{getPerformanceLevel(averageScore)}</Text>
                <Text className="text-white/90 text-sm mt-1">Performance</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Children List */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-800">
              👨‍🎓 Your children ({totalChildren})
            </Text>
            {totalChildren > 3 && (
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-teal-600 font-medium mr-1">See all</Text>
                <ChevronRight size={16} color="#3CBCB2" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <Text className="text-gray-500">Loading...</Text>
            </View>
          ) : children.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-4">
                <Users size={40} color="#3CBCB2" />
              </View>
              <Text className="text-gray-800 font-semibold text-lg mb-2">
                No children
              </Text>
              <Text className="text-gray-500 text-center">
                Go to "Manage" tab to{'\n'}link with student account
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {children.map((child, index) => (
                <TouchableOpacity
                  key={child.studentId}
                  className="bg-white rounded-2xl p-4 shadow-sm mb-2"
                  style={{
                    transform: [{ scale: 1 }],
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className="relative">
                      <Image
                        source={{ uri: child.avatarUrl || 'https://ui-avatars.com/api/?name=User&background=random' }}
                        className="w-14 h-14 rounded-full"
                      />
                      <View
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
                        style={{ backgroundColor: getScoreColor(child.averageScore) }}
                      >
                        <Star size={12} color="white" fill="white" />
                      </View>
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="font-bold text-gray-800 text-base">
                        {child.studentName}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-0.5">
                        {child.email}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                          <Text className="text-xs text-gray-600">
                            {child.totalExamsTaken} exams
                          </Text>
                        </View>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${getScoreColor(child.averageScore)}20` }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: getScoreColor(child.averageScore) }}
                          >
                            {getPerformanceLevel(child.averageScore)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="items-center">
                      <Text
                        className="font-bold text-2xl"
                        style={{ color: getScoreColor(child.averageScore) }}
                      >
                        {child.averageScore}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">AVG Score</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParentDashboardScreen;
