import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Layers, Eye } from 'lucide-react-native';
import type { FlashcardSetListItem } from '../../types/flashcardSet';

interface FlashcardHomeCardProps {
    flashcard: FlashcardSetListItem;
    onPress: () => void;
}

const FlashcardHomeCard: React.FC<FlashcardHomeCardProps> = ({ flashcard, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
                <Layers size={24} color="#3CBCB2" />
            </View>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {flashcard.title}
                </Text>
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Layers size={12} color="#6B7280" />
                        <Text style={styles.metaText}>{flashcard.cardCount} cards</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Eye size={12} color="#6B7280" />
                        <Text style={styles.metaText}>{flashcard.viewCount}</Text>
                    </View>
                </View>
                {flashcard.author && (
                    <Text style={styles.author} numberOfLines={1}>
                        by {flashcard.author.firstName} {flashcard.author.lastName}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 160,
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
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(60, 188, 178, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        lineHeight: 18,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: '#6B7280',
    },
    author: {
        fontSize: 11,
        color: '#9CA3AF',
    },
});

export default FlashcardHomeCard;
