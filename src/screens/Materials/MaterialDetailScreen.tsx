import React, { useState } from 'react';
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
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ResizeMode, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { MaterialStackParamList } from '../../types/types';
import type { Lesson } from '../../types/lessonTypes';
import useMaterial from '../../hooks/useMaterial';
import { useMaterialDetail } from '../../hooks/useMaterialDetail';

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
  const { getMaterialImageSource } = useMaterial();
  
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

  const handleOpenPdf = async (lesson: Lesson) => {
    if (lesson.documentUrl) {
      Linking.openURL(lesson.documentUrl);
      return;
    }

    if (!lesson.fileName) {
      Alert.alert('Không có PDF', 'Bài học này chưa có tài liệu PDF.');
      return;
    }

    try {
      setDownloadingLessonId(lesson.id);

      const { url, headers } = getLessonAssetDownloadConfig(lesson.fileName);
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
      Alert.alert('Lỗi', 'Không thể mở PDF. Vui lòng thử lại.');
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
              {Math.ceil(lesson.durationInSeconds / 60)} phút
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
                source={videoSource}
                style={styles.videoPlayer}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                // @ts-ignore - expo-av Video works on web but has deprecation warning
                webStyle={{ width: '100%', height: '100%' }}
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
                  {videoError || 'Chưa có video cho bài học này.'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.durationBadge}>
              {displayLesson?.durationInSeconds
                ? `${Math.ceil(displayLesson.durationInSeconds / 60)} phút`
                : 'Bài học'}
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

        <TouchableOpacity style={styles.ctaCard}>
          <View>
            <Text style={styles.ctaTitle}>Hỏi trợ giảng AI</Text>
            <Text style={styles.ctaSubtitle}>
              Tương tác tức thời và giải đáp mọi thắc mắc trong bài học này.
            </Text>
          </View>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Chat now</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.resourceCard}>
          <View style={styles.resourceHeader}>
            <View style={styles.resourceTitleGroup}>
              <Text style={styles.resourceTitle}>Lesson Material</Text>
              <Text style={styles.resourceHint}>PDF & ghi chú tải về</Text>
            </View>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={() => {
                const firstDoc =
                  derivedLessons.find(
                    (lesson: Lesson) => lesson.documentUrl || lesson.fileName,
                  ) || null;
                if (firstDoc) {
                  handleOpenPdf(firstDoc);
                } else {
                  Alert.alert(
                    'Chưa có tài liệu',
                    'Bài học chưa đính kèm PDF.',
                  );
                }
              }}
            >
              <Text style={styles.downloadText}>Download PDF</Text>
            </TouchableOpacity>
          </View>
          <ImageBackground
            source={getMaterialImageSource(material.fileImage)}
            style={styles.previewBox}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.previewOverlay}>
              <Text style={styles.previewTitle}>Preview Mode</Text>
              <Text style={styles.previewCaption}>
                Nếu không hiển thị mượt mà, hãy tải PDF để đọc trong trình xem
                yêu thích của bạn.
              </Text>
            </View>
          </ImageBackground>
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
              Chưa có bài học nào cho học liệu này.
            </Text>
          ) : (
            derivedLessons.map(renderLesson)
          )}
        </View>
      </ScrollView>
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
  ctaCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  ctaSubtitle: {
    color: '#E0E7FF',
    marginTop: 6,
    maxWidth: '80%',
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  ctaButtonText: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  resourceCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceTitleGroup: {
    gap: 4,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  resourceHint: {
    color: '#6B7280',
  },
  downloadBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  downloadText: {
    color: '#4338CA',
    fontWeight: '600',
  },
  previewBox: {
    height: 180,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  previewCaption: {
    color: '#E2E8F0',
    textAlign: 'center',
    fontSize: 13,
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
});

export default MaterialDetailScreen;

