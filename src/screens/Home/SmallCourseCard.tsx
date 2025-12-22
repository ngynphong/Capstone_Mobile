import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageSourcePropType } from "react-native";

interface SmallCourseCardProps {
  image: ImageSourcePropType;
  title: string;
  author: string;
  progress: number;
  onPress?: () => void;
}

const SmallCourseCard: React.FC<SmallCourseCardProps> = ({
  image,
  title,
  author,
  progress,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.author}>{author}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SmallCourseCard;

const styles = StyleSheet.create({
  card: {
    width: 175,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 18,
  },
  content: {
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
    lineHeight: 16,
  },
  author: {
    fontSize: 10,
    fontWeight: "500",
    color: "#B2B2B2",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFB800",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#B2B2B2",
  },
});
