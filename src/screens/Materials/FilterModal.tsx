import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTeachersList } from "../../hooks/useTeachersList";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onClearAll: () => void;
  onSubmit: (selectedTeacher: string, selectedSubject: string) => void;
  initialTeacher?: string;
  initialSubject?: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onClearAll,
  onSubmit,
  initialTeacher = "All",
  initialSubject = "All",
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState(initialTeacher);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  
  // Fetch teachers from API
  const { teachers, loading: loadingTeachers } = useTeachersList({ pageNo: 0, pageSize: 100 });

  // Sync with initial values when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedTeacher(initialTeacher);
      setSelectedSubject(initialSubject);
    }
  }, [visible, initialTeacher, initialSubject]);

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

  // Build teacher list with "All" option
  const teacherOptions = ["All", ...teachers.map(t => {
    const name = `${t.firstName || ''} ${t.lastName || ''}`.trim();
    return name || "Unknown";
  })];

  const handleClearAll = () => {
    setSelectedTeacher("All");
    setSelectedSubject("All");
    onClearAll();
  };

  const handleSubmit = () => {
    onSubmit(selectedTeacher, selectedSubject);
  };

  const FilterTag = ({ 
    title, 
    isActive = false,
    onPress,
  }: { 
    title: string; 
    isActive?: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.tag, isActive && styles.activeTag]}
      onPress={onPress}
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
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Teachers Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teachers</Text>
            {loadingTeachers ? (
              <ActivityIndicator size="small" color="#3CBCB2" />
            ) : (
              <View style={styles.tagsContainer}>
                {teacherOptions.map((teacher) => (
                  <FilterTag
                    key={teacher}
                    title={teacher}
                    isActive={selectedTeacher === teacher}
                    onPress={() => setSelectedTeacher(teacher)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Subjects Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <View style={styles.tagsContainer}>
              {subjects.map((subject) => (
                <FilterTag
                  key={subject}
                  title={subject}
                  isActive={selectedSubject === subject}
                  onPress={() => setSelectedSubject(subject)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
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
