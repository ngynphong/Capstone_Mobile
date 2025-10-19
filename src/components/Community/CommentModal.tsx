import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { X, Send, Heart, MessageCircle, TrendingUp } from 'lucide-react-native';
import { Comment } from '../../types/communityTypes';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  postTitle: string;
  postAuthor: string;
  initialComments?: Comment[];
}

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  postTitle,
  postAuthor,
  initialComments = [],
}) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');

  const sampleComments: Comment[] = [
    {
      id: '1',
      postId: '1',
      author: 'Sarah Chen',
      content: 'This is really helpful! I was struggling with this exact topic in Calculus BC.',
      timeAgo: '2h ago',
      likes: 5,
      avatar: 'https://placehold.co/32x32',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      postId: '1',
      author: 'Mike Johnson',
      content: 'Great explanation! Could you also share some practice problems?',
      timeAgo: '1h ago',
      likes: 3,
      avatar: 'https://placehold.co/32x32',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      postId: '1',
      author: 'Emma Davis',
      content: 'Thanks for sharing this! I\'ll definitely use this approach in my next assignment.',
      timeAgo: '45m ago',
      likes: 7,
      avatar: 'https://placehold.co/32x32',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ];

  const displayComments = comments.length > 0 ? comments : sampleComments;

  const handleAddComment = () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      postId: '1', // TODO: Get from props
      author: 'You',
      content: newComment.trim(),
      timeAgo: 'now',
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View className="bg-gray-50 rounded-xl p-3 mt-3">
      <View className="flex-row items-start gap-2">
        <View className="w-8 h-8 rounded-full overflow-hidden">
          <Image
            source={{ uri: item.avatar || 'https://placehold.co/32x32' }}
            className="w-full h-full"
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-sm font-semibold text-gray-800">{item.author}</Text>
            <Text className="text-xs text-gray-500">{item.timeAgo}</Text>
          </View>
          <Text className="text-sm text-gray-700 mb-2">{item.content}</Text>
          <TouchableOpacity
            onPress={() => handleLikeComment(item.id)}
            className="flex-row items-center gap-1 self-start"
          >
            <Heart size={14} color="#666" />
            <Text className="text-xs text-gray-500">{item.likes}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
          <Text className="text-lg font-semibold text-gray-800">Comments</Text>
          <View className="w-6" />
        </View>

        {/* Post Info */}
        <View className="px-4 py-3 bg-gray-50">
          <Text className="text-sm font-semibold text-gray-800 mb-1">{postAuthor}</Text>
          <Text className="text-sm text-gray-600">{postTitle}</Text>
        </View>

        {/* Comments List */}
        <FlatList
          data={displayComments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-8">
              <MessageCircle size={48} color="#ccc" />
              <Text className="text-gray-500 mt-2">No comments yet</Text>
              <Text className="text-gray-400 text-sm">Be the first to comment!</Text>
            </View>
          }
        />

        {/* Comment Input */}
        <View className="px-4 py-3 border-t border-gray-200">
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-base text-gray-800 max-h-20"
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              onPress={handleAddComment}
              className="w-10 h-10 rounded-full bg-backgroundColor items-center justify-center"
            >
              <Send size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CommentModal;
