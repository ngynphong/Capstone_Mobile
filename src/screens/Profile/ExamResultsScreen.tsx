import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useScroll } from '../../context/ScrollContext';
import { useNavigation } from '@react-navigation/native';
import { useExamAttemptHistory } from '../../hooks/useExamAttempt';
import { ChevronLeft, Clock, CheckCircle, Target, ArrowUpDown, AlertCircle } from 'lucide-react-native';

interface ExamResultsScreenProps {
  navigation: any;
}

const ExamResultsScreen: React.FC<ExamResultsScreenProps> = ({ navigation }) => {
  const { handleScroll } = useScroll();
  const typedNavigation = useNavigation<any>();
  const { history, loading, error, fetchHistory, pageInfo } = useExamAttemptHistory();
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<'startTime:desc' | 'startTime:asc' | 'endTime:desc' | 'endTime:asc'>('startTime:desc');

  // Sort options
  const sortOptions = [
    { value: 'startTime:desc', label: 'Newest (start)' },
    { value: 'startTime:asc', label: 'Oldest (start)' },
    { value: 'endTime:desc', label: 'Newest (end)' },
    { value: 'endTime:asc', label: 'Oldest (end)' },
  ];

  // Sorted history
  const sortedHistory = useMemo(() => {
    if (!allHistory.length) return [];
    return [...allHistory].sort((a, b) => {
      const [field, order] = sortBy.split(':');
      const dateA = new Date(a[field] || 0).getTime();
      const dateB = new Date(b[field] || 0).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [allHistory, sortBy]);

  // Accumulate history data
  useEffect(() => {
    if (history.length > 0) {
      if (currentPage === 0) {
        setAllHistory(history);
      } else {
        setAllHistory(prev => {
          // Avoid duplicates by checking attemptId
          const existingIds = new Set(prev.map(item => item.attemptId));
          const newItems = history.filter(item => !existingIds.has(item.attemptId));
          return [...prev, ...newItems];
        });
      }
    }
  }, [history, currentPage]);

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(0);
    await fetchHistory(0, 20);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (pageInfo && pageInfo.pageNo < pageInfo.totalPage - 1 && !loadingMore) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      await fetchHistory(pageInfo.pageNo + 1, 20);
      setLoadingMore(false);
    }
  };

  const hasMorePages = pageInfo && pageInfo.pageNo < pageInfo.totalPage - 1;

  const formatTimeSpent = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const renderExamResult = (attempt: any, index: number) => {
    const startTime = new Date(attempt.startTime);
    const endTime = attempt.endTime ? new Date(attempt.endTime) : null;
    const timeSpent = endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;

    return (
      <TouchableOpacity
        key={index}
        className={`bg-white rounded-xl p-4 mb-3 border ${getScoreBgColor(attempt.score)}`}
        onPress={() => {
          typedNavigation.navigate('ExamResultDetail', { attemptId: attempt.attemptId });
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              Exam {attempt.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              {startTime.toLocaleDateString('vi-VN')}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full border ${getScoreBgColor(attempt.score)}`}>
            <Text className={`text-sm font-semibold ${getScoreColor(attempt.score)}`}>
              {attempt.score}%
            </Text>
          </View>
        </View>

        {/* AP Result - hiển thị nếu có */}
        {attempt.apResult && attempt.apResult.scaledScore > 0 && (
          <View className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-sm font-medium text-indigo-700">AP Score:</Text>
                <View className="bg-indigo-600 px-2 py-0.5 rounded ml-2">
                  <Text className="text-white font-bold text-sm">{attempt.apResult.scaledScore}</Text>
                </View>
              </View>
            </View>
            {attempt.apResult.qualificationMessage && (
              <Text className="text-xs text-indigo-600 mt-1">
                {attempt.apResult.qualificationMessage}
              </Text>
            )}
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Clock size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {formatTimeSpent(timeSpent)}
            </Text>
          </View>

          <View className="flex-row items-center">
            {attempt.isLate ? (
              <>
                <AlertCircle size={16} color="#EF4444" />
                <Text className="text-sm text-red-600 ml-1">Late</Text>
              </>
            ) : (
              <>
                <CheckCircle size={16} color={attempt.status === 'COMPLETED' ? '#10B981' : '#6B7280'} />
                <Text className={`text-sm ml-2 ${attempt.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-600'}`}>
                  {attempt.status}
                </Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && allHistory.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3CBCB2" />
        <Text className="text-gray-600 mt-4">Loading exam history...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Exam Results</Text>
          </View>

          {/* Quick Pagination Info in Header */}
          {pageInfo && (
            <View className="flex-row items-center">
              <View className="bg-teal-50 px-3 py-1 rounded-full mr-2">
                <Text className="text-xs text-teal-700 font-medium">
                  {allHistory.length}/{pageInfo.totalElement}
                </Text>
              </View>
              {hasMorePages && (
                <TouchableOpacity
                  onPress={loadMore}
                  disabled={loadingMore}
                  className="bg-teal-400 px-3 py-1 rounded-full"
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-xs text-white font-medium">+More</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Sort Options */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSortBy(option.value as any)}
                className={`mr-2 px-3 py-2 rounded-full border ${sortBy === option.value
                  ? 'bg-teal-400 border-teal-400'
                  : 'bg-white border-gray-300'
                  }`}
              >
                <View className="flex-row items-center">
                  {sortBy === option.value && <ArrowUpDown size={12} color="#fff" />}
                  <Text className={`text-xs font-medium ml-1 ${sortBy === option.value ? 'text-white' : 'text-gray-700'
                    }`}>
                    {option.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {allHistory.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Target size={64} color="#D1D5DB" />
            <Text className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              No Exam Results Yet
            </Text>
            <Text className="text-gray-600 text-center px-8">
              Complete your first exam to see your results here. Your progress will be tracked and displayed.
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Stats */}
            <View className="bg-white rounded-xl p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Your Progress
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-teal-600">
                    {allHistory.length}
                  </Text>
                  <Text className="text-sm text-gray-600">Total Exams</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-blue-600">
                    {Math.round(allHistory.reduce((acc: number, attempt: any) => acc + attempt.score, 0) / allHistory.length)}%
                  </Text>
                  <Text className="text-sm text-gray-600">Average Score</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-green-600">
                    {Math.max(...allHistory.map((attempt: any) => attempt.score))}%
                  </Text>
                  <Text className="text-sm text-gray-600">Best Score</Text>
                </View>
              </View>
            </View>

            {/* Pagination Info Box - Always Visible */}
            {pageInfo && (
              <View className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-sm text-teal-700 font-medium">
                    Showing {allHistory.length} of {pageInfo.totalElement} results
                  </Text>
                  <Text className="text-xs text-teal-600">
                    Page {pageInfo.pageNo + 1} of {pageInfo.totalPage}
                  </Text>
                </View>
                {hasMorePages ? (
                  <TouchableOpacity
                    onPress={loadMore}
                    disabled={loadingMore}
                    className="bg-teal-400 px-4 py-2 rounded-lg flex-row items-center"
                  >
                    {loadingMore ? (
                      <>
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white font-medium text-sm ml-2">Loading...</Text>
                      </>
                    ) : (
                      <Text className="text-white font-medium text-sm">
                        Load More ({pageInfo.totalElement - allHistory.length})
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View className="bg-green-100 px-3 py-2 rounded-lg">
                    <Text className="text-sm text-green-700 font-medium">✓ All loaded</Text>
                  </View>
                )}
              </View>
            )}

            {/* Exam Results List */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Recent Results
              </Text>
              {sortedHistory.map((attempt: any, index: number) => renderExamResult(attempt, index))}

              {/* Bottom Loading Indicator */}
              {loadingMore && (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#3CBCB2" />
                  <Text className="text-sm text-gray-500 mt-2">Loading more results...</Text>
                </View>
              )}

              {/* Load More Button at Bottom */}
              {hasMorePages && !loadingMore && (
                <View className="mt-4">
                  <TouchableOpacity
                    onPress={loadMore}
                    className="bg-teal-400 py-3 rounded-xl"
                    disabled={loadingMore}
                  >
                    <Text className="text-white font-medium text-center text-lg">
                      Load More ({pageInfo ? pageInfo.totalElement - allHistory.length : 0} remaining)
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* All Loaded Message */}
              {!hasMorePages && allHistory.length > 0 && (
                <View className="mt-4 py-3 items-center bg-gray-100 rounded-xl">
                  <Text className="text-sm text-gray-600 font-medium">
                    ✓ You've seen all {allHistory.length} results
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ExamResultsScreen;
