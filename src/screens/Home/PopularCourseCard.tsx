import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

interface PopularCourseCardProps {
  image: string;
  title: string;
  onPress?: () => void;
  onDetailPress?: () => void;
}

const PopularCourseCard: React.FC<PopularCourseCardProps> = ({
  image,
  title,
  onPress,
  onDetailPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📘</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <TouchableOpacity style={styles.detailButton} onPress={onDetailPress}>
          <Text style={styles.detailText}>Detail</Text>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>ⓘ</Text>
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default PopularCourseCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: 12,
  },
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    lineHeight: 18,
    marginBottom: 8,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#B2B2B2",
    justifyContent: "center",
    alignItems: "center",
  },
  infoIconText: {
    fontSize: 14,
    color: "#B2B2B2",
  },
});
