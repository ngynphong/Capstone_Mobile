import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ArrowLeft, Heart, MessageCircle, Share, MoreVertical, Flag } from 'lucide-react-native';
import { Post, Comment } from '../../types/communityTypes';
import { useScroll } from '../../context/ScrollContext';

interface PostDetailScreenProps {
  route: {
    params: {
      postId: string;
    };
  };
  navigation: any;
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { postId } = route.params;
  const { handleScroll } = useScroll();
  // Mock data - trong thực tế sẽ fetch từ API
  const [post] = useState<Post>({
    id: postId,
    title: 'Tips for Calculus BC Integration',
    content: `Integration by parts is one of the most important techniques in calculus. Here are some key tips to master it:

1. **Identify u and dv correctly**: Remember LIATE (Logarithmic, Inverse trigonometric, Algebraic, Trigonometric, Exponential)

2. **Tabular method for multiple applications**: When you have to apply integration by parts multiple times, the tabular method can save time.

3. **Cyclic integration**: Sometimes you need to apply integration by parts twice to get back to your original integral.

4. **Practice with definite integrals**: Don't forget to apply the limits after integration.

Here are some practice problems to try:
- ∫x²e^x dx
- ∫ln(x) dx
- ∫x²sin(x) dx

Feel free to share your solutions or ask questions in the comments!`,
    author: 'Sarah Chen',
    subject: 'Mathematics',
    timeAgo: '2h ago',
    likes: 24,
    comments: 8,
    avatar: 'https://placehold.co/48x48',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [comments] = useState<Comment[]>([
    {
      id: '1',
      postId: postId,
      author: 'Mike Johnson',
      content: 'Great tips! The tabular method really helped me with that last integral.',
      timeAgo: '1h ago',
      likes: 5,
      avatar: 'https://placehold.co/32x32',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      postId: postId,
      author: 'Emma Davis',
      content: 'Could you explain the LIATE rule in more detail? I always get confused about the order.',
      timeAgo: '45m ago',
      likes: 2,
      avatar: 'https://placehold.co/32x32',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      postId: postId,
      author: 'Alex Rodriguez',
      content: 'Thanks for sharing! I solved ∫x²e^x dx using tabular method and got (e^x)(x² - 2x + 2) + C',
      timeAgo: '30m ago',
      likes: 7,
      avatar: 'https://placehold.co/32x32',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ]);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };



  return (
    <ScrollView
      showsVerticalScrollIndicator={false}     
      onScroll={handleScroll} // scroll behavior
      scrollEventThrottle={16} // scroll behavior
      className="flex-1 bg-gray-100"
    >
      {/* Header */}
      <View className="bg-white px-4 py-10 border-b border-gray-200">
        <View className="flex-row items-center mt-3 gap-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <ArrowLeft size={20} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Post</Text>
        </View>
      </View>

      {/* Post Content */}
      <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
        {/* Author Info */}
        <View className="flex-row items-center gap-3 mb-3">
          <Image source={{ uri: post.avatar }} className="w-12 h-12 rounded-full" />
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800">{post.author}</Text>
            <Text className="text-sm text-gray-500">{post.subject} • {post.timeAgo}</Text>
          </View>
          <TouchableOpacity className="w-8 h-8 rounded-full items-center justify-center">
            <MoreVertical size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Post Title */}
        <Text className="text-xl font-bold text-gray-800 mb-3">{post.title}</Text>

        {/* Post Content */}
        <Text className="text-base text-gray-700 leading-6 mb-4">{post.content}</Text>

        {/* Tags/Subjects */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className="bg-backgroundColor/10 px-3 py-1 rounded-full">
            <Text className="text-sm font-medium text-backgroundColor">{post.subject}</Text>
          </View>
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-sm text-gray-600">AP Calculus BC</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={handleLike}
          >
            <Heart
              size={20}
              color={isLiked ? '#EF4444' : '#666'}
              fill={isLiked ? '#EF4444' : 'none'}
            />
            <Text className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
              {likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-2">
            <MessageCircle size={20} color="#666" />
            <Text className="text-sm font-medium text-gray-600">{comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-2">
            <Share size={20} color="#666" />
            <Text className="text-sm font-medium text-gray-600">Share</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-2">
            <Flag size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Section */}
      <View className="px-4 mt-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Comments ({comments.length})</Text>

        {comments.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false} className="">
            {comments.map((comment) => (
              <View key={comment.id} className="bg-gray-50 rounded-xl p-4 mb-3">
                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      source={{ uri: comment.avatar || 'https://placehold.co/32x32' }}
                      className="w-full h-full"
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-sm font-semibold text-gray-800">{comment.author}</Text>
                      <Text className="text-xs text-gray-500">{comment.timeAgo}</Text>
                    </View>
                    <Text className="text-sm text-gray-700 mb-2">{comment.content}</Text>
                    <TouchableOpacity className="flex-row items-center gap-1 self-start">
                      <Heart size={14} color="#666" />
                      <Text className="text-xs text-gray-500">{comment.likes}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className="bg-white rounded-xl p-8 items-center">
            <MessageCircle size={48} color="#ccc" />
            <Text className="text-gray-500 mt-2">No comments yet</Text>
            <Text className="text-gray-400 text-sm">Be the first to comment!</Text>
          </View>
        )}
      </View>

      {/* Bottom spacing */}
      <View className="h-24" />
    </ScrollView>
  );
};

export default PostDetailScreen;
