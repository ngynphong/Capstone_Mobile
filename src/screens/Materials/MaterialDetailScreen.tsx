import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  ImageBackground,
  Platform,
  TextInput,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResizeMode, Video, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { MaterialStackParamList } from '../../types/types';
import type { Lesson } from '../../types/lessonTypes';
import { useMaterialDetail } from '../../hooks/useMaterialDetail';
import useMaterialRating from '../../hooks/useMaterialRating';
import { useAuth } from '../../context/AuthContext';
import NoteModal from '../../components/Material/NoteModal';
import RatingModal from '../../components/Material/RatingModal';

type DetailRouteProp = RouteProp<MaterialStackParamList, 'MaterialDetail'>;
type DetailNavProp = NativeStackNavigationProp<
  MaterialStackParamList,
  'MaterialDetail'
>;

interface Props {
  route: DetailRouteProp;
}

const MaterialDetailScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<DetailNavProp>();
  const { material } = route.params;
  const learningMaterialId = material.learningMaterialId || material.id;
  const { user } = useAuth();

  const {
    lessons: derivedLessons,
    isLoading,
    displayLesson,
    videoSource,
    videoLoading,
    videoError,
    setActiveVideoLessonId,
    getLessonAssetDownloadConfig,
  } = useMaterialDetail({ material, learningMaterialId });

  const [downloadingLessonId, setDownloadingLessonId] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [isCheckingRating, setIsCheckingRating] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteLessonTitle, setNoteLessonTitle] = useState('');
  const videoRef = useRef<Video>(null);
  const { 
    createRating, 
    fetchRatingByMaterialAndUser,
    isLoading: isSubmittingRating 
  } = useMaterialRating();

  // Kiểm tra xem user đã đánh giá chưa khi component mount
  useEffect(() => {
    const checkExistingRating = async () => {
      if (!user || !learningMaterialId) return;
      
      try {
        setIsCheckingRating(true);
        const existingRating = await fetchRatingByMaterialAndUser(
          learningMaterialId,
          user.id
        );
        if (existingRating) {
          setHasRated(true);
          // Đảm bảo modal không hiển thị nếu đã đánh giá
          setShowRatingModal(false);
        }
      } catch (error: any) {
        // Nếu không tìm thấy rating (404), coi như chưa đánh giá
        if (error?.response?.status === 404 || error?.response?.data?.code === 1001) {
          setHasRated(false);
        } else {
          // Lỗi khác, vẫn coi như chưa đánh giá
          console.log('Error checking rating:', error);
          setHasRated(false);
        }
      } finally {
        setIsCheckingRating(false);
      }
    };

    checkExistingRating();
  }, [user, learningMaterialId, fetchRatingByMaterialAndUser]);

  // Kiểm tra xem đây có phải là lesson cuối cùng không
  const isLastLesson = () => {
    if (!displayLesson || derivedLessons.length === 0) return false;
    const lastLesson = derivedLessons[derivedLessons.length - 1];
    return displayLesson.id === lastLesson.id;
  };

  // Xử lý khi video kết thúc
  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    // Kiểm tra nếu video đã kết thúc và đây là lesson cuối cùng
    if (status.didJustFinish && isLastLesson()) {
      // Kiểm tra lại xem đã đánh giá chưa trước khi hiển thị modal
      if (!user || !learningMaterialId) return;
      
      // Nếu đã biết là đã đánh giá rồi, không cần kiểm tra lại
      if (hasRated) {
        console.log('Already rated, skipping modal');
        return;
      }
      
      try {
        console.log('Checking if user has rated:', { learningMaterialId, userId: user.id });
        const existingRating = await fetchRatingByMaterialAndUser(
          learningMaterialId,
          user.id
        );
        
        console.log('Rating check result:', existingRating);
        
        // Chỉ hiển thị modal nếu chưa đánh giá
        if (!existingRating) {
          console.log('No rating found, showing modal');
          setShowRatingModal(true);
        } else {
          // Đánh dấu đã đánh giá và KHÔNG hiển thị modal
          setHasRated(true);
          console.log('User has already rated this material, NOT showing modal');
        }
      } catch (error: any) {
        // Nếu lỗi là 404 hoặc không tìm thấy, hiển thị modal
        if (error?.response?.status === 404 || error?.response?.data?.code === 1001) {
          console.log('Rating not found (404), showing modal');
          setShowRatingModal(true);
        } else {
          // Lỗi khác, vẫn hiển thị modal để user có thể đánh giá
          console.log('Error checking rating, showing modal:', error);
          setShowRatingModal(true);
        }
      }
    }
  };

  // Xử lý submit rating
  const handleSubmitRating = async () => {
    console.log('handleSubmitRating called', { user, learningMaterialId, rating, hasRated });
    
    if (!user || !learningMaterialId) {
      console.log('Missing user or learningMaterialId');
      Alert.alert('Error', 'Please login to rate.');
      return;
    }

    // Kiểm tra xem đã đánh giá chưa trước khi submit
    if (hasRated) {
      console.log('Already rated, showing alert');
      Alert.alert(
        'Thông báo',
        'You have already rated this learning material',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('Submitting rating...', {
        learningMaterialId,
        userId: user.id,
        rating,
        comment: comment.trim() || undefined,
      });

      const result = await createRating({
        learningMaterialId: learningMaterialId,
        userId: user.id,
        rating,
        comment: comment.trim() || undefined,
      });

      console.log('Rating submitted successfully:', result);

      // Đánh dấu đã đánh giá ngay lập tức
      setHasRated(true);
      
      // Đóng modal trước khi hiển thị Alert
      setShowRatingModal(false);
      
      // Reset form
      setComment('');
      setRating(5);
      
      // Show success message after closing modal
      setTimeout(() => {
        Alert.alert('Success', 'Thank you for rating this learning material!', [
          { text: 'OK' },
        ]);
      }, 300);
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      console.error('Error details:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      
      // Kiểm tra nếu lỗi là "đã đánh giá rồi"
      const errorMessage = error?.response?.data?.message || error?.message || '';
      const errorCode = error?.response?.data?.code;
      const statusCode = error?.response?.status;
      
      console.log('Error info:', { errorMessage, errorCode, statusCode });
      
      if (
        errorMessage.includes('already rated') ||
        errorMessage.includes('You have already rated') ||
        errorMessage.includes('đã đánh giá') ||
        statusCode === 409 ||
        errorCode === 1055
      ) {
        setHasRated(true);
        Alert.alert(
          'Thông báo',
          'You have already rated this learning material',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowRatingModal(false);
                setComment('');
                setRating(5);
              },
            },
          ]
        );
      } else {
        // Show error
        const displayMessage = errorMessage || 'Unable to submit rating. Please try again.';
        console.log('Showing error alert:', displayMessage);
        Alert.alert('Error', displayMessage, [{ text: 'OK' }]);
      }
    }
  };

  const handleOpenPdf = async (lesson: Lesson) => {
    if (lesson.documentUrl) {
      Linking.openURL(lesson.documentUrl);
      return;
    }

    if (!lesson.fileName) {
      Alert.alert('No PDF', 'This lesson does not have a PDF document.');
      return;
    }

    try {
      setDownloadingLessonId(lesson.id);

      const { url, headers } = getLessonAssetDownloadConfig(lesson.fileName);

      // Trên web: không dùng FileSystem.downloadAsync (không hỗ trợ / deprecated)
      // và cần gửi kèm header Authorization -> dùng fetch lấy blob rồi mở tab mới
      if (Platform.OS === 'web') {
        const response = await fetch(url, {
          method: 'GET',
          headers: headers as Record<string, string> | undefined,
        });

        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        Linking.openURL(blobUrl);
        return;
      }

      // Native (iOS/Android): tải file về rồi mở chia sẻ/xem PDF
      // @ts-ignore - expo-file-system types may not include documentDirectory
      const docDir = (FileSystem as any).documentDirectory || '';
      const targetPath = `${docDir}${lesson.id}.pdf`;

      const downloadResult = await FileSystem.downloadAsync(
        url,
        targetPath,
        headers
          ? {
            headers,
          }
          : undefined,
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: lesson.title,
        });
      } else {
        Linking.openURL(downloadResult.uri);
      }
    } catch (error) {
      console.error('PDF error', error);
      Alert.alert('Error', 'Unable to open PDF. Please try again.');
    } finally {
      setDownloadingLessonId(null);
    }
  };

  const renderLesson = (lesson: Lesson) => {
    const hasVideo = Boolean(lesson.videoUrl || lesson.fileName);
    const hasDocument = Boolean(lesson.documentUrl || lesson.fileName);

    return (
      <View key={lesson.id} style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          {lesson.durationInSeconds ? (
            <Text style={styles.lessonDuration}>
              {Math.ceil(lesson.durationInSeconds / 60)} min
            </Text>
          ) : null}
        </View>
        {lesson.description ? (
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
        ) : null}
        <View style={styles.lessonActions}>
          <TouchableOpacity
            style={[styles.lessonButton, !hasVideo && styles.disabledButton]}
            disabled={!hasVideo}
            onPress={() =>
              hasVideo ? setActiveVideoLessonId(lesson.id) : undefined
            }
          >
            <Text
              style={[
                styles.lessonButtonText,
                !hasVideo && styles.disabledButtonText,
              ]}
            >
              Video
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.lessonButton, !hasDocument && styles.disabledButton]}
            disabled={!hasDocument || downloadingLessonId === lesson.id}
            onPress={() => handleOpenPdf(lesson)}
          >
            {downloadingLessonId === lesson.id ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.lessonButtonText,
                  !hasDocument && styles.disabledButtonText,
                ]}
              >
                PDF
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.lessonButton}
            onPress={() =>
              {
                setNoteLessonTitle(lesson.title);
                setShowNoteModal(true);
              }
            }
          >
            <Text style={styles.lessonButtonText}>Note</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Course Library</Text>
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <View style={styles.videoWrapper}>
            {videoLoading ? (
              <ActivityIndicator color="#3CBCB2" size="large" />
            ) : videoSource ? (
              <Video
                ref={videoRef}
                source={videoSource}
                style={styles.videoPlayer}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                // @ts-ignore - expo-av Video works on web but has deprecation warning
                webStyle={{ width: '100%', height: '100%' }}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                onError={(error) => {
                  console.error('Video playback error:', error);

                  // Xử lý error object - có thể là error.error hoặc error trực tiếp
                  const errorObj = (error && typeof error === 'object' && 'error' in error)
                    ? (error as any).error
                    : error;
                  const errorCode = (errorObj && typeof errorObj === 'object' && 'code' in errorObj)
                    ? (errorObj as any).code
                    : (error && typeof error === 'object' && 'code' in error)
                      ? (error as any).code
                      : undefined;
                  const errorMessage = (errorObj && typeof errorObj === 'object')
                    ? (errorObj as any).localizedDescription || (errorObj as any).message
                    : (error && typeof error === 'object' && 'message' in error)
                      ? (error as any).message
                      : undefined;

                  console.error('Error code:', errorCode);
                  console.error('Error message:', errorMessage);
                  console.error('Full error:', JSON.stringify(error, null, 2));
                  console.error('Video source:', JSON.stringify(videoSource, null, 2));

                  // Error handling đã được xử lý trong hook
                  // Chỉ log để debug
                  console.error('Video playback error:', {
                    errorCode,
                    errorMessage,
                    error
                  });
                }}
                onLoad={() => {
                  console.log('Video loaded successfully');
                }}
                onLoadStart={() => {
                  console.log('Video loading started');
                }}
              />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoPlaceholderText}>
                  {videoError || 'No video available for this lesson.'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.durationBadge}>
              {displayLesson?.durationInSeconds
                ? `${Math.ceil(displayLesson.durationInSeconds / 60)} min`
                : 'Lesson'}
            </Text>
            <Text style={styles.heroTitle}>
              {displayLesson?.title || material.title}
            </Text>
            <Text style={styles.heroSubtitle}>
              {material.authorName} • {material.subjectName}
            </Text>
            <Text style={styles.heroDescription}>
              {displayLesson?.description || material.description ||
                'Khám phá nội dung chuyên sâu, xây dựng nền tảng vững chắc và áp dụng vào thực tế.'}
            </Text>
            <TouchableOpacity style={styles.readMoreBtn}>
              <Text style={styles.readMoreText}>Tìm hiểu thêm</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh sách bài học</Text>
            <Text style={styles.sectionSubtitle}>
              {derivedLessons.length} bài học
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#3CBCB2" />
          ) : derivedLessons.length === 0 ? (
            <Text style={styles.emptyText}>
              No lessons available for this material.
            </Text>
          ) : (
            derivedLessons.map(renderLesson)
          )}
        </View>
      </ScrollView>

      <NoteModal
        visible={showNoteModal}
        lessonTitle={noteLessonTitle}
        noteText={noteText}
        onChangeText={setNoteText}
        onClose={() => {
          setShowNoteModal(false);
          setNoteText('');
          setNoteLessonTitle('');
        }}
        onSave={() => {
          setShowNoteModal(false);
          setNoteText('');
          setNoteLessonTitle('');
        }}
      />

      <RatingModal
        visible={showRatingModal}
        materialTitle={material.title}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        isSubmitting={isSubmittingRating}
        onSubmit={handleSubmitRating}
        onClose={() => {
          setShowRatingModal(false);
          setComment('');
          setRating(5);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  backText: {
    color: '#3CBCB2',
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  videoWrapper: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  videoPlaceholderText: {
    color: '#E2E8F0',
    textAlign: 'center',
  },
  heroContent: {
    padding: 20,
    gap: 10,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F7F5',
    color: '#0F766E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '600',
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  heroSubtitle: {
    color: '#475569',
    fontWeight: '600',
  },
  heroDescription: {
    color: '#475569',
    lineHeight: 20,
  },
  readMoreBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5F5',
  },
  readMoreText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  lessonCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  lessonDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  lessonActions: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonButton: {
    flex: 1,
    backgroundColor: '#3CBCB2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  lessonButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#6B7280',
  },
  ratingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  ratingModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  starIcon: {
    fontSize: 32,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3CBCB2',
    textAlign: 'center',
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  ratingModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingSecondaryBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ratingSecondaryText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
  ratingPrimaryBtn: {
    flex: 1,
    backgroundColor: '#3CBCB2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ratingPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
});

export default MaterialDetailScreen;

