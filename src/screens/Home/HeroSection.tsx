import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};



const HeroSection = () => {
  const { user } = useAuth();
  const greeting = getGreeting();

  const getUserInitials = () => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    const initials = (first + last).toUpperCase() || 'U';
    return initials;
  };

  return (
    <View style={styles.container}>
      {/* Header user info */}
      <View style={styles.headerRow}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar || user?.imgUrl ? (
              <Image
                source={{ uri: user.avatar || user.imgUrl }}
                style={styles.avatar}
              />
            ) : (
              <Text className="text-center text-white text-2xl font-bold">{getUserInitials()}</Text>
            )}

          </View>
          <View style={styles.textSection}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </Text>
          </View>
        </View>

        <View style={styles.iconWrapper}>
          <Image
            source={{ uri: "https://placehold.co/20x20" }}
            style={styles.icon}
          />
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Image
          source={{ uri: "https://placehold.co/20x21" }}
          style={styles.searchIcon}
        />
        <Text style={styles.searchText}>Search courses</Text>
      </View>

      {/* Continue learning */}
      <Text style={styles.continueText}>Continue Learning</Text>
    </View>
  );
};

export default HeroSection;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 284,
    backgroundColor: "#3CBCB2",
    borderRadius: 10,
    paddingTop: 35,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "white",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  textSection: {
    flexDirection: "column",
    gap: 2,
  },
  greeting: {
    color: "white",
    fontSize: 12,
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    lineHeight: 20,
  },
  name: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    lineHeight: 20,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 20,
    height: 20,
  },
  searchContainer: {
    position: "absolute",
    top: 115,
    left: 16,
    right: 16,
    height: 48,
    backgroundColor: "white",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: {
    width: 20,
    height: 21,
    marginRight: 8,
  },
  searchText: {
    color: "#707070",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    letterSpacing: 1.2,
  },
  continueText: {
    position: "absolute",
    top: 189,
    left: 16,
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    letterSpacing: 1.2,
    lineHeight: 20,
  },
});
