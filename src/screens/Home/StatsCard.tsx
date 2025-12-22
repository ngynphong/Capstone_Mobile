import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Award, Target } from 'lucide-react-native';

interface StatsCardProps {
    totalExams?: number;
    averageScore?: number;
    passedExams?: number;
    loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
    totalExams = 0,
    averageScore = 0,
    passedExams = 0,
    loading = false,
}) => {
    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingCard} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Progress</Text>
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(60, 188, 178, 0.1)' }]}>
                        <Target size={20} color="#3CBCB2" />
                    </View>
                    <Text style={styles.statValue}>{totalExams}</Text>
                    <Text style={styles.statLabel}>Exams</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statItem}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                        <TrendingUp size={20} color="#F59E0B" />
                    </View>
                    <Text style={styles.statValue}>{averageScore.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Avg Score</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statItem}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                        <Award size={20} color="#22C55E" />
                    </View>
                    <Text style={styles.statValue}>{passedExams}</Text>
                    <Text style={styles.statLabel}>Passed</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    loadingCard: {
        height: 80,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 50,
        backgroundColor: '#E5E7EB',
    },
});

export default StatsCard;
