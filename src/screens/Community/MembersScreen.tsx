import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { ArrowLeft, Crown, UserPlus, Settings, MessageCircle } from 'lucide-react-native';
import { StudyGroupMember } from '../../types/communityTypes';

interface MembersScreenProps {
  route: {
    params: {
      groupId: string;
      members: StudyGroupMember[];
    };
  };
  navigation: any;
}

const MembersScreen: React.FC<MembersScreenProps> = ({
  route,
  navigation,
}) => {
  const { groupId, members } = route.params;

  const renderMember = ({ item }: { item: StudyGroupMember }) => (
    <TouchableOpacity className="flex-row items-center gap-4 p-4 bg-white rounded-xl mb-3">
      <View className="relative">
        <Image source={{ uri: item.avatar }} className="w-16 h-16 rounded-full" />
        {item.role === 'admin' && (
          <View className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full items-center justify-center">
            <Crown size={12} color="white" />
          </View>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800 mb-1">{item.name}</Text>
        <Text className="text-sm text-gray-500 capitalize mb-2">{item.role}</Text>
        <Text className="text-xs text-gray-400">
          Joined {new Date(item.joinDate).toLocaleDateString()}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <MessageCircle size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
          <Settings size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 py-12 border-b border-gray-200">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <ArrowLeft size={20} color="#666" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Members</Text>
        </View>
      </View>

      {/* Members List */}
      <View className="px-4 mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-800">
            {members.length} Members
          </Text>
          <TouchableOpacity className="flex-row items-center gap-2 bg-backgroundColor px-4 py-2 rounded-full">
            <UserPlus size={16} color="white" />
            <Text className="text-sm font-medium text-white">Invite</Text>
          </TouchableOpacity>
        </View>

        {members.length > 0 ? (
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="bg-white rounded-xl p-12 items-center">
            <Crown size={64} color="#ccc" />
            <Text className="text-gray-500 mt-4 text-lg">No members yet</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Invite friends to join this study group
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MembersScreen;
