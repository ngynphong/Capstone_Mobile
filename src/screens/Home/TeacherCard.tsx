import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { UserProfile } from "../../types/userTypes";

interface TeacherCardProps {
    teacher: UserProfile;
    onPress?: () => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, onPress }) => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`.trim();
    const avatarUrl = teacher.avatar || teacher.imgUrl;
    const displayRole = teacher.roles.includes("TEACHER")
        ? "Teacher"
        : teacher.roles[0]?.replace("ROLE_", "") || "User";
console.log("Teacher Profile:", teacher);
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={32} color="#3CBCB2" />
                    </View>
                )}
                {teacher.teacherProfile?.isVerified && (
                    <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#1DA1F2" />
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>
                    {fullName || "Unknown"}
                </Text>

                <View style={styles.emailRow}>
                    <Ionicons name="mail-outline" size={12} color="#999" />
                    <Text style={styles.email} numberOfLines={1}>
                        {teacher.email}
                    </Text>
                </View>

                <View style={styles.roleBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#3CBCB2" />
                    <Text style={styles.roleText}>{displayRole}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default TeacherCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        width: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: "center",
    },
    avatarContainer: {
        marginBottom: 10,
        position: "relative",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#F0F0F0",
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#E8F8F7",
        alignItems: "center",
        justifyContent: "center",
    },
    verifiedBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#FFF",
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    infoContainer: {
        width: "100%",
        alignItems: "center",
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
        marginBottom: 4,
        textAlign: "center",
    },
    emailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 8,
    },
    email: {
        fontSize: 11,
        color: "#999",
        flex: 1,
    },
    roleBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F8F7",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    roleText: {
        fontSize: 11,
        color: "#3CBCB2",
        fontWeight: "600",
    },
});
