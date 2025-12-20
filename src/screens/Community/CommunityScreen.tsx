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
import { Sparkles, Menu } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import CreatePostModal from '../../components/Community/CreatePostModal';
import CommentModal from '../../components/Community/CommentModal';
import PostCard from '../../components/Community/PostCard';
import CommunitySidebar from '../../components/Community/CommunitySidebar';
import usePost from '../../hooks/usePost';
import useCommunity from '../../hooks/useCommunity';
import type { Post, Community, PostAuthor } from '../../types/communityTypes';

interface CommunityScreenProps {
  navigation: any;
}

const CommunityScreen: React.FC<CommunityScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const {
    votePost,
    fetchPostComments,
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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

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

  // Extract author name from string | PostAuthor
  const getAuthorName = (author: string | PostAuthor): string => {
    if (typeof author === 'string') {
      return author;
    }
    if (typeof author === 'object' && author !== null) {
      return author.name || author.username || author.firstName || author.lastName || 
             `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Unknown';
    }
    return '';
  };

  // Normalize post data from API
  const normalizePost = (post: Post): Post => {
    // Nếu author là object và có avatar, map vào post.avatar
    if (post.author && typeof post.author === 'object') {
      const authorObj = post.author as any;
      return {
        ...post,
        avatar: post.avatar || authorObj.avatar || authorObj.imgUrl,
        timeAgo: post.timeAgo || formatTimeAgo(post.createdAt),
      };
    }
    return {
      ...post,
      timeAgo: post.timeAgo || formatTimeAgo(post.createdAt),
    };
  };

  // Format posts with timeAgo if missing
  const formattedPosts = allPostsFromCommunities.map(normalizePost);

  // Remove duplicates based on post id
  const uniquePosts = formattedPosts.filter((post, index, self) =>
    index === self.findIndex((p) => p.id === post.id)
  );

  // Filter posts by selected community
  const filteredPosts = selectedCommunityId
    ? uniquePosts.filter((post) => post.communityId === selectedCommunityId)
    : uniquePosts;

  // Sort by createdAt (newest first)
  const sortedPosts = filteredPosts.sort((a, b) => {
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
    } catch (error: any) {
      console.error('Error loading posts:', error);
    }
  };

  const loadPostsFromCommunity = async (communityId: string | null) => {
    setIsLoadingPosts(true);
    try {
      if (communityId === null) {
        // Load all posts from all communities
        await loadPosts();
      } else {
        // Load posts from specific community
        const posts = await fetchCommunityPosts(communityId, {
          page: 1,
          size: 20,
        });
        setAllPostsFromCommunities(posts);
      }
    } catch (error: any) {
      console.error('Error loading posts from community:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedCommunityId) {
        // Refresh posts from selected community
        await loadPostsFromCommunity(selectedCommunityId);
      } else {
        // Refresh all posts
        await loadPosts();
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

  // Get selected community name
  const selectedCommunity = selectedCommunityId
    ? communities.find((c) => c.id === selectedCommunityId)
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header with Menu Icon */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 50,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          style={{
            padding: 8,
            marginRight: 12,
          }}
        >
          <Menu size={24} color="#111827" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#111827',
          }}
        >
          {selectedCommunity ? selectedCommunity.name : 'Community'}
        </Text>
      </View>

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
        {communityError && (
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
              {communityError}
            </Text>
          </View>
        )}

        {/* Posts Feed */}
        {(isCommunityLoading || isLoadingPosts) && !refreshing ? (
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
        {!isCommunityLoading && !isLoadingPosts && sortedPosts.length === 0 && !communityError && (
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
              {selectedCommunityId 
                ? "No posts yet in this community.\nBe the first to share!"
                : "No posts yet.\nBe the first to share!"}
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
        postAuthor={selectedPost ? getAuthorName(selectedPost.author) : ''}
      />

      <CommunitySidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        communities={communities}
        onCommunityPress={(community) => {
          if (community === null) {
            // Show all posts
            setSelectedCommunityId(null);
            loadPostsFromCommunity(null);
          } else {
            // Show posts from selected community
            setSelectedCommunityId(community.id);
            loadPostsFromCommunity(community.id);
          }
          setSidebarVisible(false);
        }}
      />
    </View>
  );
};

export default CommunityScreen;
