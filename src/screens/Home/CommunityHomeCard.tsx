import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, BookOpen } from 'lucide-react-native';
import type { Community } from '../../types/communityTypes';

interface CommunityHomeCardProps {
    community: Community;
    onPress: () => void;
}

const CommunityHomeCard: React.FC<CommunityHomeCardProps> = ({ community, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Users size={20} color="#8B5CF6" />
                </View>
                <View style={styles.badge}>
                    <BookOpen size={10} color="#FFFFFF" />
                    <Text style={styles.badgeText}>{community.subject || 'General'}</Text>
                </View>
            </View>
            <Text style={styles.name} numberOfLines={2}>
                {community.name}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
                {community.description || 'Join the discussion'}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    },
});

export default CommunityHomeCard;
