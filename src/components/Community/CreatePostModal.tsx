import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Image, Send } from 'lucide-react-native';
import { CreatePostRequest } from '../../types/communityTypes';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: CreatePostRequest) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English Literature',
  ];

  const handleSubmit = () => {
    if (!title.trim() || !content.trim() || !selectedSubject) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      subject: selectedSubject,
    });

    // Reset form
    setTitle('');
    setContent('');
    setSelectedSubject('');
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
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="What would you like to discuss?"
              value={title}
              onChangeText={setTitle}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Subject Selection */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Subject</Text>
            <View className="flex-row flex-wrap gap-2">
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  onPress={() => setSelectedSubject(subject)}
                  className={`px-3 py-2 rounded-full border ${
                    selectedSubject === subject
                      ? 'bg-backgroundColor border-backgroundColor'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedSubject === subject ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content Input */}
          <View className="mt-4 mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Content</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="Share your thoughts, questions, or helpful information..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          {/* Media Attachment */}
          <TouchableOpacity className="flex-row items-center gap-2 mb-4">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <Image size={20} color="#666" />
            </View>
            <Text className="text-sm text-gray-600">Add image or file</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default CreatePostModal;
