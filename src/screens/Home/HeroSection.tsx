import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Search, Bell, Sparkles } from "lucide-react-native";

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

interface HeroSectionProps {
  onSearch?: (text: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
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
      {/* Decorative elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

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
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getUserInitials()}</Text>
              </View>
            )}
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.textSection}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={22} color="#FFFFFF" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>0</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses, materials..."
          placeholderTextColor="#9CA3AF"
          onChangeText={onSearch}
        />
      </View>

      {/* Welcome message */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeRow}>
          <Sparkles size={18} color="#FCD34D" />
          <Text style={styles.welcomeText}>Start your learning journey today</Text>
        </View>
      </View>
    </View>
  );
};

export default HeroSection;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#3CBCB2",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 50,
    paddingBottom: 24,
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    top: 80,
    left: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#3CBCB2",
  },
  textSection: {
    flexDirection: "column",
    gap: 2,
  },
  greeting: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
    fontWeight: "500",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  searchContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  welcomeSection: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "500",
  },
});

