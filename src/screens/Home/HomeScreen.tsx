import React from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import HeroSection from "./HeroSection";
import CourseCard from "./MaterialCard";
import CareerOrientationCard from "./CareerOrientationCard";
import GoalTargetCard from "./GoalTargetCard";
import SmallCourseCard from "./SmallCourseCard";
import PopularCourseCard from "./PopularCourseCard";

const HomeScreen = () => {
  return (
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

      {/* Bottom Spacing for Tab Bar */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
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
});
