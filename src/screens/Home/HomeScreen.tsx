import React, { useEffect, useState } from "react";
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
import MaterialService from "../../services/materialService";
import type { Material } from "../../types/material";
import useMaterialImageSource from "../../hooks/useMaterialImageSource";

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, "HomeMain">;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Fetch exams and teachers
  const { templates: exams, loading: examsLoading } = useBrowseExams({ pageSize: 10 });
  const { teachers, loading: teachersLoading } = useTeachersList({ pageSize: 10 });

  // Fetch public materials
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState<boolean>(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setMaterialsLoading(true);
        setMaterialsError(null);
        const res = await MaterialService.getPublicMaterials({
          pageNo: 0,
          pageSize: 3,
          isPublic: true,
        });

        const data = res.data?.data;
        if (data && Array.isArray(data.items)) {
          setMaterials(data.items);
        } else {
          setMaterials([]);
        }
      } catch (error: any) {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách học liệu.";
        setMaterialsError(msg);
        setMaterials([]);
      } finally {
        setMaterialsLoading(false);
      }
    };

    fetchMaterials();
  }, []);

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
          {materialsLoading ? (
            <ActivityIndicator size="small" color="#3CBCB2" style={styles.loader} />
          ) : materialsError ? (
            <Text style={styles.emptyText}>{materialsError}</Text>
          ) : materials.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {materials.slice(0, 3).map((material) => (
                <HomeMaterialCard key={material.id} material={material} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Chưa có học liệu công khai</Text>
          )}
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

const HomeMaterialCard: React.FC<{ material: Material }> = ({ material }) => {
  const { source } = useMaterialImageSource(material.fileImage);

  return (
    <SmallCourseCard
      image={source}
      title={material.title}
      author={material.authorName}
      progress={75}
    />
  );
};

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
