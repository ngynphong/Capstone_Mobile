import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../types/types";
import { useUsers } from "../../hooks/useUser";
// import { useTeacherRatings } from "../../hooks/useTeacherRatings";
import type { UserProfile } from "../../types/userTypes";
// import type { TeacherRating } from "../../types/teacherRating";
import { getUserProfileById } from "../../services/userService";
import { useAppToast } from "../../utils/toast";

type TeacherDetailScreenRouteProp = RouteProp<HomeStackParamList, "TeacherDetail">;
type TeacherDetailScreenNavigationProp = NativeStackNavigationProp<
    HomeStackParamList,
    "TeacherDetail"
>;

const TeacherDetailScreen = () => {
    const navigation = useNavigation<TeacherDetailScreenNavigationProp>();
    const route = useRoute<TeacherDetailScreenRouteProp>();
    const { teacherId } = route.params;

    const { loading: userLoading } = useUsers();
    // const {
    //     ratings,
    //     loading: ratingsLoading,
    //     fetchRatingsByTeacher,
    // } = useTeacherRatings();

    const [teacher, setTeacher] = useState<UserProfile | null>(null);
    const toast = useAppToast();

    const fetchUserById = async (userId: string) => {
        try {
            const res = await getUserProfileById(userId);
            const user = res.data;
            setTeacher(user);
        } catch (error) {
            const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("Failed to fetch user by id:", err);
            toast.error(
                `Không tải được thông tin người dùng${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
            );
        } finally {
        }
    };

    useEffect(() => {
        fetchUserById(teacherId);
    }, [teacherId]);

    const fullName = teacher
        ? `${teacher.firstName} ${teacher.lastName}`.trim()
        : "";
    const avatarUrl = teacher?.avatar || teacher?.imgUrl;
    const teacherProfile = teacher?.teacherProfile;

    const renderRatingStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={16}
                    color="#FFB800"
                />
            );
        }
        return <View style={styles.starsRow}>{stars}</View>;
    };

    // const renderRatingItem = (rating: TeacherRating) => (
    //     <View key={rating.id} style={styles.ratingCard}>
    //         <View style={styles.ratingHeader}>
    //             <View style={styles.ratingStarsContainer}>
    //                 {renderRatingStars(rating.rating)}
    //             </View>
    //             {rating.createdAt && (
    //                 <Text style={styles.ratingDate}>
    //                     {new Date(rating.createdAt).toLocaleDateString()}
    //                 </Text>
    //             )}
    //         </View>
    //         {rating.comment && (
    //             <Text style={styles.ratingComment}>{rating.comment}</Text>
    //         )}
    //         {rating.learningMaterialTitle && (
    //             <View style={styles.materialBadge}>
    //                 <Ionicons name="book-outline" size={12} color="#3CBCB2" />
    //                 <Text style={styles.materialText}>{rating.learningMaterialTitle}</Text>
    //             </View>
    //         )}
    //     </View>
    // );

    if (userLoading && !teacher) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3CBCB2" />
                <Text style={styles.loadingText}>Loading teacher profile...</Text>
            </View>
        );
    }

    if (!teacher) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
                <Text style={styles.errorText}>Teacher not found</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerBackButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Teacher Profile</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Teacher Profile Card */}
                <View style={styles.profileCard}>
                    {/* Avatar with Verification Badge */}
                    <View style={styles.avatarContainer}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={48} color="#3CBCB2" />
                            </View>
                        )}
                        {teacherProfile?.isVerified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={28} color="#1DA1F2" />
                            </View>
                        )}
                    </View>

                    {/* Name and Email */}
                    <Text style={styles.teacherName}>{fullName || "Unknown"}</Text>
                    <Text style={styles.teacherEmail}>{teacher.email}</Text>

                    {/* Teacher Info */}
                    {teacherProfile && (
                        <View style={styles.infoSection}>
                            {teacherProfile.specialization && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="school-outline" size={20} color="#3CBCB2" />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Specialization</Text>
                                        <Text style={styles.infoValue}>
                                            {teacherProfile.specialization}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {teacherProfile.qualification && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="ribbon-outline" size={20} color="#3CBCB2" />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Qualification</Text>
                                        <Text style={styles.infoValue}>
                                            {teacherProfile.qualification}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {teacherProfile.experience && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="briefcase-outline" size={20} color="#3CBCB2" />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Experience</Text>
                                        <Text style={styles.infoValue}>
                                            {teacherProfile.experience}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {teacherProfile.biography && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="document-text-outline" size={20} color="#3CBCB2" />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Biography</Text>
                                        <Text style={styles.infoValue}>
                                            {teacherProfile.biography}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Reviews Section */}
                {/* <View style={styles.reviewsSection}>
                    <Text style={styles.sectionTitle}>Student Reviews</Text>

                    {ratingsLoading ? (
                        <ActivityIndicator size="small" color="#3CBCB2" style={styles.loader} />
                    ) : ratings.length > 0 ? (
                        ratings.map(renderRatingItem)
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
                            <Text style={styles.emptyText}>No reviews yet</Text>
                        </View>
                    )}
                </View> */}

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

export default TeacherDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
    },
    headerBackButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    profileCard: {
        backgroundColor: "#FFF",
        marginTop: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F0F0F0",
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#E8F8F7",
        alignItems: "center",
        justifyContent: "center",
    },
    verifiedBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#FFF",
        borderRadius: 14,
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    teacherName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#000",
        marginBottom: 4,
        textAlign: "center",
    },
    teacherEmail: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16,
    },
    ratingsSummary: {
        width: "100%",
        marginVertical: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#E0E0E0",
    },
    ratingBox: {
        alignItems: "center",
    },
    ratingValue: {
        fontSize: 48,
        fontWeight: "700",
        color: "#3CBCB2",
        marginBottom: 8,
    },
    starsRow: {
        flexDirection: "row",
        gap: 4,
        marginBottom: 8,
    },
    ratingLabel: {
        fontSize: 14,
        color: "#666",
    },
    infoSection: {
        width: "100%",
        marginTop: 8,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
        gap: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: "#999",
        marginBottom: 4,
        fontWeight: "600",
    },
    infoValue: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    reviewsSection: {
        marginTop: 16,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 16,
    },
    ratingCard: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    ratingHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    ratingStarsContainer: {
        flexDirection: "row",
    },
    ratingDate: {
        fontSize: 12,
        color: "#999",
    },
    ratingComment: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
        marginBottom: 8,
    },
    materialBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E8F8F7",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
        alignSelf: "flex-start",
    },
    materialText: {
        fontSize: 12,
        color: "#3CBCB2",
        fontWeight: "500",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        marginTop: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    loadingText: {
        fontSize: 14,
        color: "#666",
        marginTop: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: "#666",
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: "#3CBCB2",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "600",
    },
    loader: {
        marginVertical: 20,
    },
    bottomSpacer: {
        height: 40,
    },
});
