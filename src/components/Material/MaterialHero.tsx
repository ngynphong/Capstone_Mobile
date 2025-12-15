import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ResizeMode, Video, AVPlaybackStatus } from 'expo-av';
import type { Material } from '../../types/material';
import type { Lesson } from '../../types/lessonTypes';

interface MaterialHeroProps {
  material: Material;
  displayLesson?: Lesson | null;
  videoSource: any;
  videoLoading: boolean;
  videoError?: string | null;
  videoRef: React.RefObject<Video | null>;
  onPlaybackStatusUpdate: (status: AVPlaybackStatus) => void;
}

const MaterialHero: React.FC<MaterialHeroProps> = ({
  material,
  displayLesson,
  videoSource,
  videoLoading,
  videoError,
  videoRef,
  onPlaybackStatusUpdate,
}) => {
  return (
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
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
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
          {displayLesson?.description ||
            material.description ||
            'Khám phá nội dung chuyên sâu, xây dựng nền tảng vững chắc và áp dụng vào thực tế.'}
        </Text>
        <View style={styles.readMoreBtn}>
          <Text style={styles.readMoreText}>Tìm hiểu thêm</Text>
        </View>
      </View>
    </View>
  );
};

export default MaterialHero;

const styles = StyleSheet.create({
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
});


