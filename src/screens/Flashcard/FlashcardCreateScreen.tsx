import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Image as ImageIcon,
    Search,
    X,
} from 'lucide-react-native';
import { useFlashcardSets } from '../../hooks/useFlashcardSets';
import { FlashcardStackParamList } from '../../types/types';
import type { CreateFlashcardRequest } from '../../types/flashcardSet';
import ImageSearchModal from '../../components/Flashcard/ImageSearchModal';

type NavigationProp = NativeStackNavigationProp<FlashcardStackParamList, 'FlashcardCreate'>;

interface CardInput extends CreateFlashcardRequest {
    id: string;
}

const FlashcardCreateScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { createFlashcardSet, loading } = useFlashcardSets();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [cards, setCards] = useState<CardInput[]>([
        { id: '1', term: '', definition: '', imageUrl: '' },
        { id: '2', term: '', definition: '', imageUrl: '' },
    ]);
    const [errors, setErrors] = useState<{ title?: string; cards?: string }>({});

    // Image search modal state
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [activeSearchTerm, setActiveSearchTerm] = useState('');

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substring(2, 9);

    // Add new card
    const handleAddCard = useCallback(() => {
        setCards(prev => [
            ...prev,
            { id: generateId(), term: '', definition: '', imageUrl: '' },
        ]);
    }, []);

    // Remove card
    const handleRemoveCard = useCallback((cardId: string) => {
        if (cards.length <= 2) {
            Alert.alert('Minimum Cards', 'You need at least 2 cards in your flashcard set.');
            return;
        }
        setCards(prev => prev.filter(c => c.id !== cardId));
    }, [cards.length]);

    // Update card field
    const handleCardChange = useCallback((cardId: string, field: keyof CreateFlashcardRequest, value: string) => {
        setCards(prev =>
            prev.map(c => (c.id === cardId ? { ...c, [field]: value } : c))
        );
    }, []);

    // Open image search modal
    const handleOpenImageSearch = useCallback((cardId: string, term: string) => {
        setActiveCardId(cardId);
        setActiveSearchTerm(term);
        setImageModalVisible(true);
    }, []);

    // Handle image selection from modal
    const handleSelectImage = useCallback((imageUrl: string) => {
        if (activeCardId) {
            handleCardChange(activeCardId, 'imageUrl', imageUrl);
        }
    }, [activeCardId, handleCardChange]);

    // Clear image
    const handleClearImage = useCallback((cardId: string) => {
        handleCardChange(cardId, 'imageUrl', '');
    }, [handleCardChange]);

    // Validate form
    const validate = (): boolean => {
        const newErrors: { title?: string; cards?: string } = {};

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        }

        const validCards = cards.filter(c => c.term.trim() && c.definition.trim());
        if (validCards.length < 2) {
            newErrors.cards = 'At least 2 cards with term and definition are required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validate()) return;

        const validCards = cards
            .filter(c => c.term.trim() && c.definition.trim())
            .map(c => ({
                term: c.term.trim(),
                definition: c.definition.trim(),
                imageUrl: c.imageUrl?.trim() || undefined,
            }));

        const result = await createFlashcardSet({
            title: title.trim(),
            description: description.trim(),
            isVisible,
            cards: validCards,
        });

        if (result) {
            Alert.alert('Success', 'Flashcard set created successfully!', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('MyFlashcards'),
                },
            ]);
        } else {
            Alert.alert('Error', 'Failed to create flashcard set. Please try again.');
        }
    };

    const renderCardInput = (card: CardInput, index: number) => (
        <View key={card.id} style={styles.cardInputContainer}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardNumber}>Card {index + 1}</Text>
                <TouchableOpacity
                    style={styles.removeCardButton}
                    onPress={() => handleRemoveCard(card.id)}
                >
                    <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Term *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter term"
                    placeholderTextColor="#9CA3AF"
                    value={card.term}
                    onChangeText={value => handleCardChange(card.id, 'term', value)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Definition *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter definition"
                    placeholderTextColor="#9CA3AF"
                    value={card.definition}
                    onChangeText={value => handleCardChange(card.id, 'definition', value)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
            </View>

            <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                    <ImageIcon size={16} color="#6B7280" />
                    <Text style={styles.inputLabel}>Image (optional)</Text>
                </View>

                {card.imageUrl ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image
                            source={{ uri: card.imageUrl }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                        />
                        <View style={styles.imageActions}>
                            <TouchableOpacity
                                style={styles.imageActionButton}
                                onPress={() => handleOpenImageSearch(card.id, card.term)}
                            >
                                <Search size={16} color="#3CBCB2" />
                                <Text style={styles.imageActionText}>Change</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.imageActionButton, styles.imageActionButtonDanger]}
                                onPress={() => handleClearImage(card.id)}
                            >
                                <X size={16} color="#EF4444" />
                                <Text style={[styles.imageActionText, styles.imageActionTextDanger]}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.searchImageButton}
                        onPress={() => handleOpenImageSearch(card.id, card.term)}
                    >
                        <Search size={18} color="#3CBCB2" />
                        <Text style={styles.searchImageButtonText}>Search Image</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Flashcard Set</Text>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Save size={20} color="#FFFFFF" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Set Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Set Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Title *</Text>
                        <TextInput
                            style={[styles.input, errors.title && styles.inputError]}
                            placeholder="Enter flashcard set title"
                            placeholderTextColor="#9CA3AF"
                            value={title}
                            onChangeText={setTitle}
                        />
                        {errors.title && (
                            <Text style={styles.errorText}>{errors.title}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Description (optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter a description for your flashcard set"
                            placeholderTextColor="#9CA3AF"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View>
                            <Text style={styles.switchLabel}>Visibility</Text>
                            <Text style={styles.switchDescription}>
                                {isVisible ? 'Public - Anyone can see this set' : 'Private - Only you can see this set'}
                            </Text>
                        </View>
                        <Switch
                            value={isVisible}
                            onValueChange={setIsVisible}
                            trackColor={{ false: '#D1D5DB', true: 'rgba(60, 188, 178, 0.4)' }}
                            thumbColor={isVisible ? '#3CBCB2' : '#9CA3AF'}
                        />
                    </View>
                </View>

                {/* Cards Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Cards ({cards.length})</Text>
                    </View>

                    {errors.cards && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{errors.cards}</Text>
                        </View>
                    )}

                    {cards.map((card, index) => renderCardInput(card, index))}

                    <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
                        <Plus size={20} color="#3CBCB2" />
                        <Text style={styles.addCardButtonText}>Add Card</Text>
                    </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Save size={20} color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>Create Flashcard Set</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Image Search Modal */}
            <ImageSearchModal
                visible={imageModalVisible}
                onClose={() => setImageModalVisible(false)}
                onSelectImage={handleSelectImage}
                initialQuery={activeSearchTerm}
            />
        </KeyboardAvoidingView>
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
        paddingBottom: 16,
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
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    saveButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    scrollContainer: {
        flex: 1,
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    textArea: {
        minHeight: 80,
        paddingTop: 14,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 6,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    switchDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorBannerText: {
        fontSize: 13,
        color: '#EF4444',
    },
    cardInputContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3CBCB2',
    },
    removeCardButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        backgroundColor: 'rgba(60, 188, 178, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(60, 188, 178, 0.3)',
    },
    searchImageButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#3CBCB2',
    },
    imagePreviewContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
    },
    imagePreview: {
        width: '100%',
        height: 120,
    },
    imageActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
    },
    imageActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: 'rgba(60, 188, 178, 0.1)',
    },
    imageActionButtonDanger: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    imageActionText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#3CBCB2',
    },
    imageActionTextDanger: {
        color: '#EF4444',
    },
    addCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#3CBCB2',
        borderStyle: 'dashed',
        borderRadius: 12,
        marginTop: 8,
    },
    addCardButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#3CBCB2',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#3CBCB2',
        marginHorizontal: 20,
        marginTop: 24,
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: '#3CBCB2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bottomSpacer: {
        height: 50,
    },
});

export default FlashcardCreateScreen;

