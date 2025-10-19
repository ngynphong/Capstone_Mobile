import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Users, Calendar, MessageCircle, Plus, Settings, Crown } from 'lucide-react-native';
import { StudyGroup } from '../../types/communityTypes';
import { useScroll } from '../../context/ScrollContext';

interface StudyGroupDetailScreenProps {
  route: {
    params: {
      groupId: string;
    };
  };
  navigation: any;
}

const StudyGroupDetailScreen: React.FC<StudyGroupDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { groupId } = route.params;
  const { handleScroll } = useScroll();
  // Mock data - trong thực tế sẽ fetch từ API
  const [studyGroup] = useState<StudyGroup>({
    id: groupId,
    name: 'AP Calculus Study Squad',
    description: 'A dedicated group for AP Calculus students to share knowledge, solve problems together, and prepare for exams. We meet regularly to discuss difficult concepts and work on practice problems.',
    subject: 'Mathematics',
    maxMembers: 15,
    currentMembers: 12,
    meetingSchedule: 'Every Tuesday and Thursday, 7-9 PM',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
    members: [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: 'https://placehold.co/40x40',
        role: 'admin',
        joinDate: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Mike Johnson',
        avatar: 'https://placehold.co/40x40',
        role: 'member',
        joinDate: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Emma Davis',
        avatar: 'https://placehold.co/40x40',
        role: 'member',
        joinDate: new Date().toISOString(),
      },
    ],
    isActive: true,
  });

  const groupPosts = [
    {
      id: '1',
      title: 'Integration by Parts - Practice Problems',
      author: 'Sarah Chen',
      content: 'Here are some challenging integration problems we should work on together...',
      timeAgo: '2h ago',
      likes: 8,
      comments: 5,
      avatar: 'https://placehold.co/32x32',
    },
    {
      id: '2',
      title: 'Study Session Tomorrow - Series Convergence',
      author: 'Mike Johnson',
      content: 'Reminder: We have a study session tomorrow focusing on series convergence tests...',
      timeAgo: '1d ago',
      likes: 12,
      comments: 3,
      avatar: 'https://placehold.co/32x32',
    },
  ];



  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={handleScroll} // scroll behavior 
        scrollEventThrottle={16} // scroll behavior 
      >
        {/* Header */}
        <View className="bg-backgroundColor px-4 py-12 rounded-br-xl rounded-bl-xl">
          <View className="flex-row items-center gap-3 mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">{studyGroup.name}</Text>
          </View>

          <View className="flex-row items-center gap-2 mb-2">
            <Users size={16} color="white" />
            <TouchableOpacity onPress={() => navigation.navigate('Members', {
              groupId: studyGroup.id,
              members: studyGroup.members
            })}>
              <Text className="text-white text-sm opacity-90">
                {studyGroup.currentMembers}/{studyGroup.maxMembers} members
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-2">
            <Calendar size={16} color="white" />
            <Text className="text-white text-sm opacity-90">{studyGroup.subject}</Text>
          </View>
        </View>
        {/* Group Info */}
        <View className="px-4 -mt-6">
          <View className="bg-white rounded-t-3xl rounded-b-xl p-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-2">About This Group</Text>
            <Text className="text-sm text-gray-600 mb-4 leading-5">{studyGroup.description}</Text>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Calendar size={16} color="#3CBCB2" />
                <Text className="text-sm font-medium text-gray-700">Meeting Schedule</Text>
              </View>
            </View>
            <Text className="text-sm text-gray-600 mb-4">{studyGroup.meetingSchedule}</Text>

            <TouchableOpacity className="flex-row items-center gap-2 mb-4">
              <Settings size={16} color="#666" />
              <Text className="text-sm text-gray-600">Group Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Group Posts */}
        <View className="px-4 mt-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-800">Group Posts</Text>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Plus size={16} color="#3CBCB2" />
              <Text className="text-sm font-medium text-backgroundColor">Add Post</Text>
            </TouchableOpacity>
          </View>

          {groupPosts.length > 0 ? (
            <ScrollView showsVerticalScrollIndicator={false} className="">
              {groupPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  className="bg-white rounded-xl p-4 mb-3 shadow-sm"
                  onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                >
                  <View className="flex-row items-center gap-2 mb-2">
                    <Image source={{ uri: post.avatar }} className="w-8 h-8 rounded-full" />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800">{post.author}</Text>
                      <Text className="text-xs text-gray-500">{post.timeAgo}</Text>
                    </View>
                  </View>
                  <Text className="text-base font-medium text-gray-800 mb-2">{post.title}</Text>
                  <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>{post.content}</Text>
                  <View className="flex-row gap-4">
                    <TouchableOpacity className="flex-row items-center gap-1">
                      <MessageCircle size={16} color="#666" />
                      <Text className="text-xs text-gray-500">{post.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center gap-1">
                      <MessageCircle size={16} color="#666" />
                      <Text className="text-xs text-gray-500">{post.comments}</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="bg-white rounded-xl p-8 items-center">
              <MessageCircle size={48} color="#ccc" />
              <Text className="text-gray-500 mt-2">No posts yet</Text>
              <Text className="text-gray-400 text-sm">Be the first to share something!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StudyGroupDetailScreen;
