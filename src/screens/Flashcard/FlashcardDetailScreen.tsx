import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Play,
    RotateCcw,
    User,
    Layers,
    Eye,
    Calendar,
} from 'lucide-react-native';
import { useFlashcardSets } from '../../hooks/useFlashcardSets';
import { FlashcardStackParamList } from '../../types/types';
import type { Flashcard } from '../../types/flashcardSet';

type NavigationProp = NativeStackNavigationProp<FlashcardStackParamList, 'FlashcardDetail'>;
type RouteProps = RouteProp<FlashcardStackParamList, 'FlashcardDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 280;

const FlashcardDetailScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { flashcardSetId } = route.params;

    const {
        currentFlashcardSet,
        loading,
        fetchFlashcardSetById,
        clearCurrentFlashcardSet,
    } = useFlashcardSets();

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnimation = useRef(new Animated.Value(0)).current;

    // Fetch flashcard set details
    useEffect(() => {
        fetchFlashcardSetById(flashcardSetId);
        return () => clearCurrentFlashcardSet();
    }, [flashcardSetId, fetchFlashcardSetById, clearCurrentFlashcardSet]);

    // Flip card animation
    const flipCard = () => {
        if (isFlipped) {
            Animated.spring(flipAnimation, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            Animated.spring(flipAnimation, {
                toValue: 180,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        }
        setIsFlipped(!isFlipped);
    };

    // Navigate to next/previous card
    const goToNextCard = () => {
        if (currentFlashcardSet && currentCardIndex < currentFlashcardSet.flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            resetFlip();
        }
    };

    const goToPrevCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            resetFlip();
        }
    };

    const resetFlip = () => {
        setIsFlipped(false);
        flipAnimation.setValue(0);
    };

    const resetStudy = () => {
        setCurrentCardIndex(0);
        resetFlip();
    };

    // Navigate to quiz
    const startQuiz = () => {
        navigation.navigate('FlashcardQuiz', { flashcardSetId });
    };

    // Animation interpolations
    const frontInterpolate = flipAnimation.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnimation.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const frontAnimatedStyle = {
        transform: [{ rotateY: frontInterpolate }],
    };

    const backAnimatedStyle = {
        transform: [{ rotateY: backInterpolate }],
    };

    if (loading || !currentFlashcardSet) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3CBCB2" />
            </View>
        );
    }

    const currentCard: Flashcard | undefined = currentFlashcardSet.flashcards[currentCardIndex];
    const totalCards = currentFlashcardSet.flashcards.length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {currentFlashcardSet.title}
                    </Text>
                    <View style={styles.headerStats}>
                        <View style={styles.statItem}>
                            <Layers size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.statText}>{totalCards} cards</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Eye size={14} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.statText}>{currentFlashcardSet.viewCount} views</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Author Info */}
                <View style={styles.authorSection}>
                    <View style={styles.authorRow}>
                        {currentFlashcardSet.author?.imgUrl ? (
                            <Image
                                source={{ uri: currentFlashcardSet.author.imgUrl }}
                                style={styles.authorAvatar}
                            />
                        ) : (
                            <View style={styles.authorAvatarPlaceholder}>
                                <User size={16} color="#6B7280" />
                            </View>
                        )}
                        <View>
                            <Text style={styles.authorName}>
                                {currentFlashcardSet.author?.firstName} {currentFlashcardSet.author?.lastName}
                            </Text>
                            <View style={styles.dateRow}>
                                <Calendar size={12} color="#9CA3AF" />
                                <Text style={styles.dateText}>
                                    {new Date(currentFlashcardSet.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {currentFlashcardSet.description && (
                        <Text style={styles.description}>{currentFlashcardSet.description}</Text>
                    )}
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressText}>
                            {currentCardIndex + 1} / {totalCards}
                        </Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${((currentCardIndex + 1) / totalCards) * 100}%` },
                            ]}
                        />
                    </View>
                </View>

                {/* Flashcard */}
                {currentCard && (
                    <TouchableOpacity
                        activeOpacity={0.95}
                        onPress={flipCard}
                        style={styles.cardContainer}
                    >
                        {/* Front Side (Term) */}
                        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                            <Text style={styles.cardLabel}>Term</Text>
                            {currentCard.imageUrl && (
                                <Image
                                    source={{ uri: currentCard.imageUrl }}
                                    style={styles.cardImage}
                                    resizeMode="contain"
                                />
                            )}
                            <Text style={styles.cardText}>{currentCard.term}</Text>
                            <Text style={styles.flipHint}>Tap to flip</Text>
                        </Animated.View>

                        {/* Back Side (Definition) */}
                        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                            <Text style={styles.cardLabel}>Definition</Text>
                            <Text style={styles.cardText}>{currentCard.definition}</Text>
                            <Text style={styles.flipHint}>Tap to flip</Text>
                        </Animated.View>
                    </TouchableOpacity>
                )}

                {/* Navigation Controls */}
                <View style={styles.navigationControls}>
                    <TouchableOpacity
                        style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
                        onPress={goToPrevCard}
                        disabled={currentCardIndex === 0}
                    >
                        <ChevronLeft size={28} color={currentCardIndex === 0 ? '#D1D5DB' : '#3CBCB2'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.resetButton} onPress={resetStudy}>
                        <RotateCcw size={20} color="#6B7280" />
                        <Text style={styles.resetText}>Reset</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            currentCardIndex === totalCards - 1 && styles.navButtonDisabled,
                        ]}
                        onPress={goToNextCard}
                        disabled={currentCardIndex === totalCards - 1}
                    >
                        <ChevronRight
                            size={28}
                            color={currentCardIndex === totalCards - 1 ? '#D1D5DB' : '#3CBCB2'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.quizButton} onPress={startQuiz}>
                        <Play size={20} color="#FFFFFF" />
                        <Text style={styles.quizButtonText}>Start Quiz</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#3CBCB2',
        paddingTop: 50,
        paddingBottom: 20,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerStats: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    scrollContainer: {
        flex: 1,
    },
    authorSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    authorAvatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 12,
        lineHeight: 20,
    },
    progressSection: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    progressText: {
        fontSize: 14,
        color: '#3CBCB2',
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3CBCB2',
        borderRadius: 3,
    },
    cardContainer: {
        marginHorizontal: 24,
        marginTop: 24,
        height: CARD_HEIGHT,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 20,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backfaceVisibility: 'hidden',
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    cardFront: {
        backgroundColor: '#FFFFFF',
    },
    cardBack: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#3CBCB2',
    },
    cardLabel: {
        position: 'absolute',
        top: 16,
        left: 20,
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardImage: {
        width: 100,
        height: 80,
        marginBottom: 16,
        borderRadius: 8,
    },
    cardText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        lineHeight: 30,
    },
    flipHint: {
        position: 'absolute',
        bottom: 16,
        fontSize: 12,
        color: '#9CA3AF',
    },
    navigationControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 24,
    },
    navButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    navButtonDisabled: {
        backgroundColor: '#F3F4F6',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    resetText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    actionButtons: {
        marginHorizontal: 20,
        marginTop: 32,
    },
    quizButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#3CBCB2',
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: '#3CBCB2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    quizButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bottomSpacer: {
        height: 100,
    },
});

export default FlashcardDetailScreen;
