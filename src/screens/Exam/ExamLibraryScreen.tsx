import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { BookOpen, Clock, Users, Star, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { ExamTemplate } from '../../types/examTypes';
import { useScroll } from '../../context/ScrollContext';
import { useSubject } from '../../hooks/useSubject';
import { useBrowseExams } from '../../hooks/useExam';
import { useExamAttempt } from '../../hooks/useExamAttempt';
import { useAppToast } from '../../utils/toast';
import { useTeachersList } from '../../hooks/useTeachersList';
import CombinedTestBuilder from '../../components/Exam/CombinedTestBuilder';

const ExamLibraryScreen = () => {
  const navigation = useNavigation<any>();
  const { handleScroll } = useScroll();
  const { subjects, fetchAllSubjects } = useSubject();
  const { startComboAttempt, startComboRandomAttempt } = useExamAttempt();
  const toast = useAppToast();

  const [mode, setMode] = useState<'individual' | 'combined'>('individual');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Teachers list
  const { teachers } = useTeachersList({ pageSize: 50 });

  // AI Grading modal state
  const route = useRoute();
  const { gradingAttemptId, showGradingModal: shouldShowModal } = (route.params as any) || {};
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [isWaitingForGrading, setIsWaitingForGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [gradingStatus, setGradingStatus] = useState<string>('Waiting for AI grading...');
  const { subscribeAttemptResult } = useExamAttempt();

  const { templates, loading, applyFilters, fetchTemplates, filters } = useBrowseExams({ pageSize: 100 });

  // Load subjects data
  useEffect(() => {
    fetchAllSubjects();
  }, [fetchAllSubjects]);

  // Filter exams based on selected subject and teacher
  useEffect(() => {
    const filters: { subject?: string; teacherId?: string } = {};
    if (selectedSubjectId !== 'all') {
      filters.subject = selectedSubjectId;
    }
    if (selectedTeacherId !== 'all') {
      filters.teacherId = selectedTeacherId;
    }
    applyFilters(filters);
  }, [selectedSubjectId, selectedTeacherId, applyFilters]);

  // Handle grading modal from navigation params
  useEffect(() => {
    if (shouldShowModal && gradingAttemptId) {
      setShowGradingModal(true);
      setIsWaitingForGrading(true);
      setGradingResult(null);
      setGradingError(null);
      setGradingStatus('Connecting to grading service...');

      // Clear the navigation params
      navigation.setParams({ gradingAttemptId: undefined, showGradingModal: undefined });

      // Subscribe to grading result with 60 second timeout and status updates
      subscribeAttemptResult(
        gradingAttemptId,
        60000, // 60 seconds timeout
        (status) => {
          // Real-time status update from SSE
          console.log('[Grading Status]:', status);
          setGradingStatus(status);
        }
      )
        .then((result) => {
          if (result) {
            setGradingResult(result);
          } else {
            setGradingError('Failed to get results. Please try again later.');
          }
        })
        .catch((err) => {
          console.error('Error getting grading result:', err);
          if (err.message === 'GRADING_TIMEOUT') {
            // Timeout - show friendly message
            setGradingError('AI is grading your exam. Results will be updated in "Exam History" when completed.');
          } else if (err.message === 'GRADING_IN_PROGRESS') {
            // AI is still processing - show waiting message
            setGradingError('AI is processing your exam. Results will be updated in "Exam History" when completed.');
          } else {
            setGradingError('AI grading encountered an issue. Results will be updated in "Exam History".');
          }
        })
        .finally(() => {
          setIsWaitingForGrading(false);
        });
    }
  }, [shouldShowModal, gradingAttemptId]);

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTemplates(filters);
    setRefreshing(false);
  };

  // Handle exam card press
  const handleExamPress = (exam: ExamTemplate) => {
    navigation.navigate('ExamDetail', { examId: exam.id });
  };

  // Render exam card
  const renderExamCard = ({ item }: { item: ExamTemplate }) => (
    <TouchableOpacity
      onPress={() => handleExamPress(item)}
      className="bg-white rounded-2xl p-6 mb-4 border border-gray-100 mx-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900 mb-2">
          {item.title}
        </Text>
        <Text className="text-gray-600 mb-3" numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>

        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Text className="text-sm font-medium text-gray-700">Created by:</Text>
            <Text className="text-sm text-gray-600 ml-2">{item.createdBy}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Text className="text-sm font-medium text-gray-700">Subjects:</Text>
            <Text className="text-sm text-gray-600 ml-2">{item.subject.name}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Text className="text-sm font-medium text-gray-700">Passing Score:</Text>
            <Text className="text-sm text-gray-600 ml-2">{item.passingScore}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Clock size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {item.duration} Min
            </Text>
          </View>
          <View className="flex-row items-center">
            <BookOpen size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {item.rules.reduce((sum, rule) => sum + rule.numberOfQuestions, 0)} Questions
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <Text className="text-sm text-gray-600 ml-2">
              {item.averageRating.toFixed(1)} ({item.totalRatings} ratings)
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <Text className="text-sm font-medium text-gray-700">Cost:</Text>
            <Text className="text-sm text-gray-600 ml-2">{item.tokenCost ? item.tokenCost.toLocaleString('vi-VN') : 'Free'} VNĐ</Text>
          </View>
        </View>

        <View className="flex-row items-center mt-3">
          <Text className="text-sm font-medium text-gray-700">Status:</Text>
          <Text className={`text-sm ml-2 px-2 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <BookOpen size={64} color="#9CA3AF" />
      <Text className="text-xl font-semibold text-gray-600 mt-4 text-center">
        No exams found
      </Text>
      <Text className="text-gray-500 text-center mt-2">
        Exams will appear here once available
      </Text>
    </View>
  );

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3CBCB2" />
        <Text className="text-gray-600 mt-4">Loading exams...</Text>
      </View>
    );
  }

  // Handle combined test start
  const handleStartCombinedTest = async (examIds: string[]) => {
    try {

      if (examIds.length === 0) {
        Alert.alert('Error', 'Please select at least one exam.');
        return;
      }

      // Start combined test attempt
      const attempt = await startComboAttempt({ templateIds: examIds });
      if (attempt) {
        // Navigate to FullTest with the combined attempt
        navigation.navigate('FullTest', { attempt });
      }
    } catch (error) {
      console.error('Error starting combined test:', error);
      Alert.alert('Error', 'Failed to start combined test. Please try again.');
    }
  };

  // Handle auto combined test start
  const handleStartAutoCombinedTest = async (subjectIds: string[]) => {
    try {
      if (subjectIds.length === 0) {
        Alert.alert('Error', 'Please select at least one subject.');
        return;
      }

      // Start random combined test attempt
      const attempt = await startComboRandomAttempt({ subjectIds });
      if (attempt) {
        // Navigate to FullTest with the combined attempt
        navigation.navigate('FullTest', { attempt });
      }
    } catch (error: any) {
      console.error('Error starting auto combined test:', error);

      // Handle specific 400 error for subjects with no exams
      if (error?.response?.status === 400) {
        toast.error('No exams available for the selected subjects');
      } else {
        Alert.alert('Error', 'Failed to start auto combined test. Please try again.');
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Exam Library</Text>
            <Text className="text-gray-600 text-sm mt-1">
              {mode === 'individual' ? `${templates.length} exams available` : 'Create combined test'}
            </Text>
          </View>
        </View>

        {/* Mode Selection Tabs */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-2">
          <TouchableOpacity
            onPress={() => setMode('individual')}
            className={`flex-1 py-2 rounded-lg ${mode === 'individual' ? 'bg-teal-400' : ''}`}
          >
            <Text className={`font-semibold text-center text-sm ${mode === 'individual' ? 'text-white' : 'text-gray-600'}`}>
              Individual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('combined')}
            className={`flex-1 py-2 rounded-lg ${mode === 'combined' ? 'bg-teal-400' : ''}`}
          >
            <Text className={`font-semibold text-center text-sm ${mode === 'combined' ? 'text-white' : 'text-gray-600'}`}>
              Combined
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subject Filter - Only show for individual mode */}
        {mode === 'individual' && (
          <View>
            {/* Subject row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              <TouchableOpacity
                onPress={() => setSelectedSubjectId('all')}
                className={`mr-3 px-4 py-2 rounded-full border ${selectedSubjectId === 'all'
                  ? 'bg-teal-400 border-teal-400'
                  : 'bg-white border-gray-300'
                  }`}
              >
                <Text className={`text-sm font-medium ${selectedSubjectId === 'all' ? 'text-white' : 'text-gray-700'
                  }`}>
                  All Subjects
                </Text>
              </TouchableOpacity>

              {subjects && subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  onPress={() => setSelectedSubjectId(subject.id)}
                  className={`mr-3 px-4 py-2 rounded-full border ${selectedSubjectId === subject.id
                    ? 'bg-teal-400 border-teal-400'
                    : 'bg-white border-gray-300'
                    }`}
                >
                  <Text className={`text-sm font-medium ${selectedSubjectId === subject.id ? 'text-white' : 'text-gray-700'
                    }`}>
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Teacher row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              <TouchableOpacity
                onPress={() => setSelectedTeacherId('all')}
                className={`mr-3 px-3 py-2 rounded-full border ${selectedTeacherId === 'all'
                  ? 'bg-teal-400 border-teal-400'
                  : 'bg-white border-gray-300'
                  }`}
              >
                <Text className={`text-xs font-medium ${selectedTeacherId === 'all' ? 'text-white' : 'text-gray-700'
                  }`}>
                  All Teachers
                </Text>
              </TouchableOpacity>

              {teachers && teachers.map((teacher) => (
                <TouchableOpacity
                  key={teacher.id}
                  onPress={() => setSelectedTeacherId(teacher.id)}
                  className={`mr-3 px-3 py-2 rounded-full border ${selectedTeacherId === teacher.id
                    ? 'bg-teal-400 border-teal-400'
                    : 'bg-white border-gray-300'
                    }`}
                >
                  <Text className={`text-xs font-medium ${selectedTeacherId === teacher.id ? 'text-white' : 'text-gray-700'
                    }`}>
                    {teacher.firstName} {teacher.lastName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Content based on mode */}
      {mode === 'individual' ? (
        /* Individual Exams List */
        <FlatList
          data={templates}
          renderItem={renderExamCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 16,
            paddingBottom: 100, // Space for tab bar
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3CBCB2"]}
              tintColor="#3CBCB2"
            />
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={loading ? (
            <View className="py-8">
              <ActivityIndicator size="small" color="#3CBCB2" />
            </View>
          ) : null}
        />
      ) : (
        /* Combined Test Builder */
        <CombinedTestBuilder
          onStartTest={handleStartCombinedTest}
          onStartAutoTest={handleStartAutoCombinedTest}
        />
      )}

      {/* AI Grading Modal */}
      <Modal
        visible={showGradingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGradingModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 350,
          }}>
            {/* Header */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-teal-100 rounded-full items-center justify-center mb-3">
                <CheckCircle size={36} color="#3CBCB2" />
              </View>
              <Text className="text-xl font-bold text-gray-900 text-center">
                Submitted Successfully!
              </Text>
            </View>

            {/* Loading state */}
            {isWaitingForGrading && (
              <View className="items-center py-4">
                <ActivityIndicator size="large" color="#3CBCB2" />
                <Text className="text-gray-600 text-center mt-4">
                  {gradingStatus}
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-2">
                  Please wait a moment
                </Text>
              </View>
            )}

            {/* Error/Timeout/In-Progress state */}
            {gradingError && !isWaitingForGrading && (
              <View>
                {/* Icon based on error type */}
                <View className="items-center mb-3">
                  {gradingError.includes('is grading') || gradingError.includes('is processing') ? (
                    <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center">
                      <Clock size={24} color="#F59E0B" />
                    </View>
                  ) : (
                    <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                      <AlertCircle size={24} color="#EF4444" />
                    </View>
                  )}
                </View>

                <Text className={`text-center mb-4 ${gradingError.includes('is grading') || gradingError.includes('is processing') ? 'text-amber-700' : 'text-red-500'}`}>
                  {gradingError}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setShowGradingModal(false);
                    // Navigate to exam history if it's a timeout or in-progress
                    if (gradingError.includes('Exam History')) {
                      navigation.navigate('Profile', { screen: 'ExamResults' });
                    }
                  }}
                  className="bg-teal-500 py-3 rounded-xl"
                >
                  <Text className="text-white text-center font-semibold">
                    {gradingError.includes('Exam History') ? 'View Exam History' : 'Close'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Result display */}
            {gradingResult && !isWaitingForGrading && (
              <View>
                <View className="bg-green-50 rounded-xl p-4 mb-4">
                  <Text className="text-green-800 text-center text-lg font-bold mb-2">
                    Score: {gradingResult.totalScore ?? gradingResult.score ?? 'N/A'} / {gradingResult.maxScore ?? '100'}
                  </Text>
                  <Text className="text-green-600 text-center">
                    {gradingResult.passed ? '✅ Passed' : gradingResult.passed === false ? '❌ Failed' : 'Grading completed'}
                  </Text>
                </View>
                <View className="flex flex-row justify-center gap-2">
                <TouchableOpacity
                  onPress={() => setShowGradingModal(false)}
                  className="bg-teal-500 p-3 rounded-xl"
                >
                  <Text className="text-white text-center font-semibold">
                    Done
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {navigation.navigate('Profile', { screen: 'ExamResults' }); setShowGradingModal(false)}}
                  className="bg-teal-500 p-3 rounded-xl"
                >
                  <Text className="text-white text-center font-semibold">
                    View Exam History
                  </Text>
                </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExamLibraryScreen;
