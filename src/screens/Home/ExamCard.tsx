import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ExamTemplate } from "../../types/examTypes";

interface ExamCardProps {
    exam: ExamTemplate;
    onPress?: () => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>
                    {exam.title}
                </Text>
            </View>

            <View style={styles.subjectRow}>
                <Ionicons name="book-outline" size={14} color="#666" />
                <Text style={styles.subjectText} numberOfLines={1}>
                    {exam.subject.name}
                </Text>
            </View>

            <View style={styles.teacherRow}>
                <Ionicons name="person-outline" size={14} color="#666" />
                <Text style={styles.teacherText} numberOfLines={1}>
                    {exam.createdBy}
                </Text>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.statText}>
                        {exam.averageRating > 0 ? exam.averageRating.toFixed(1) : "N/A"}
                    </Text>
                </View>

                <View style={styles.statItem}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.statText}>{exam.duration} min</Text>
                </View>

                <View style={styles.statItem}>
                    <Ionicons name="people-outline" size={14} color="#666" />
                    <Text style={styles.statText}>{exam.totalTakers}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.tokenBadge}>
                    <Ionicons name="diamond-outline" size={12} color="#3CBCB2" />
                    <Text style={styles.tokenText}>{exam.tokenCost} tokens</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ExamCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        width: 220,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        marginBottom: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: "600",
        color: "#000",
        lineHeight: 20,
    },
    subjectRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        gap: 6,
    },
    subjectText: {
        fontSize: 13,
        color: "#666",
        flex: 1,
    },
    teacherRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        gap: 6,
    },
    teacherText: {
        fontSize: 12,
        color: "#666",
        flex: 1,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    tokenBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F8F7",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    tokenText: {
        fontSize: 11,
        color: "#3CBCB2",
        fontWeight: "600",
    },
});
