import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Search, Filter, BookOpen } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Exam, Subject, SubjectType, ExamFilters, ExamSortOption, ExamStackParamList } from '../../types/examTypes';
import { ExamService } from '../../services/examService';
import ExamCard from '../../components/Exam/ExamCard';
import SubjectFilter from '../../components/Exam/SubjectFilter';
import CombinedTestBuilder from '../../components/Exam/CombinedTestBuilder';
import { useScroll } from '../../context/ScrollContext';

type NavigationProp = NativeStackNavigationProp<ExamStackParamList>;

const { width } = Dimensions.get('window');

const ExamLibraryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { handleScroll } = useScroll();
  // State management
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('All');
  const [sortOption, setSortOption] = useState<ExamSortOption>({ field: 'title', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [mode, setMode] = useState<'single' | 'combined'>('single');

  // Load initial data
  const loadData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setRefreshing(true);
      else setLoading(true);

      const [examsData, subjectsData] = await Promise.all([
        ExamService.getExams(),
        ExamService.getSubjects(),
      ]);

      setExams(examsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading exam data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply filters and search
  const applyFilters = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ExamFilters = {};

      if (selectedSubject !== 'All') {
        filters.subject = selectedSubject;
      }

      if (searchQuery.trim()) {
        filters.searchQuery = searchQuery.trim();
      }

      const filteredExams = await ExamService.getExams(filters, sortOption);
      setExams(filteredExams);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, searchQuery, sortOption]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(timer);
  }, [applyFilters]);

  // Handle subject filter
  const handleSubjectFilter = (subject: SubjectType) => {
    setSelectedSubject(subject);
  };

  // Handle pull to refresh
  const handleRefresh = () => {
    loadData(true);
  };

  // Handle exam card press
  const handleExamPress = (exam: Exam) => {
    navigation.navigate('ExamDetail', { examId: exam.id });
  };


  // Render exam card
  const renderExamCard = ({ item }: { item: Exam }) => (
    <ExamCard exam={item} onPress={() => handleExamPress(item)} />
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <BookOpen size={64} color="#9CA3AF" />
      <Text className="text-xl font-semibold text-gray-600 mt-4 text-center">
        No exams found
      </Text>
      <Text className="text-gray-500 text-center mt-2">
        {searchQuery || selectedSubject !== 'All'
          ? 'Try adjusting your search or filters'
          : 'Exams will appear here once available'}
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

  return (
    <View className="flex-1 bg-gray-50">

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Exam Test</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-4">
          <Search size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Enter key word to search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className="ml-2 p-2"
          >
            <Filter size={20} color={showFilters ? "#3CBCB2" : "#6B7280"} />
          </TouchableOpacity>
        </View>

        {/* Subject Filters */}
        <SubjectFilter
          subjects={subjects}
          selectedSubject={selectedSubject}
          onSubjectSelect={handleSubjectFilter}
        />

        {/* Mode Selection Tabs */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mt-4">
          <TouchableOpacity
            onPress={() => setMode('single')}
            className={`flex-1 py-2 rounded-lg ${mode === 'single' ? 'bg-teal-400' : ''}`}
          >
            <Text className={`font-semibold text-center ${mode === 'single' ? 'text-white' : 'text-gray-600'}`}>
              Thi Lẻ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('combined')}
            className={`flex-1 py-2 rounded-lg ${mode === 'combined' ? 'bg-teal-400' : ''}`}
          >
            <Text className={`font-semibold text-center ${mode === 'combined' ? 'text-white' : 'text-gray-600'}`}>
              Thi Tổ hợp
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Exams List - Conditional Rendering */}
      {mode === 'single' ? (
        <FlatList
          data={exams}
          renderItem={renderExamCard}
          keyExtractor={(item) => item.id}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100, // Space for tab bar
          }}
          onScroll={handleScroll} // scroll behavior 
          scrollEventThrottle={16} // scroll behavior 
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
        <CombinedTestBuilder
          onStartTest={(examIds) => {
            // TODO: Implement combined test logic
            // For now, just navigate to first exam
            if (examIds.length > 0) {
              navigation.navigate('ExamDetail', { examId: examIds[0] });
            }
          }}
        />
      )}
    </View>
  );
};

export default ExamLibraryScreen;
