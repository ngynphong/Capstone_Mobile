import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, Plus, MessageCircle, TrendingUp } from 'lucide-react-native';
import CreatePostModal from '../../components/Community/CreatePostModal';
import CommentModal from '../../components/Community/CommentModal';
import CreateStudyGroupModal from '../../components/Community/CreateStudyGroupModal';

interface CommunityScreenProps {
  navigation: any;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const { user } = useAuth();

  // Modal states
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [createStudyGroupModalVisible, setCreateStudyGroupModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Handlers
  const handleCreatePost = (postData: { title: string; content: string; subject: string }) => {
    console.log('Creating post:', postData);
    // TODO: Implement API call to create post
  };

  const handleCreateStudyGroup = (groupData: {
    name: string;
    subject: string;
    description: string;
    maxMembers: number;
    meetingSchedule: string;
  }) => {
    console.log('Creating study group:', groupData);
    // TODO: Implement API call to create study group
  };

  const handleOpenComments = (post: any) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handleCategoryPress = (category: any) => {
    console.log('Opening category:', category.name);
    // TODO: Navigate to category posts screen
  };

  const handlePostPress = (post: any) => {
    console.log('Opening post:', post.title);
    // TODO: Navigate to post detail screen
  };

  const handleStudyGroupPress = (group: any) => {
    navigation.navigate('StudyGroupDetail', { groupId: group.id });
  };

  const forumCategories = [
    { id: 1, name: 'Mathematics', postCount: 156, color: '#3CBCB2' },
    { id: 2, name: 'Physics', postCount: 89, color: '#3CBCB2' },
    { id: 3, name: 'Chemistry', postCount: 124, color: '#3CBCB2' },
    { id: 4, name: 'Biology', postCount: 97, color: '#3CBCB2' },
    { id: 5, name: 'Computer Science', postCount: 203, color: '#3CBCB2' },
    { id: 6, name: 'English Literature', postCount: 78, color: '#3CBCB2' },
  ];

  const recentPosts = [
    {
      id: 1,
      title: 'Tips for Calculus BC Integration',
      author: 'Sarah Chen',
      subject: 'Mathematics',
      timeAgo: '2h ago',
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      title: 'Physics Lab Report Help',
      author: 'Mike Johnson',
      subject: 'Physics',
      timeAgo: '4h ago',
      likes: 15,
      comments: 12,
    },
    {
      id: 3,
      title: 'Study Group for Chemistry Final',
      author: 'Emma Davis',
      subject: 'Chemistry',
      timeAgo: '6h ago',
      likes: 31,
      comments: 5,
    },
  ];

  const studyGroups = [
    {
      id: 1,
      name: 'AP Calculus Study Squad',
      members: 12,
      subject: 'Mathematics',
      nextMeeting: 'Tomorrow 3PM',
    },
    {
      id: 2,
      name: 'Physics Problem Solvers',
      members: 8,
      subject: 'Physics',
      nextMeeting: 'Friday 7PM',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Hero Section */}
      <View className="bg-backgroundColor px-4 pt-16 pb-8 rounded-b-2xl">
        <View className="flex-row justify-between items-center mb-5">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
              <Image
                source={{
                  uri: user?.avatar || user?.imgUrl || "https://placehold.co/50x50"
                }}
                className="w-full h-full"
              />
            </View>
            <View className="gap-1">
              <Text className="text-white text-xs font-normal opacity-90">Welcome back</Text>
              <Text className="text-white text-base font-semibold">
                {user ? `${user.firstName} ${user.lastName}` : 'Student'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white/20 items-center justify-center"
            onPress={() => setCreatePostModalVisible(true)}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-white text-2xl font-bold mb-1">Community Hub</Text>
        <Text className="text-white text-sm opacity-90">Connect, Learn, and Grow Together</Text>
      </View>

      {/* Forum Categories */}
      <View className="px-4 mt-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-800">Forum Categories</Text>
          <TouchableOpacity onPress={() => console.log('View all categories')}>
            <Text className="text-sm font-medium text-backgroundColor">View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {forumCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className="bg-white rounded-xl p-4 mr-3 items-center min-w-28 shadow-sm"
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <BookOpen size={24} color={category.color} />
              </View>
              <Text className="text-sm font-semibold text-gray-800 mb-1">{category.name}</Text>
              <Text className="text-xs text-gray-500">{category.postCount} posts</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Posts */}
      <View className="px-4 mt-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-800">Recent Posts</Text>
          <TouchableOpacity>
            <Text className="text-sm font-medium text-backgroundColor">View All</Text>
          </TouchableOpacity>
        </View>

        {recentPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm"
          >
            <View className="mb-2">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    source={{ uri: "https://placehold.co/32x32" }}
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-800">{post.author}</Text>
                  <Text className="text-xs text-gray-500">{post.subject} • {post.timeAgo}</Text>
                </View>
              </View>
            </View>
            <Text className="text-base font-medium text-gray-800 mb-3">{post.title}</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity className="flex-row items-center gap-1">
                <TrendingUp size={16} color="#666" />
                <Text className="text-xs text-gray-500">{post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={() => handleOpenComments(post)}
              >
                <MessageCircle size={16} color="#666" />
                <Text className="text-xs text-gray-500">{post.comments}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Study Groups */}
      <View className="px-4 mt-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-800">Study Groups</Text>
          <TouchableOpacity onPress={() => setCreateStudyGroupModalVisible(true)}>
            <Text className="text-sm font-medium text-backgroundColor">Create New</Text>
          </TouchableOpacity>
        </View>

        {studyGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
            onPress={() => handleStudyGroupPress(group)}
          >
            <View className="w-12 h-12 rounded-full bg-backgroundColor/20 items-center justify-center mr-3">
              <Users size={20} color="#3CBCB2" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800 mb-1">{group.name}</Text>
              <Text className="text-sm text-gray-500 mb-1">{group.members} members • {group.subject}</Text>
              <Text className="text-xs font-medium text-backgroundColor">Next meeting: {group.nextMeeting}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View className="h-24" />

      {/* Modals */}
      <CreatePostModal
        visible={createPostModalVisible}
        onClose={() => setCreatePostModalVisible(false)}
        onSubmit={handleCreatePost}
      />

      <CommentModal
        visible={commentModalVisible}
        onClose={() => {
          setCommentModalVisible(false);
          setSelectedPost(null);
        }}
        postTitle={selectedPost?.title || ''}
        postAuthor={selectedPost?.author || ''}
      />

      <CreateStudyGroupModal
        visible={createStudyGroupModalVisible}
        onClose={() => setCreateStudyGroupModalVisible(false)}
        onSubmit={handleCreateStudyGroup}
      />
    </ScrollView>
  );
};

export default CommunityScreen;
