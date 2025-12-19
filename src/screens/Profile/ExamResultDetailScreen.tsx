import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Calendar, Clock, CheckCircle, Target, Award, TrendingUp, Star, RefreshCw, X } from 'lucide-react-native';

import { useScroll } from '../../context/ScrollContext';
import { useExamAttempt } from '../../hooks/useExamAttempt';
import ExamQuestionResultItem from '../../components/Exam/ExamQuestionResultItem';
import QuestionContextBlock from '../../components/Exam/QuestionContextBlock';
import QuestionImage from '../../components/Exam/QuestionImage';
import AudioPlayer from '../../components/common/AudioPlayer';
import { QuestionContext, AttemptResultQuestion } from '../../types/examTypes';

const ExamResultDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { attemptId } = route.params as { attemptId: string };

  const { handleScroll } = useScroll();
  const { fetchAttemptResult, rateAttempt, requestReview, attemptResultDetail, loading } = useExamAttempt();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewReason, setReviewReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (attemptId) {
      fetchAttemptResult(attemptId);
    }
  }, [attemptId, fetchAttemptResult]);

  const attempt = attemptResultDetail;

  const handleRateAttempt = async () => {
    if (!attempt || rating === 0) {
      Alert.alert('Error', 'Please select a rating.');
      return;
    }

    try {
      await rateAttempt(attemptId, { rating, comment });
      Alert.alert('Success', 'Thank you for your feedback!');
      setShowRating(false);
    } catch (error: any) {
      // Handle specific API error for rating restrictions
      if (error?.response?.data?.code === 1034) {
        Alert.alert(
          'Rating Not Available',
          'You cannot rate this exam because it has already been submitted or timed out. Ratings are only available during the exam session.',
          [{ text: 'OK', onPress: () => setShowRating(false) }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit rating. Please try again.');
      }
    }
  };

  const handleRequestReview = async () => {
    if (!reviewReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the re-grade request.');
      return;
    }

    setSubmittingReview(true);
    try {
      const success = await requestReview(attemptId, { reason: reviewReason });
      if (success) {
        Alert.alert('Success', 'Your re-grade request has been submitted to the teacher.');
        setShowReviewModal(false);
        setReviewReason('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit re-grade request. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatTimeSpent = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore) return 'text-green-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number, passingScore: number) => {
    if (score >= passingScore) return 'bg-green-50 border-green-200';
    return 'bg-red-50 border-red-200';
  };

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return 'Excellent work! Outstanding performance.';
    if (score >= 80) return 'Great job! You have a solid understanding.';
    if (score >= 70) return 'Good effort! Keep practicing to improve.';
    return 'Keep studying and try again. You\'ll get better!';
  };

  // Group questions by context, imageUrl, or audioUrl
  interface QuestionGroup {
    contextId?: string;
    context?: QuestionContext | null;
    sharedImageUrl?: string | null;
    sharedAudioUrl?: string | null;
    questions: AttemptResultQuestion[];
  }

  const groupedQuestions = useMemo(() => {
    if (!attempt?.questions) return [];

    const groups: QuestionGroup[] = [];
    const processedIds = new Set<string>();

    attempt.questions.forEach((q) => {
      if (processedIds.has(q.examQuestionId)) return;

      const context = q.question.questionContext;
      const imageUrl = q.question.imageUrl;
      const audioUrl = q.question.audioUrl;

      // Find all questions with the same context (if exists)
      if (context?.id) {
        const sameContextQuestions = attempt.questions.filter(
          (otherQ) => otherQ.question.questionContext?.id === context.id
        );

        sameContextQuestions.forEach((sq) => processedIds.add(sq.examQuestionId));

        groups.push({
          contextId: context.id,
          context,
          sharedImageUrl: null,
          sharedAudioUrl: null,
          questions: sameContextQuestions,
        });
      }
      // Group by same imageUrl if no context
      else if (imageUrl) {
        const sameImageQuestions = attempt.questions.filter(
          (otherQ) =>
            !otherQ.question.questionContext?.id &&
            otherQ.question.imageUrl === imageUrl
        );

        sameImageQuestions.forEach((sq) => processedIds.add(sq.examQuestionId));

        groups.push({
          contextId: undefined,
          context: null,
          sharedImageUrl: imageUrl,
          sharedAudioUrl: null,
          questions: sameImageQuestions,
        });
      }
      // Group by same audioUrl if no context and no image
      else if (audioUrl) {
        const sameAudioQuestions = attempt.questions.filter(
          (otherQ) =>
            !otherQ.question.questionContext?.id &&
            !otherQ.question.imageUrl &&
            otherQ.question.audioUrl === audioUrl
        );

        sameAudioQuestions.forEach((sq) => processedIds.add(sq.examQuestionId));

        groups.push({
          contextId: undefined,
          context: null,
          sharedImageUrl: null,
          sharedAudioUrl: audioUrl,
          questions: sameAudioQuestions,
        });
      }
      // Individual question without any grouping
      else {
        processedIds.add(q.examQuestionId);
        groups.push({
          contextId: undefined,
          context: null,
          sharedImageUrl: null,
          sharedAudioUrl: null,
          questions: [q],
        });
      }
    });

    return groups;
  }, [attempt?.questions]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3CBCB2" />
        <Text className="text-gray-600 mt-4">Loading exam history...</Text>
      </View>
    );
  }

  if (!attempt) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600 text-lg">Exam result not found</Text>
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
          <Text className="text-xl font-bold text-gray-900">Exam Result Details</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Exam Info */}
        <View className="bg-white rounded-xl p-6 mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-2">{attempt.title}</Text>
          <View className="flex-row items-center mb-3">
            <Text className="text-gray-600">Status: </Text>
            <View className={`px-2 py-1 rounded-full ${attempt.status === 'COMPLETED' ? 'bg-green-100' : attempt.status === 'PENDING_GRADING' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-medium ${attempt.status === 'COMPLETED' ? 'text-green-800' : attempt.status === 'PENDING_GRADING' ? 'text-yellow-800' : 'text-gray-800'}`}>
                {attempt.status === 'PENDING_GRADING' ? 'Pending Grading' : attempt.status}
              </Text>
            </View>
          </View>

          {attempt.subjects && attempt.subjects.length > 0 && (
            <View className="mb-3">
              <Text className="text-gray-600 mb-2">Subjects:</Text>
              <View className="flex-row flex-wrap">
                {attempt.subjects.map((subject, index) => (
                  <View key={index} className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-1">
                    <Text className="text-xs text-blue-800 font-medium">{subject.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-sm text-gray-600">Passing Score</Text>
              <Text className="text-lg font-semibold text-gray-900">{attempt.passingScore}%</Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-gray-600">Your Score</Text>
              <Text className={`text-2xl font-bold ${getScoreColor(attempt.score, attempt.passingScore)}`}>
                {attempt.score}%
              </Text>
            </View>
          </View>
        </View>

        {/* Score Overview */}
        <View className={`bg-white rounded-xl p-6 mb-4 border ${getScoreBgColor(attempt.score, attempt.passingScore)}`}>
          <View className="items-center mb-4">
            <View className={`w-20 h-20 rounded-full items-center justify-center mb-3 ${getScoreBgColor(attempt.score, attempt.passingScore)}`}>
              <Award size={32} color={attempt.score >= attempt.passingScore ? '#10B981' : '#EF4444'} />
            </View>
            <Text className={`text-3xl font-bold ${getScoreColor(attempt.score, attempt.passingScore)}`}>
              {attempt.score >= attempt.passingScore ? 'PASSED' : 'FAILED'}
            </Text>
            <Text className="text-gray-600 text-center mt-1">
              {attempt.questions.filter(q => q.studentAnswer?.selectedAnswerId === q.studentAnswer?.correctAnswer?.id).length} out of {attempt.questions.length} correct
            </Text>
          </View>

          <Text className="text-center text-gray-700 mb-4">
            {getPerformanceMessage(attempt.score)}
          </Text>

          {/* Quick Stats */}
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Clock size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 mt-1">
                {formatTimeSpent(attempt.startTime, attempt.endTime)}
              </Text>
            </View>
            <View className="items-center flex-1">
              <Target size={20} color="#6B7280" />
              <Text className="text-sm text-gray-600 mt-1">
                {Math.round((attempt.questions.filter(q => q.studentAnswer?.selectedAnswerId === q.studentAnswer?.correctAnswer?.id).length / attempt.questions.length) * 100)}% Accuracy
              </Text>
            </View>
            <View className="items-center flex-1">
              <CheckCircle size={20} color="#10B981" />
              <Text className="text-sm text-gray-600 mt-1">
                {attempt.questions.length} Questions
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Question Review */}
        <View className="bg-white rounded-xl p-6 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Question Details</Text>

          {groupedQuestions.map((group, groupIndex) => (
            <View key={group.contextId || `group-${groupIndex}`} className="mb-6">
              {/* Shared Context Block */}
              {group.context && (
                <QuestionContextBlock
                  context={group.context}
                  questionCount={group.questions.length}
                />
              )}

              {/* Shared Image (for questions without context but with same image) */}
              {!group.context && group.sharedImageUrl && (
                <View className="mb-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <Text className="text-sm font-medium text-blue-800 mb-2">
                    📷 Shared Image for {group.questions.length} question{group.questions.length > 1 ? 's' : ''}
                  </Text>
                  <QuestionImage imageUrl={group.sharedImageUrl} alt="Shared question image" />
                </View>
              )}

              {/* Shared Audio (for questions without context/image but with same audio) */}
              {!group.context && !group.sharedImageUrl && group.sharedAudioUrl && (
                <View className="mb-4 bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <Text className="text-sm font-medium text-purple-800 mb-2">
                    🎧 Shared Audio for {group.questions.length} question{group.questions.length > 1 ? 's' : ''}
                  </Text>
                  <AudioPlayer audioUrl={group.sharedAudioUrl} title="Listen to the audio" />
                </View>
              )}

              {/* Render all questions in this group */}
              {group.questions.map((questionItem, qIndex) => (
                <ExamQuestionResultItem
                  key={questionItem.examQuestionId}
                  questionItem={questionItem}
                  index={attempt.questions.findIndex(q => q.examQuestionId === questionItem.examQuestionId)}
                  attemptId={attemptId}
                  hideContextMedia={!!group.context || !!group.sharedImageUrl || !!group.sharedAudioUrl}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Performance Analysis */}
        <View className="bg-white rounded-xl p-6 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">Total Questions</Text>
              <Text className="font-semibold text-gray-900">{attempt.questions.length}</Text>
            </View>

            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">Correct Answers</Text>
              <Text className="font-semibold text-green-600">{attempt.questions.filter(q => q.studentAnswer?.selectedAnswerId === q.studentAnswer?.correctAnswer?.id).length}</Text>
            </View>

            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">Incorrect Answers</Text>
              <Text className="font-semibold text-red-600">{attempt.questions.filter(q => q.studentAnswer?.selectedAnswerId !== q.studentAnswer?.correctAnswer?.id).length}</Text>
            </View>

            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">Time Spent</Text>
              <Text className="font-semibold text-gray-900">{formatTimeSpent(attempt.startTime, attempt.endTime)}</Text>
            </View>

            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">Start Time</Text>
              <Text className="font-semibold text-gray-900">{new Date(attempt.startTime).toLocaleString('vi-VN')}</Text>
            </View>

            <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-700">End Time</Text>
              <Text className="font-semibold text-gray-900">
                {attempt.endTime ? new Date(attempt.endTime).toLocaleString('vi-VN') : 'Not completed'}
              </Text>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View className="bg-white rounded-xl p-6 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Rate This Exam</Text>

          {!showRating ? (
            <TouchableOpacity
              onPress={() => setShowRating(true)}
              className="bg-teal-50 border-2 border-dashed border-teal-200 rounded-xl p-4 items-center"
            >
              <Star size={32} color="#3CBCB2" />
              <Text className="text-teal-700 font-medium mt-2">
                {attempt.rating ? `Rated ${attempt.rating} stars` : 'Tap to rate this exam'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View>
              <Text className="text-gray-700 mb-3">How would you rate this exam?</Text>

              {/* Star Rating */}
              <View className="flex-row justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    className="mx-1"
                  >
                    <Star
                      size={32}
                      color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                      fill={star <= rating ? '#F59E0B' : 'none'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comment Input */}
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="Leave a comment (optional)..."
                value={comment}
                onChangeText={setComment}
                className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 mb-4"
                textAlignVertical="top"
              />

              {/* Rating Buttons */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setShowRating(false)}
                  className="flex-1 bg-gray-200 py-3 rounded-lg"
                >
                  <Text className="text-gray-700 font-medium text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRateAttempt}
                  className="flex-1 bg-teal-400 py-3 rounded-lg"
                >
                  <Text className="text-white font-medium text-center">Submit Rating</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Request Re-grade Section - Only show when status is COMPLETED */}
        {attempt.status === 'COMPLETED' && (
          <View className="bg-white rounded-xl p-6 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Request Re-grade</Text>
            <TouchableOpacity
              onPress={() => setShowReviewModal(true)}
              className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl p-4 flex-row items-center justify-center"
            >
              <RefreshCw size={24} color="#F97316" />
              <Text className="text-orange-700 font-medium ml-2">
                Request Teacher to Re-grade
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-500 text-xs mt-2 text-center">
              If you believe your answers were graded incorrectly, you can request a review from your teacher.
            </Text>
          </View>
        )}

        {/* Tips for Improvement */}
        {attempt.score < 70 && (
          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <Text className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Improvement:</Text>
            <Text className="text-sm text-blue-700">
              • Review the topics you missed and practice similar questions{'\n'}
              • Take more time to understand each question before answering{'\n'}
              • Consider reviewing the subject material before retaking the exam
            </Text>
          </View>
        )}

        {/* Action Button */}
        <View className="mb-8">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-teal-400 py-4 rounded-xl"
          >
            <Text className="text-white font-bold text-center text-lg">
              Back to Results
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Request Re-grade Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Request Re-grade</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-4">
              Please provide a reason for your re-grade request. The teacher will review your submission and may adjust the score if necessary.
            </Text>

            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Enter your reason for requesting a re-grade..."
              value={reviewReason}
              onChangeText={setReviewReason}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 mb-4"
              textAlignVertical="top"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  setShowReviewModal(false);
                  setReviewReason('');
                }}
                className="flex-1 bg-gray-200 py-3 rounded-lg"
                disabled={submittingReview}
              >
                <Text className="text-gray-700 font-medium text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRequestReview}
                className={`flex-1 py-3 rounded-lg ${submittingReview ? 'bg-orange-300' : 'bg-orange-500'}`}
                disabled={submittingReview}
              >
                <Text className="text-white font-medium text-center">
                  {submittingReview ? 'Submitting...' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ExamResultDetailScreen;
