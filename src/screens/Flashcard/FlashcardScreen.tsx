import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, Layers, Eye, User } from 'lucide-react-native';
import { useFlashcardSets } from '../../hooks/useFlashcardSets';
import { FlashcardStackParamList } from '../../types/types';
import type { FlashcardSetListItem } from '../../types/flashcardSet';

type NavigationProp = NativeStackNavigationProp<FlashcardStackParamList, 'FlashcardMain'>;

const FlashcardScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const {
        flashcardSets,
        pageInfo,
        loading,
        error,
        fetchFlashcardSets,
    } = useFlashcardSets();

    const [searchKeyword, setSearchKeyword] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Initial fetch
    useEffect(() => {
        fetchFlashcardSets({ page: 1, size: 10 });
    }, [fetchFlashcardSets]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFlashcardSets({ keyword: searchKeyword, page: 1, size: 10 });
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword, fetchFlashcardSets]);

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchFlashcardSets({ keyword: searchKeyword, page: 1, size: 10 });
        setRefreshing(false);
    }, [fetchFlashcardSets, searchKeyword]);

    // Load more
    const loadMore = useCallback(async () => {
        if (isLoadingMore || loading || !pageInfo) return;
        if (pageInfo.pageNo >= pageInfo.totalPage) return;

        setIsLoadingMore(true);
        await fetchFlashcardSets({
            keyword: searchKeyword,
            page: pageInfo.pageNo + 1,
            size: 10,
        });
        setIsLoadingMore(false);
    }, [isLoadingMore, loading, pageInfo, fetchFlashcardSets, searchKeyword]);

    const handleCardPress = (item: FlashcardSetListItem) => {
        navigation.navigate('FlashcardDetail', { flashcardSetId: item.id });
    };

    const renderFlashcardCard = ({ item }: { item: FlashcardSetListItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleCardPress(item)}
            activeOpacity={0.8}
        >
            {/* Card Icon */}
            <View style={styles.cardIconContainer}>
                <Layers size={32} color="#3CBCB2" />
            </View>

            {/* Card Content */}
            <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
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

            {/* Author */}
            <View style={styles.authorRow}>
                {item.author?.imgUrl ? (
                    <Image source={{ uri: item.author.imgUrl }} style={styles.authorAvatar} />
                ) : (
                    <View style={styles.authorAvatarPlaceholder}>
                        <User size={12} color="#6B7280" />
                    </View>
                )}
                <Text style={styles.authorName} numberOfLines={1}>
                    {item.author?.firstName} {item.author?.lastName}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Flashcard Sets</Text>
                <Text style={styles.headerSubtitle}>
                    Study with flashcards and test your knowledge with quizzes
                </Text>
            </View>

            {/* Search Section */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search flashcard sets..."
                        placeholderTextColor="#9CA3AF"
                        value={searchKeyword}
                        onChangeText={setSearchKeyword}
                    />
                </View>
            </View>

            {/* Results Info */}
            {pageInfo && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsText}>
                        {pageInfo.totalElement} flashcard set{pageInfo.totalElement !== 1 ? 's' : ''} found
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
                <Text style={styles.emptyTitle}>No Flashcard Sets</Text>
                <Text style={styles.emptySubtitle}>
                    {searchKeyword
                        ? 'Try a different search term'
                        : 'No flashcard sets available yet'}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={flashcardSets}
                renderItem={renderFlashcardCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
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
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 20,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: -20,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
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
    row: {
        paddingHorizontal: 16,
        gap: 12,
    },
    card: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(60, 188, 178, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
        lineHeight: 22,
    },
    cardDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 18,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: '#6B7280',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    authorAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    authorAvatarPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 12,
        color: '#6B7280',
        flex: 1,
    },
    loadingMore: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default FlashcardScreen;
