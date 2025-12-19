import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ActivityIndicator,
    Text,
    Dimensions,
    ScrollView,
} from 'react-native';
import { X, ZoomIn, ImageOff } from 'lucide-react-native';

interface QuestionImageProps {
    imageUrl: string;
    alt?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const QuestionImage: React.FC<QuestionImageProps> = ({ imageUrl, alt }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    if (hasError) {
        return (
            <View style={styles.errorContainer}>
                <ImageOff size={24} color="#9CA3AF" />
                <Text style={styles.errorText}>Failed to load image</Text>
            </View>
        );
    }

    return (
        <>
            {/* Inline Image Preview */}
            <TouchableOpacity
                style={styles.container}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.9}
            >
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="small" color="#3CBCB2" />
                    </View>
                )}
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                    onLoad={handleLoad}
                    onError={handleError}
                />
                <View style={styles.zoomHint}>
                    <ZoomIn size={16} color="#ffffff" />
                    <Text style={styles.zoomHintText}>Tap to zoom</Text>
                </View>
            </TouchableOpacity>

            {/* Full Screen Modal */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIsModalVisible(false)}
                    >
                        <X size={24} color="#ffffff" />
                    </TouchableOpacity>

                    {/* Zoomable Image */}
                    <ScrollView
                        style={styles.modalScrollView}
                        contentContainerStyle={styles.modalContentContainer}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        centerContent={true}
                    >
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    </ScrollView>

                    {/* Alt Text */}
                    {alt && (
                        <View style={styles.altContainer}>
                            <Text style={styles.altText}>{alt}</Text>
                        </View>
                    )}
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F9FAFB',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        zIndex: 1,
    },
    zoomHint: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    zoomHintText: {
        fontSize: 11,
        color: '#ffffff',
    },
    errorContainer: {
        marginVertical: 12,
        padding: 24,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 24,
    },
    modalScrollView: {
        flex: 1,
        width: '100%',
    },
    modalContentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: screenWidth,
        height: screenHeight * 0.7,
    },
    altContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 12,
        borderRadius: 8,
    },
    altText: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default QuestionImage;
