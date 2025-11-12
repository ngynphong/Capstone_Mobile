import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useScroll } from '../../context/ScrollContext';
import { useNavigation } from '@react-navigation/native';
import { useExamAttemptHistory } from '../../hooks/useExamAttempt';
import { ChevronLeft, Clock, CheckCircle, Target } from 'lucide-react-native';

interface ExamResultsScreenProps {
  navigation: any;
}

const ExamResultsScreen: React.FC<ExamResultsScreenProps> = ({ navigation }) => {
  const { handleScroll } = useScroll();
  const typedNavigation = useNavigation<any>();
  const { history, loading, fetchHistory, pageInfo } = useExamAttemptHistory();
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

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
    await fetchHistory(0, 10);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (pageInfo && pageInfo.pageNo < pageInfo.totalPage - 1 && !loadingMore) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      await fetchHistory(pageInfo.pageNo + 1, 10);
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
              Exam {attempt.examId}
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

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Clock size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {formatTimeSpent(timeSpent)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <CheckCircle size={16} color="#10B981" />
            <Text className="text-sm text-green-600 ml-1">
              {attempt.endTime ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
          <ActivityIndicator size="large" color="#3CBCB2" />
          <Text className="text-gray-900 font-semibold mt-4 text-lg">
            Đang tải kết quả thi...
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Vui lòng đợi trong giây lát
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Exam Results</Text>
        </View>
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

            {/* Exam Results List */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Recent Results
              </Text>
              {allHistory.map((attempt: any, index: number) => renderExamResult(attempt, index))}

              {/* Load More Button */}
              {hasMorePages && (
                <View className="mt-4">
                  <TouchableOpacity
                    onPress={loadMore}
                    className="bg-teal-400 py-3 rounded-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white font-medium text-center text-lg ml-2">
                          Loading...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-white font-medium text-center text-lg">
                        Load More Results
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Pagination Info */}
              {pageInfo && (
                <View className="mt-3 items-center">
                  <Text className="text-sm text-gray-500">
                    Page {pageInfo.pageNo + 1} of {pageInfo.totalPage}
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
