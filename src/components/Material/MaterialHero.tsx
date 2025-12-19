import React, { useRef, useEffect } from 'react';
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
  const lastValidPositionRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Reset vị trí hợp lệ khi video source thay đổi
  useEffect(() => {
    lastValidPositionRef.current = 0;
    isSeekingRef.current = false;
  }, [videoSource]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded || !videoRef.current) {
      onPlaybackStatusUpdate(status);
      return;
    }

    const now = Date.now();
    const currentTime = status.positionMillis / 1000;
    const lastValid = lastValidPositionRef.current;
    const timeSinceLastUpdate = (now - lastUpdateTimeRef.current) / 1000;

    // Nếu video đang phát bình thường
    if (status.isPlaying) {
      // Cho phép tăng dần vị trí khi video đang phát (tối đa 2 giây mỗi lần update)
      if (currentTime >= lastValid && currentTime <= lastValid + timeSinceLastUpdate + 1) {
        // Vị trí hợp lệ - video đang phát bình thường
        lastValidPositionRef.current = currentTime;
        lastUpdateTimeRef.current = now;
        isSeekingRef.current = false;
      } else if (currentTime < lastValid - 0.3) {
        // Tua về trước -> reset về vị trí hợp lệ
        isSeekingRef.current = true;
        videoRef.current.setPositionAsync(lastValid * 1000).catch(() => {});
        onPlaybackStatusUpdate(status);
        return;
      } else if (currentTime > lastValid + 2) {
        // Nhảy quá xa về phía trước -> reset về vị trí hợp lệ
        isSeekingRef.current = true;
        videoRef.current.setPositionAsync(lastValid * 1000).catch(() => {});
        onPlaybackStatusUpdate(status);
        return;
      }
    } else {
      // Khi video đang pause, nếu vị trí thay đổi đột ngột -> có thể là seek
      if (Math.abs(currentTime - lastValid) > 0.3 && !isSeekingRef.current) {
        // Reset về vị trí hợp lệ
        isSeekingRef.current = true;
        videoRef.current.setPositionAsync(lastValid * 1000).catch(() => {});
        onPlaybackStatusUpdate(status);
        return;
      }
      // Nếu đang trong quá trình reset (isSeeking), không cập nhật lastValid
      if (!isSeekingRef.current && currentTime >= lastValid) {
        lastValidPositionRef.current = currentTime;
      }
    }

    // Reset flag sau khi đã xử lý
    if (isSeekingRef.current && Math.abs(currentTime - lastValid) < 0.2) {
      isSeekingRef.current = false;
    }

    onPlaybackStatusUpdate(status);
  };

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
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            progressUpdateIntervalMillis={500}
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


