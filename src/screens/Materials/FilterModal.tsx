import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onSubmit: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onClearAll,
  onSubmit,
}) => {
  const topics = [
    "All",
    "Art & Design",
    "Math",
    "History",
    "English",
    "Computer Science",
    "Sciences",
    "World Languages",
    "Social Sciences",
    "Ap Capstone",
  ];

  const subjects = [
    "All",
    "Math",
    "Chemistry",
    "History",
    "Biology",
    "English",
    "Music",
    "Art",
    "Science",
    "Physics",
    "Literature",
    "Geography",
  ];

  const FilterTag = ({ title, isActive = false }: { title: string; isActive?: boolean }) => (
    <TouchableOpacity
      style={[styles.tag, isActive && styles.activeTag]}
    >
      <Text style={[styles.tagText, isActive && styles.activeTagText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClearAll} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Topics Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Topics</Text>
            <View style={styles.tagsContainer}>
              {topics.map((topic) => (
                <FilterTag
                  key={topic}
                  title={topic}
                  isActive={topic === "All"}
                />
              ))}
            </View>
          </View>

          {/* Subjects Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <View style={styles.tagsContainer}>
              {subjects.map((subject) => (
                <FilterTag
                  key={subject}
                  title={subject}
                  isActive={subject === "All"}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 18,
    color: "#666",
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  activeTag: {
    backgroundColor: "#3CBCB2",
    borderColor: "#3CBCB2",
  },
  tagText: {
    fontSize: 12,
    color: "#666",
  },
  activeTagText: {
    color: "white",
  },
  submitButton: {
    backgroundColor: "#3CBCB2",
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
