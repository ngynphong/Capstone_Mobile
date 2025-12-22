import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    Image,
    FlatList,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import {
    X,
    Search,
    Image as ImageIcon,
    Check,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 80) / 2;

interface PixabayImage {
    id: number;
    previewURL: string;
    webformatURL: string;
    largeImageURL: string;
    tags: string;
}

interface ImageSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectImage: (imageUrl: string) => void;
    initialQuery?: string;
}

const PIXABAY_API_KEY = process.env.EXPO_PUBLIC_PIXABAY_API_KEY;

const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
    visible,
    onClose,
    onSelectImage,
    initialQuery = '',
}) => {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [images, setImages] = useState<PixabayImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<PixabayImage | null>(null);
    const fetchingRef = useRef(false);

    // Fetch images from Pixabay
    const fetchImages = useCallback(async (query: string) => {
        if (!query.trim()) {
            setImages([]);
            return;
        }

        // Prevent double API calls
        if (fetchingRef.current) {
            return;
        }
        fetchingRef.current = true;

        setLoading(true);
        try {
            const encodedQuery = encodeURIComponent(query.trim());
            const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodedQuery}&image_type=photo&per_page=8&safesearch=true`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.hits) {
                setImages(data.hits.slice(0, 8));
            } else {
                setImages([]);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            Alert.alert('Error', 'Failed to load images');
            setImages([]);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    // Handle search
    const handleSearch = () => {
        fetchImages(searchQuery);
    };

    // Handle image selection
    const handleSelectImage = (image: PixabayImage) => {
        setSelectedImage(image);
    };

    // Confirm selection
    const handleConfirm = () => {
        if (selectedImage) {
            onSelectImage(selectedImage.webformatURL);
            handleClose();
        }
    };

    // Close modal
    const handleClose = () => {
        setSearchQuery('');
        setImages([]);
        setSelectedImage(null);
        onClose();
    };

    // Reset and search when modal opens with initial query
    React.useEffect(() => {
        if (visible && initialQuery) {
            setSearchQuery(initialQuery);
            fetchImages(initialQuery);
        }
    }, [visible, initialQuery, fetchImages]);

    const renderImageItem = ({ item }: { item: PixabayImage }) => {
        const isSelected = selectedImage?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.imageItem, isSelected && styles.imageItemSelected]}
                onPress={() => handleSelectImage(item)}
                activeOpacity={0.8}
            >
                <Image
                    source={{ uri: item.previewURL }}
                    style={styles.image}
                    resizeMode="cover"
                />
                {isSelected && (
                    <View style={styles.selectedOverlay}>
                        <Check size={24} color="#FFFFFF" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <X size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Search Images</Text>
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            !selectedImage && styles.confirmButtonDisabled,
                        ]}
                        onPress={handleConfirm}
                        disabled={!selectedImage}
                    >
                        <Text
                            style={[
                                styles.confirmButtonText,
                                !selectedImage && styles.confirmButtonTextDisabled,
                            ]}
                        >
                            Select
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Search size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search for images..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                    </View>
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Search size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3CBCB2" />
                            <Text style={styles.loadingText}>Searching images...</Text>
                        </View>
                    ) : images.length > 0 ? (
                        <FlatList
                            data={images}
                            renderItem={renderImageItem}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={2}
                            columnWrapperStyle={styles.imageRow}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.imageList}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <ImageIcon size={64} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>Search for Images</Text>
                            <Text style={styles.emptySubtitle}>
                                Enter a keyword to find images for your flashcard
                            </Text>
                        </View>
                    )}
                </View>

                {/* Pixabay Attribution */}
                <View style={styles.attribution}>
                    <Text style={styles.attributionText}>
                        Images provided by Pixabay
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    confirmButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#3CBCB2',
        borderRadius: 8,
    },
    confirmButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    confirmButtonTextDisabled: {
        color: '#9CA3AF',
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
        backgroundColor: '#FFFFFF',
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 14,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingVertical: 12,
    },
    searchButton: {
        width: 48,
        height: 48,
        backgroundColor: '#3CBCB2',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    imageList: {
        padding: 20,
    },
    imageRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    imageItem: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
    },
    imageItemSelected: {
        borderWidth: 3,
        borderColor: '#3CBCB2',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(60, 188, 178, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    attribution: {
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    attributionText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

export default ImageSearchModal;
