import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface CareerOrientationCardProps {
  title: string;
  subtitle: string;
  onChangePress?: () => void;
}

const CareerOrientationCard: React.FC<CareerOrientationCardProps> = ({
  title,
  subtitle,
  onChangePress,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.contentRow}>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.iconPlaceholder} />
      </View>
      <TouchableOpacity style={styles.changeButton} onPress={onChangePress}>
        <Text style={styles.changeButtonText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CareerOrientationCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000",
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  changeButton: {
    borderWidth: 1,
    borderColor: "#3CBCB2",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3CBCB2",
  },
});
