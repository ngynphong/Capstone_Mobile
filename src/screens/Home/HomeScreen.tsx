import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChevronRight } from "lucide-react-native";
import { HomeStackParamList } from "../../types/types";
import HeroSection from "./HeroSection";
import StatsCard from "./StatsCard";
import FlashcardHomeCard from "./FlashcardHomeCard";
import CommunityHomeCard from "./CommunityHomeCard";
import ExamCard from "./ExamCard";
import TeacherCard from "./TeacherCard";
import ChatBotBubble from "../../components/ChatBotCard";
import { useBrowseExams } from "../../hooks/useExam";
import { useTeachersList } from "../../hooks/useTeachersList";
import { useFlashcardSets } from "../../hooks/useFlashcardSets";
import DashboardService from "../../services/dashboardService";
import CommunityService from "../../services/communityService";
import type { StudentExamStatsResponse } from "../../types/dashboard";
import type { Community } from "../../types/communityTypes";

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, "HomeMain">;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Existing hooks
  const { templates: exams, loading: examsLoading } = useBrowseExams({ pageSize: 10 });
  const { teachers, loading: teachersLoading } = useTeachersList({ pageSize: 10 });
  const { flashcardSets, loading: flashcardsLoading, fetchFlashcardSets } = useFlashcardSets();

  // Local states
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StudentExamStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await DashboardService.getStudentExamStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch communities
  const fetchCommunities = useCallback(async () => {
    try {
      const response = await CommunityService.getCommunities({ pageNo: 0, pageSize: 5 });
      const data = response.data?.data;
      if (Array.isArray(data)) {
        setCommunities(data);
      } else if (data && 'items' in data) {
        setCommunities(data.items);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setCommunitiesLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchCommunities();
    fetchFlashcardSets({ page: 1, size: 6 });
  }, [fetchStats, fetchCommunities, fetchFlashcardSets]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchCommunities(),
      fetchFlashcardSets({ page: 1, size: 6 }),
    ]);
    setRefreshing(false);
  }, [fetchStats, fetchCommunities, fetchFlashcardSets]);

  const renderSectionHeader = (title: string, onSeeAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={16} color="#3CBCB2" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3CBCB2"]}
            tintColor="#3CBCB2"
          />
        }
      >
        {/* Hero Section */}
        <HeroSection />

        {/* Stats Section */}
        <View style={styles.section}>
          <StatsCard
            totalExams={stats?.data?.totalExamsTaken || 0}
            averageScore={stats?.data?.averageScore || 0}
            passedExams={stats?.data?.examsInProgress || 0}
            loading={statsLoading}
          />
        </View>

        {/* Popular Flashcards Section */}
        <View style={styles.section}>
          {renderSectionHeader("Popular Flashcards", () => navigation.navigate("Flashcard" as any))}
          {flashcardsLoading ? (
            <ActivityIndicator size="small" color="#3CBCB2" style={styles.loader} />
          ) : flashcardSets.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {flashcardSets.slice(0, 5).map((flashcard) => (
                <FlashcardHomeCard
                  key={flashcard.id}
                  flashcard={flashcard}
                  onPress={() => console.log("Flashcard pressed:", flashcard.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No flashcards available</Text>
          )}
        </View>

        {/* Communities Section */}
        <View style={styles.section}>
          {renderSectionHeader("Active Communities", () => navigation.navigate("Community" as any))}
          {communitiesLoading ? (
            <ActivityIndicator size="small" color="#3CBCB2" style={styles.loader} />
          ) : communities.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {communities.map((community) => (
                <CommunityHomeCard
                  key={community.id}
                  community={community}
                  onPress={() => console.log("Community pressed:", community.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No communities available</Text>
          )}
        </View>

        {/* Exams Section - Keep unchanged */}
        <View style={styles.section}>
          {renderSectionHeader("Available Exams")}
          {examsLoading ? (
            <ActivityIndicator size="small" color="#3CBCB2" style={styles.loader} />
          ) : exams.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {exams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  onPress={() => console.log("Exam pressed:", exam.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No exams available</Text>
          )}
        </View>

        {/* Teachers Section - Keep unchanged */}
        <View style={styles.section}>
          {renderSectionHeader("Featured Teachers")}
          {teachersLoading ? (
            <ActivityIndicator size="small" color="#3CBCB2" style={styles.loader} />
          ) : teachers.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {teachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  onPress={() => navigation.navigate("TeacherDetail", { teacherId: teacher.id })}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No teachers available</Text>
          )}
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating ChatBot Bubble */}
      <ChatBotBubble />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3CBCB2",
  },
  horizontalScrollContent: {
    paddingRight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 20,
  },
});

