import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image as RNImage,
  StyleSheet,
} from 'react-native';
import { X, Image, Send, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CreatePostRequest } from '../../types/communityTypes';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: CreatePostRequest & { image?: any }) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setTitle('');
      setContent('');
      setSelectedImage(null);
    }
  }, [visible]);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to select an image');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    const imageData = selectedImage
      ? {
          uri: selectedImage,
          type: 'image/jpeg',
          name: `image_${Date.now()}.jpg`,
        }
      : undefined;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      subject: '',
      image: imageData,
    });

    // Form will be reset by useEffect when modal closes
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Create Post</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Send size={20} color="#3CBCB2" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What would you like to discuss?"
              value={title}
              onChangeText={setTitle}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Content Input */}
          <View className="mt-4 mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Content</Text>
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Share your thoughts, questions, or helpful information..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          {/* Media Attachment */}
          {selectedImage ? (
            <View className="mt-4 mb-4 relative">
              <RNImage
                source={{ uri: selectedImage }}
                className="w-full h-48 rounded-xl"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={handleRemoveImage}
                className="absolute top-2 right-2 bg-white rounded-full p-1"
              >
                <XCircle size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePickImage}
              className="flex-row items-center gap-2 mb-4"
            >
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                <Image size={20} color="#666" />
              </View>
              <Text className="text-sm text-gray-600">Add image or file</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  contentInput: {
    minHeight: 120,
  },
});

export default CreatePostModal;
