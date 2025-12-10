import React from "react";
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../types/types";
import HeroSection from "./HeroSection";
import CourseCard from "./MaterialCard";
import CareerOrientationCard from "./CareerOrientationCard";
import GoalTargetCard from "./GoalTargetCard";
import SmallCourseCard from "./SmallCourseCard";
import PopularCourseCard from "./PopularCourseCard";
import ExamCard from "./ExamCard";
import TeacherCard from "./TeacherCard";
import ChatBotBubble from "../../components/ChatBotCard";
import { useBrowseExams } from "../../hooks/useExam";
import { useTeachersList } from "../../hooks/useTeachersList";
import { SafeAreaView } from "react-native-safe-area-context";

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, "HomeMain">;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Fetch exams and teachers
  const { templates: exams, loading: examsLoading } = useBrowseExams({ pageSize: 10 });
  const { teachers, loading: teachersLoading } = useTeachersList({ pageSize: 10 });

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Header, Search, and Continue Learning text */}
        <HeroSection />

        {/* Continue Learning Course Card */}
        <View style={styles.continueSection}>
          <CourseCard
            image="https://placehold.co/145x100"
            title="Data React Tutorial Beginners For Skills Building Carrera AI"
            author="Mr.Nobody"
            progress={75}
          />
        </View>

        {/* Career Orientation and Goal Target Cards */}
        <View style={styles.cardsRow}>
          <View style={styles.halfCard}>
            <CareerOrientationCard
              title="Your career orientation"
              subtitle="Software Engineering 🎓"
              onChangePress={() => console.log("Change career")}
            />
          </View>
          <View style={styles.halfCard}>
            <GoalTargetCard title="Goal Target 🎯" target="5 point with Math" />
          </View>
        </View>

        {/* Your Course Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Material</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <SmallCourseCard
              image="https://placehold.co/175x120"
              title="Inovative Instructional"
              author="Jansie Smit"
              progress={75}
            />
            <SmallCourseCard
              image="https://placehold.co/175x120"
              title="Inovative Instructional"
              author="Jansie Smit"
              progress={75}
            />
            <SmallCourseCard
              image="https://placehold.co/175x120"
              title="Inovative Instructional"
              author="Jansie Smit"
              progress={75}
            />
          </ScrollView>
        </View>

        {/* Popular Course Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Course</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          <PopularCourseCard
            image="https://placehold.co/120x90"
            title="Inovative Instructional For Student"
            onDetailPress={() => console.log("View details")}
          />
          <PopularCourseCard
            image="https://placehold.co/120x90"
            title="Inovative Instructional For Student"
            onDetailPress={() => console.log("View details")}
          />
        </View>

        {/* Exams Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Exams</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          {examsLoading ? (
            <ActivityIndicator size="small" color="#3CBCB2" style={styles.loader} />
          ) : exams.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
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

        {/* Teachers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Teachers</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>
          {teachersLoading ? (
            <ActivityIndicator size="small" color="#3CBCB2" style={styles.loader} />
          ) : teachers.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
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

      {/* Floating ChatBot Bubble - Outside ScrollView */}
      <ChatBotBubble />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  continueSection: {
    paddingHorizontal: 16,
    marginTop: -40,
  },
  cardsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 16,
  },
  halfCard: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  seeAll: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3CBCB2",
  },
  horizontalScroll: {
    marginHorizontal: -16,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
  },
  bottomSpacer: {
    height: 100,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
});
