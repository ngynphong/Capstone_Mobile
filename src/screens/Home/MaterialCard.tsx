import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface MaterialCardProps {
  image: string;
  title: string;
  author: string;
  progress: number;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ image, title, author, progress }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.author}>By {author}</Text>
      </View>
      <View style={styles.progressContainer}>
        <Text style={styles.progress}>{progress}%</Text>
      </View>
    </View>
  );
};

export default MaterialCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 11,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 145,
    height: 100,
    borderRadius: 16,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    lineHeight: 18,
  },
  author: {
    fontSize: 10,
    fontWeight: "500",
    color: "#B2B2B2",
    marginTop: 4,
  },
  progressContainer: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  progress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFB800",
  },
});
