import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import CreatePostModal from '../../components/Community/CreatePostModal';
import CommentModal from '../../components/Community/CommentModal';
import PostCard from '../../components/Community/PostCard';
import usePost from '../../hooks/usePost';
import useCommunity from '../../hooks/useCommunity';
import type { Post } from '../../types/communityTypes';

interface CommunityScreenProps {
  navigation: any;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const {
    posts,
    votePost,
    fetchPostComments,
    fetchAllPosts,
    fetchMyPosts,
    isLoading: isPostLoading,
    error: postError,
  } = usePost();
  
  const {
    communities,
    fetchCommunities,
    fetchCommunityPosts,
    isLoading: isCommunityLoading,
    error: communityError,
  } = useCommunity();

  // Modal states
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [allPostsFromCommunities, setAllPostsFromCommunities] = useState<Post[]>([]);

  // Format time ago helper
  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return '';
    
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    } else {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} tuần trước`;
    }
  };

  // Format posts with timeAgo if missing
  const formattedPosts = [...posts, ...allPostsFromCommunities].map(post => ({
    ...post,
    timeAgo: post.timeAgo || formatTimeAgo(post.createdAt),
  }));

  // Remove duplicates based on post id
  const uniquePosts = formattedPosts.filter((post, index, self) =>
    index === self.findIndex((p) => p.id === post.id)
  );

  // Sort by createdAt (newest first)
  const sortedPosts = uniquePosts.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  // Fetch posts on mount
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // Fetch communities first
      const communitiesList = await fetchCommunities({
        pageNo: 0,
        pageSize: 10,
      });

      // Fetch posts from each community
      const postsPromises = communitiesList.map((community) =>
        fetchCommunityPosts(community.id, {
          page: 1,
          size: 20,
        }).catch((err) => {
          console.warn(`Error fetching posts from community ${community.id}:`, err);
          return [];
        })
      );

      const allPostsArrays = await Promise.all(postsPromises);
      const mergedPosts = allPostsArrays.flat();
      setAllPostsFromCommunities(mergedPosts);

      // Also fetch user's own posts
      try {
        await fetchMyPosts({
          pageNo: 0,
          pageSize: 20,
        });
      } catch (err) {
        console.warn('Error fetching my posts:', err);
      }
    } catch (error: any) {
      console.error('Error loading posts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch communities first
      const communitiesList = await fetchCommunities({
        pageNo: 0,
        pageSize: 10,
      });

      // Fetch posts from each community
      const postsPromises = communitiesList.map((community) =>
        fetchCommunityPosts(community.id, {
          page: 1,
          size: 20,
        }).catch((err) => {
          console.warn(`Error fetching posts from community ${community.id}:`, err);
          return [];
        })
      );

      const allPostsArrays = await Promise.all(postsPromises);
      const mergedPosts = allPostsArrays.flat();
      setAllPostsFromCommunities(mergedPosts);

      // Also fetch user's own posts
      try {
        await fetchMyPosts({
          pageNo: 0,
          pageSize: 20,
        });
      } catch (err) {
        console.warn('Error fetching my posts:', err);
      }
    } catch (error: any) {
      console.error('Error refreshing posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreatePost = (postData: {
    title: string;
    content: string;
    subject: string;
  }) => {
    console.log('Creating post:', postData);
    // TODO: Implement API call to create post
    setCreatePostModalVisible(false);
  };

  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handleLike = async (postId: string) => {
    try {
      await votePost(postId, { voteType: 'UP' });
    } catch (error) {
      console.error('Error voting post:', error);
    }
  };

  const handleShare = (post: Post) => {
    console.log('Sharing post:', post.id);
    // TODO: Implement share functionality
  };

  const handleBookmark = (postId: string) => {
    console.log('Bookmarking post:', postId);
    // TODO: Implement bookmark functionality
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Create Post Input Bar */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#F3F4F6',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
              borderRadius: 24,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Image
              source={{
                uri:
                  user?.avatar ||
                  user?.imgUrl ||
                  'https://placehold.co/40x40',
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                marginRight: 12,
              }}
            />
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setCreatePostModalVisible(true)}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: '#9CA3AF',
                }}
              >
                Bạn đang nghĩ gì?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCreatePostModalVisible(true)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} color="#3CBCB2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error State */}
        {postError && (
          <View
            style={{
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: '#EF4444',
                textAlign: 'center',
              }}
            >
              {postError}
            </Text>
          </View>
        )}

        {/* Posts Feed */}
        {(isPostLoading || isCommunityLoading) && !refreshing ? (
          <View
            style={{
              padding: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" color="#3CBCB2" />
          </View>
        ) : (
          <View>
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleOpenComments}
                onShare={handleShare}
                onBookmark={handleBookmark}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {!isPostLoading && !isCommunityLoading && sortedPosts.length === 0 && !postError && !communityError && (
          <View
            style={{
              padding: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: '#9CA3AF',
                textAlign: 'center',
              }}
            >
              Chưa có bài viết nào.{'\n'}Hãy là người đầu tiên chia sẻ!
            </Text>
          </View>
        )}
      </ScrollView>

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
        postTitle={selectedPost?.title || selectedPost?.content || ''}
        postAuthor={selectedPost?.author || ''}
      />
    </View>
  );
};

export default CommunityScreen;
