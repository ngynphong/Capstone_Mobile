import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, Circle, Play, BookOpen, FileText, Target } from 'lucide-react-native';

interface LearningPhase {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  isPremium?: boolean;
  items: LearningItem[];
  progress: number;
  isCompleted: boolean;
}

interface LearningItem {
  id: number;
  title: string;
  type: 'video' | 'quiz' | 'document' | 'practice';
  isCompleted: boolean;
  icon: React.ReactNode;
}

const RoadmapScreen: React.FC = () => {
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]);

  const learningPhases: LearningPhase[] = [
    {
      id: 1,
      title: 'Foundations',
      subtitle: 'Basics',
      duration: 'Months 1-2',
      description: 'Build fundamental knowledge and familiarize yourself with exam formats.',
      isPremium: false,
      progress: 75,
      isCompleted: false,
      items: [
        {
          id: 1,
          title: 'Video Lecture: General Introduction',
          type: 'video',
          isCompleted: true,
          icon: <Play size={16} color="#10B981" />
        },
        {
          id: 2,
          title: 'PDF Document: Basic Grammar',
          type: 'document',
          isCompleted: true,
          icon: <FileText size={16} color="#10B981" />
        },
        {
          id: 3,
          title: 'Quiz: Chapter 1 Vocabulary',
          type: 'quiz',
          isCompleted: false,
          icon: <Target size={16} color="#F59E0B" />
        },
        {
          id: 4,
          title: 'Video Lecture: Basic Listening Skills',
          type: 'video',
          isCompleted: false,
          icon: <Play size={16} color="#6B7280" />
        }
      ]
    },
    {
      id: 2,
      title: 'Advanced',
      subtitle: 'Intermediate',
      duration: 'Months 3-5',
      description: 'Enhance your skills and apply them to practical exercises.',
      isPremium: false,
      progress: 45,
      isCompleted: false,
      items: [
        {
          id: 5,
          title: 'Video Lecture: Advanced Grammar',
          type: 'video',
          isCompleted: true,
          icon: <Play size={16} color="#10B981" />
        },
        {
          id: 6,
          title: 'Quiz: Chapter 2 Vocabulary',
          type: 'quiz',
          isCompleted: true,
          icon: <Target size={16} color="#10B981" />
        },
        {
          id: 7,
          title: 'Practice Exercise: Reading Comprehension',
          type: 'practice',
          isCompleted: false,
          icon: <BookOpen size={16} color="#F59E0B" />
        }
      ]
    },
    {
      id: 3,
      title: 'Mock Tests',
      subtitle: 'Practice Exams',
      duration: 'Months 6-7',
      description: 'Practice with complete mock exams to build speed and exam mentality.',
      isPremium: false,
      progress: 20,
      isCompleted: false,
      items: [
        {
          id: 8,
          title: 'Complete Mock Test #1',
          type: 'practice',
          isCompleted: false,
          icon: <FileText size={16} color="#6B7280" />
        },
        {
          id: 9,
          title: 'Video Lecture: Error Analysis Test #1',
          type: 'video',
          isCompleted: false,
          icon: <Play size={16} color="#6B7280" />
        },
        {
          id: 10,
          title: 'Complete Mock Test #2',
          type: 'practice',
          isCompleted: false,
          icon: <FileText size={16} color="#6B7280" />
        },
        {
          id: 11,
          title: 'Quiz: Advanced Vocabulary Collection',
          type: 'quiz',
          isCompleted: false,
          icon: <Target size={16} color="#6B7280" />
        }
      ]
    },
    {
      id: 4,
      title: 'Optimization',
      subtitle: 'Final Prep',
      duration: 'Month 8',
      description: 'Automatically adjust your learning path based on your performance results.',
      isPremium: true,
      progress: 0,
      isCompleted: false,
      items: [
        {
          id: 12,
          title: 'Personal Weakness Analysis',
          type: 'practice',
          isCompleted: false,
          icon: <Target size={16} color="#6B7280" />
        },
        {
          id: 13,
          title: 'Suggested Reinforcement Exercises',
          type: 'practice',
          isCompleted: false,
          icon: <BookOpen size={16} color="#6B7280" />
        },
        {
          id: 14,
          title: 'Final Review Study Plan',
          type: 'document',
          isCompleted: false,
          icon: <FileText size={16} color="#6B7280" />
        }
      ]
    }
  ];

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return '#10B981';
    if (progress >= 40) return '#3B82F6';
    if (progress >= 20) return '#F59E0B';
    return '#6B7280';
  };

  const renderPhaseItem = (item: LearningItem) => (
    <TouchableOpacity key={item.id} style={styles.phaseItem}>
      <View style={styles.phaseItemIcon}>
        {item.icon}
      </View>
      <View style={styles.phaseItemContent}>
        <Text style={[
          styles.phaseItemTitle,
          item.isCompleted && styles.completedText
        ]}>
          {item.title}
        </Text>
        <View style={styles.phaseItemStatus}>
          {item.isCompleted ? (
            <CheckCircle size={14} color="#10B981" />
          ) : (
            <Circle size={14} color="#9CA3AF" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPhase = (phase: LearningPhase) => {
    const isExpanded = expandedPhases.includes(phase.id);

    return (
      <View key={phase.id} style={styles.phaseContainer}>
        <TouchableOpacity
          style={styles.phaseHeader}
          onPress={() => togglePhase(phase.id)}
        >
          <View style={styles.phaseHeaderLeft}>
            <View style={[styles.phaseIcon, { backgroundColor: getProgressColor(phase.progress) }]}>
              <Text style={styles.phaseIconText}>{phase.id}</Text>
            </View>
            <View style={styles.phaseInfo}>
              <View style={styles.phaseTitleRow}>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
                <Text style={styles.phaseSubtitle}>({phase.subtitle})</Text>
                {phase.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>Premium</Text>
                  </View>
                )}
              </View>
              <Text style={styles.phaseDuration}>{phase.duration}</Text>
              <Text style={styles.phaseDescription}>{phase.description}</Text>
            </View>
          </View>
          <View style={styles.phaseHeaderRight}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>{phase.progress}%</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${phase.progress}%`,
                      backgroundColor: getProgressColor(phase.progress)
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.phaseContent}>
            {phase.items.map(renderPhaseItem)}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Learning Roadmap</Text>
        <Text style={styles.headerSubtitle}>
          Visualize your learning journey and track your progress.
        </Text>
      </View>

      <View style={styles.progressOverview}>
        <Text style={styles.progressTitle}>Overall Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '45%', backgroundColor: '#3B82F6' }]} />
        </View>
        <Text style={styles.progressStats}>2 / 15 lessons • 13% Complete</Text>
      </View>

      <View style={styles.settingsRow}>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Hide completed items</Text>
          <Circle size={20} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Hide premium phases</Text>
          <Circle size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {learningPhases.map(renderPhase)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#3CBCB2',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  progressOverview: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    fontSize: 12,
    color: '#6B7280',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    fontSize: 14,
    color: '#374151',
  },
  phaseContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
  },
  phaseHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  phaseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  phaseSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  premiumBadge: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  phaseDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  phaseDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  phaseHeaderRight: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  phaseContent: {
    padding: 20,
    paddingTop: 0,
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  phaseItemIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseItemTitle: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  completedText: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
  phaseItemStatus: {
    marginLeft: 8,
  },
});

export default RoadmapScreen;
