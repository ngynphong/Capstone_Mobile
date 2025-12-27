import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

interface FilterButtonProps {
  onPress: () => void;
  hasActiveFilters?: boolean;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onPress, hasActiveFilters = false }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.iconContainer}>
        <View style={styles.filterIcon}>
          <View style={styles.filterLines}>
            <View style={[styles.line, hasActiveFilters && styles.activeLine]} />
            <View style={[styles.line, hasActiveFilters && styles.activeLine]} />
            <View style={[styles.line, hasActiveFilters && styles.activeLine]} />
          </View>
        </View>
        {hasActiveFilters && <View style={styles.badge} />}
      </View>
      <Text style={[styles.text, hasActiveFilters && styles.activeText]}>Filters</Text>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>⌄</Text>
      </View>
    </TouchableOpacity>
  );
};

export default FilterButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 8,
    position: "relative",
  },
  filterIcon: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterLines: {
    flexDirection: "column",
    gap: 2,
  },
  line: {
    width: 14,
    height: 2,
    backgroundColor: "#666",
    borderRadius: 1,
  },
  activeLine: {
    backgroundColor: "#3CBCB2",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3CBCB2",
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  activeText: {
    color: "#3CBCB2",
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 12,
    color: "#666",
  },
});
