import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { Lesson } from '../../types/lessonTypes';

interface LessonListProps {
  lessons: Lesson[];
  isLoading: boolean;
  downloadingLessonId: string | null;
  onOpenVideo: (lessonId: string, hasVideo: boolean) => void;
  onOpenPdf: (lesson: Lesson) => void;
  onOpenNote: (lesson: Lesson) => void;
}

const LessonList: React.FC<LessonListProps> = ({
  lessons,
  isLoading,
  downloadingLessonId,
  onOpenVideo,
  onOpenPdf,
  onOpenNote,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách bài học</Text>
        <Text style={styles.sectionSubtitle}>{lessons.length} bài học</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#3CBCB2" />
      ) : lessons.length === 0 ? (
        <Text style={styles.emptyText}>No lessons available for this material.</Text>
      ) : (
        lessons.map(lesson => {
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
                  onPress={() => onOpenVideo(lesson.id, hasVideo)}
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
                  onPress={() => onOpenPdf(lesson)}
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
                  onPress={() => onOpenNote(lesson)}
                >
                  <Text style={styles.lessonButtonText}>Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

export default LessonList;

const styles = StyleSheet.create({
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


