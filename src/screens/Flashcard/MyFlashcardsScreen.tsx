import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    ArrowLeft,
    Plus,
    Layers,
    Eye,
    EyeOff,
    Edit3,
    Trash2,
} from 'lucide-react-native';
import { useFlashcardSets } from '../../hooks/useFlashcardSets';
import { FlashcardStackParamList } from '../../types/types';
import type { FlashcardSetListItem } from '../../types/flashcardSet';

type NavigationProp = NativeStackNavigationProp<FlashcardStackParamList, 'MyFlashcards'>;

const MyFlashcardsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const {
        flashcardSets,
        pageInfo,
        loading,
        fetchMyFlashcardSets,
        deleteFlashcardSet,
        updateVisibility,
    } = useFlashcardSets();

    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Fetch on focus
    useFocusEffect(
        useCallback(() => {
            fetchMyFlashcardSets({ page: 1, size: 10 });
        }, [fetchMyFlashcardSets])
    );

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchMyFlashcardSets({ page: 1, size: 10 });
        setRefreshing(false);
    }, [fetchMyFlashcardSets]);

    // Load more
    const loadMore = useCallback(async () => {
        if (isLoadingMore || loading || !pageInfo) return;
        if (pageInfo.pageNo >= pageInfo.totalPage) return;

        setIsLoadingMore(true);
        await fetchMyFlashcardSets({
            page: pageInfo.pageNo + 1,
            size: 10,
        });
        setIsLoadingMore(false);
    }, [isLoadingMore, loading, pageInfo, fetchMyFlashcardSets]);

    // Handle delete
    const handleDelete = useCallback((item: FlashcardSetListItem) => {
        Alert.alert(
            'Delete Flashcard Set',
            `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingId(item.id);
                        const success = await deleteFlashcardSet(item.id);
                        setDeletingId(null);
                        if (success) {
                            // Refresh list
                            fetchMyFlashcardSets({ page: 1, size: 10 });
                        }
                    },
                },
            ]
        );
    }, [deleteFlashcardSet, fetchMyFlashcardSets]);

    // Handle toggle visibility
    const handleToggleVisibility = useCallback(async (item: FlashcardSetListItem) => {
        setTogglingId(item.id);
        await updateVisibility(item.id);
        setTogglingId(null);
    }, [updateVisibility]);

    // Navigate to detail
    const handleCardPress = (item: FlashcardSetListItem) => {
        navigation.navigate('FlashcardDetail', { flashcardSetId: item.id });
    };

    // Navigate to edit
    const handleEdit = (item: FlashcardSetListItem) => {
        navigation.navigate('FlashcardEdit', { flashcardSetId: item.id });
    };

    // Navigate to create
    const handleCreate = () => {
        navigation.navigate('FlashcardCreate');
    };

    const renderFlashcardCard = ({ item }: { item: FlashcardSetListItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.8}
        >
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                    <Layers size={24} color="#3CBCB2" />
                </View>
                <View style={styles.visibilityBadge}>
                    {item.visible ? (
                        <>
                            <Eye size={12} color="#10B981" />
                            <Text style={styles.visibilityText}>Public</Text>
                        </>
                    ) : (
                        <>
                            <EyeOff size={12} color="#6B7280" />
                            <Text style={[styles.visibilityText, { color: '#6B7280' }]}>Private</Text>
                        </>
                    )}
                </View>
            </View>

            {/* Card Content */}
            <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description || 'No description'}
            </Text>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Layers size={14} color="#6B7280" />
                    <Text style={styles.statText}>{item.cardCount} cards</Text>
                </View>
                <View style={styles.statItem}>
                    <Eye size={14} color="#6B7280" />
                    <Text style={styles.statText}>{item.viewCount} views</Text>
                </View>
            </View>

            {/* Actions Row */}
            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleVisibility(item)}
                    disabled={togglingId === item.id}
                >
                    {togglingId === item.id ? (
                        <ActivityIndicator size="small" color="#3CBCB2" />
                    ) : item.visible ? (
                        <EyeOff size={18} color="#6B7280" />
                    ) : (
                        <Eye size={18} color="#3CBCB2" />
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(item)}
                >
                    <Edit3 size={18} color="#3CBCB2" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                >
                    {deletingId === item.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <Trash2 size={18} color="#EF4444" />
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>My Flashcard Sets</Text>
                    <Text style={styles.headerSubtitle}>
                        Manage your created flashcard sets
                    </Text>
                </View>
            </View>

            {/* Results Info */}
            {pageInfo && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsText}>
                        {pageInfo.totalElement} flashcard set{pageInfo.totalElement !== 1 ? 's' : ''}
                    </Text>
                </View>
            )}
        </>
    );

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#3CBCB2" />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Layers size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Flashcard Sets Yet</Text>
                <Text style={styles.emptySubtitle}>
                    Create your first flashcard set to start studying
                </Text>
                <TouchableOpacity style={styles.createFirstButton} onPress={handleCreate}>
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={styles.createFirstButtonText}>Create Flashcard Set</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={flashcardSets}
                renderItem={renderFlashcardCard}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3CBCB2']}
                        tintColor="#3CBCB2"
                    />
                }
            />

            {/* FAB */}
            {flashcardSets.length > 0 && (
                <TouchableOpacity style={styles.fab} onPress={handleCreate}>
                    <Plus size={28} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            {/* Loading Overlay */}
            {loading && flashcardSets.length === 0 && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#3CBCB2" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#3CBCB2',
        paddingTop: 50,
        paddingBottom: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    resultsInfo: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    resultsText: {
        fontSize: 14,
        color: '#6B7280',
    },
    listContent: {
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(60, 188, 178, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    visibilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    visibilityText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#10B981',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
        lineHeight: 24,
    },
    cardDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 13,
        color: '#6B7280',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    createFirstButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#3CBCB2',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
    },
    createFirstButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    fab: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3CBCB2',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3CBCB2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MyFlashcardsScreen;
