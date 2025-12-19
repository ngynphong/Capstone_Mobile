import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AVPlaybackStatus, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { MaterialStackParamList } from '../../types/types';
import type { Lesson } from '../../types/lessonTypes';
import { useMaterialDetail } from '../../hooks/useMaterialDetail';
import useMaterialRating from '../../hooks/useMaterialRating';
import { useAuth } from '../../context/AuthContext';
import NoteModal from '../../components/Material/NoteModal';
import RatingModal from '../../components/Material/RatingModal';
import { useNotes } from '../../hooks/useNotes';
import MaterialHero from '../../components/Material/MaterialHero';
import LessonList from '../../components/Material/LessonList';
import { useLessonProgress } from '../../hooks/useLessonProgress';

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
    refreshLessons,
  } = useMaterialDetail({ material, learningMaterialId });

  const {
    fetchNotesByLessonAndUser,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();

  const [downloadingLessonId, setDownloadingLessonId] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [isCheckingRating, setIsCheckingRating] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteLessonTitle, setNoteLessonTitle] = useState('');
  const [noteLessonId, setNoteLessonId] = useState<string | null>(null);
  const [existingNoteId, setExistingNoteId] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const videoRef = useRef<Video>(null);
  const { 
    createRating, 
    fetchRatingByMaterialAndUser,
    isLoading: isSubmittingRating 
  } = useMaterialRating();

  // Hook để lưu tiến trình video
  const { handlePlaybackStatusUpdate: handleProgressUpdate, resetSaveTime } = useLessonProgress({
    lessonId: displayLesson?.id,
    enabled: !!user, // Chỉ lưu khi có user
    saveInterval: 5, // Lưu mỗi 5 giây
  });

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
          setHasRated(false);
        }
      } finally {
        setIsCheckingRating(false);
      }
    };

    checkExistingRating();
  }, [user, learningMaterialId, fetchRatingByMaterialAndUser]);

  // Reset save time when switching lessons
  useEffect(() => {
    resetSaveTime();
  }, [displayLesson?.id, resetSaveTime]);

  // Check if this is the last lesson
  const isLastLesson = () => {
    if (!displayLesson || derivedLessons.length === 0) return false;
    const lastLesson = derivedLessons[derivedLessons.length - 1];
    return displayLesson.id === lastLesson.id;
  };

  // Xử lý khi video kết thúc
  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    // Call hook to save progress (if available)
    await handleProgressUpdate(status, async (updatedStatus) => {
      // If video just finished, refresh lessons to update completed status
      if (updatedStatus.isLoaded && updatedStatus.didJustFinish) {
        setTimeout(() => {
          refreshLessons();
        }, 1000);
        
        setTimeout(() => {
          refreshLessons();
        }, 2000);
        
        // Check if this is the last lesson
        if (isLastLesson()) {
          // Check again if user has rated before showing modal
          if (!user || !learningMaterialId) return;
          
          // If already rated, no need to check again
          if (hasRated) {
            return;
          }
          
          try {
            const existingRating = await fetchRatingByMaterialAndUser(
              learningMaterialId,
              user.id
            );
            
            if (!existingRating) {
              setShowRatingModal(true);
            } else {
              setHasRated(true);
            }
          } catch (error: any) {
            if (error?.response?.status === 404 || error?.response?.data?.code === 1001) {
              setShowRatingModal(true);
            } else {
              setShowRatingModal(true);
            }
          }
        }
      }
    });
  };

  // Xử lý submit rating
  const handleSubmitRating = async () => {
    if (!user || !learningMaterialId) {
      Alert.alert('Error', 'Please login to rate.');
      return;
    }

    if (hasRated) {
      Alert.alert(
        'Thông báo',
        'You have already rated this learning material',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await createRating({
        learningMaterialId: learningMaterialId,
        userId: user.id,
        rating,
        comment: comment.trim() || undefined,
      });

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
      // Gom logic xử lý lỗi rating cho gọn
      const errorMessage = error?.response?.data?.message || error?.message || '';
      const errorCode = error?.response?.data?.code;
      const statusCode = error?.response?.status;

      // Trường hợp "đã đánh giá rồi"
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
        const displayMessage = errorMessage || 'Unable to submit rating. Please try again.';
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

  const handleOpenNote = async (lesson: Lesson) => {
    if (!user) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để tạo ghi chú.');
      return;
    }

    try {
      setNoteLessonTitle(lesson.title);
      setNoteLessonId(lesson.id);
      setShowNoteModal(true);

      const userNotes = await fetchNotesByLessonAndUser(lesson.id, user.id);
      if (userNotes && userNotes.length > 0) {
        const firstNote: any = userNotes[0];
        setExistingNoteId(firstNote.id);
        // backend dùng field description cho nội dung ghi chú
        setNoteText(firstNote.description || firstNote.content || '');
      } else {
        setExistingNoteId(null);
        setNoteText('');
      }
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error?.response?.data?.message ||
          error?.message ||
          'Không thể tải ghi chú. Vui lòng thử lại.',
      );
      setExistingNoteId(null);
      setNoteText('');
    }
  };

  const handleSaveNote = async () => {
    if (!noteLessonId || !user) {
      setShowNoteModal(false);
      return;
    }

    try {
      setIsSavingNote(true);

      // Nếu đang có note cũ và user xóa hết nội dung -> coi như xóa note
      if (existingNoteId && !noteText.trim()) {
        await deleteNote(existingNoteId);
        setExistingNoteId(null);
        setNoteText('');
        Alert.alert('Thành công', 'Ghi chú của bạn đã được xóa.');
        setShowNoteModal(false);
        return;
      }

      if (!noteText.trim()) {
        Alert.alert('Thông báo', 'Nội dung ghi chú không được để trống.');
        return;
      }

      if (existingNoteId) {
        await updateNote(existingNoteId, {
          description: noteText.trim(),
          title: noteLessonTitle || undefined,
        });
      } else {
        const newNote = await createNote({
          lessonId: noteLessonId,
          description: noteText.trim(),
          title: noteLessonTitle || undefined,
        });
        setExistingNoteId(newNote.id);
      }

      Alert.alert('Thành công', 'Ghi chú của bạn đã được lưu.');
      setShowNoteModal(false);
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error?.response?.data?.message ||
          error?.message ||
          'Không thể lưu ghi chú. Vui lòng thử lại.',
      );
    } finally {
      setIsSavingNote(false);
    }
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

        <MaterialHero
          material={material}
          displayLesson={displayLesson}
          videoSource={videoSource}
          videoLoading={videoLoading}
          videoError={videoError}
          videoRef={videoRef}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        <LessonList
          lessons={derivedLessons}
          isLoading={isLoading}
          downloadingLessonId={downloadingLessonId}
          isMaterialCompleted={hasRated}
          onOpenVideo={(lessonId, hasVideo) => {
            if (hasVideo) {
              setActiveVideoLessonId(lessonId);
            }
          }}
          onOpenPdf={handleOpenPdf}
          onOpenNote={handleOpenNote}
        />
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
          setNoteLessonId(null);
          setExistingNoteId(null);
        }}
        onSave={handleSaveNote}
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
  primaryBtnDisabled: {
    opacity: 0.6,
  },
});

export default MaterialDetailScreen;

