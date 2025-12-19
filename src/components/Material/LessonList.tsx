import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Lock, CheckCircle2 } from 'lucide-react-native';
import type { Lesson } from '../../types/lessonTypes';

interface LessonListProps {
  lessons: Lesson[];
  isLoading: boolean;
  downloadingLessonId: string | null;
  onOpenVideo: (lessonId: string, hasVideo: boolean) => void;
  onOpenPdf: (lesson: Lesson) => void;
  onOpenNote: (lesson: Lesson) => void;
}

/**
 * Check if a lesson is locked
 * A lesson is locked if:
 * - It's not the first lesson
 * - The previous lesson is not completed (completed !== true)
 */
const isLessonLocked = (lesson: Lesson, lessons: Lesson[], index: number): boolean => {
  // First lesson is always unlocked
  if (index === 0) return false;
  
  // Check if previous lesson is completed
  const previousLesson = lessons[index - 1];
  if (!previousLesson) return false;
  
  // If previous lesson is not completed, this lesson is locked
  return previousLesson.completed !== true;
};

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
        <Text style={styles.sectionTitle}>Lesson List</Text>
        <Text style={styles.sectionSubtitle}>{lessons.length} lessons</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#3CBCB2" />
      ) : lessons.length === 0 ? (
        <Text style={styles.emptyText}>No lessons available for this material.</Text>
      ) : (
        lessons.map((lesson, index) => {
          const hasVideo = Boolean(lesson.videoUrl || lesson.fileName);
          const hasDocument = Boolean(lesson.documentUrl || lesson.fileName);
          const isLocked = isLessonLocked(lesson, lessons, index);
          const isCompleted = lesson.completed === true;

          return (
            <View key={lesson.id} style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <View style={styles.lessonTitleRow}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  {isLocked && (
                    <View style={styles.lockedBadge}>
                      <Lock size={14} color="#DC2626" />
                    </View>
                  )}
                  {isCompleted && !isLocked && (
                    <View style={styles.completedBadge}>
                      <CheckCircle2 size={14} color="#059669" />
                    </View>
                  )}
                </View>
                {lesson.durationInSeconds ? (
                  <Text style={styles.lessonDuration}>
                    {Math.ceil(lesson.durationInSeconds / 60)} min
                  </Text>
                ) : null}
              </View>
              {lesson.description ? (
                <Text style={styles.lessonDescription}>{lesson.description}</Text>
              ) : null}
              {isLocked && (
                <Text style={styles.lockedMessage}>
                  Please complete the previous lesson to unlock this lesson
                </Text>
              )}
              <View style={styles.lessonActions}>
                <TouchableOpacity
                  style={[
                    styles.lessonButton,
                    (!hasVideo || isLocked) && styles.disabledButton,
                  ]}
                  disabled={!hasVideo || isLocked}
                  onPress={() => onOpenVideo(lesson.id, hasVideo && !isLocked)}
                >
                  <Text
                    style={[
                      styles.lessonButtonText,
                      (!hasVideo || isLocked) && styles.disabledButtonText,
                    ]}
                  >
                    Video
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.lessonButton,
                    (!hasDocument || isLocked || downloadingLessonId === lesson.id) && styles.disabledButton,
                  ]}
                  disabled={!hasDocument || isLocked || downloadingLessonId === lesson.id}
                  onPress={() => onOpenPdf(lesson)}
                >
                  {downloadingLessonId === lesson.id ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.lessonButtonText,
                        (!hasDocument || isLocked) && styles.disabledButtonText,
                      ]}
                    >
                      PDF
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.lessonButton, isLocked && styles.disabledButton]}
                  disabled={isLocked}
                  onPress={() => onOpenNote(lesson)}
                >
                  <Text
                    style={[
                      styles.lessonButtonText,
                      isLocked && styles.disabledButtonText,
                    ]}
                  >
                    Note
                  </Text>
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
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  lockedBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedMessage: {
    fontSize: 13,
    color: '#DC2626',
    fontStyle: 'italic',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
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


