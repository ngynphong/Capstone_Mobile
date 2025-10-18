import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface GoalTargetCardProps {
  title: string;
  target: string;
}

const GoalTargetCard: React.FC<GoalTargetCardProps> = ({ title, target }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.emoji}>🎯</Text>
      </View>
      <Text style={styles.target}>{target}</Text>
    </View>
  );
};

export default GoalTargetCard;

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  emoji: {
    fontSize: 20,
  },
  target: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000",
  },
});
