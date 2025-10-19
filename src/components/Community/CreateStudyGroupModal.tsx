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
import { X, Users, Calendar, Clock } from 'lucide-react-native';
import { CreateStudyGroupRequest } from '../../types/communityTypes';

interface CreateStudyGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (groupData: CreateStudyGroupRequest) => void;
}

const CreateStudyGroupModal: React.FC<CreateStudyGroupModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState('10');
  const [meetingSchedule, setMeetingSchedule] = useState('');

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English Literature',
  ];

  const handleSubmit = () => {
    if (!name.trim() || !selectedSubject || !description.trim() || !meetingSchedule.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const membersNum = parseInt(maxMembers);
    if (isNaN(membersNum) || membersNum < 2 || membersNum > 50) {
      Alert.alert('Error', 'Maximum members must be between 2 and 50');
      return;
    }

    onSubmit({
      name: name.trim(),
      subject: selectedSubject,
      description: description.trim(),
      maxMembers: membersNum,
      meetingSchedule: meetingSchedule.trim(),
    });

    // Reset form
    setName('');
    setSelectedSubject('');
    setDescription('');
    setMaxMembers('10');
    setMeetingSchedule('');
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
          <Text className="text-lg font-semibold text-gray-800">Create Study Group</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text className="text-backgroundColor font-semibold">Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {/* Group Name */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Group Name *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="e.g., AP Calculus Study Squad"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Subject Selection */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Subject *</Text>
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

          {/* Description */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Description *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="Describe your study group goals, topics, and what members can expect..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Max Members */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Maximum Members</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="10"
              value={maxMembers}
              onChangeText={setMaxMembers}
              keyboardType="numeric"
            />
            <Text className="text-xs text-gray-500 mt-1">Between 2 and 50 members</Text>
          </View>

          {/* Meeting Schedule */}
          <View className="mt-4 mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">Meeting Schedule *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="e.g., Every Tuesday and Thursday, 7-9 PM"
              value={meetingSchedule}
              onChangeText={setMeetingSchedule}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          {/* Study Group Tips */}
          <View className="bg-blue-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Users size={16} color="#3B82F6" />
              <Text className="text-sm font-semibold text-blue-800">Tips for Success</Text>
            </View>
            <Text className="text-xs text-blue-700 mb-1">
              • Set clear goals and expectations for group members
            </Text>
            <Text className="text-xs text-blue-700 mb-1">
              • Establish regular meeting times that work for everyone
            </Text>
            <Text className="text-xs text-blue-700">
              • Encourage active participation and mutual support
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default CreateStudyGroupModal;
