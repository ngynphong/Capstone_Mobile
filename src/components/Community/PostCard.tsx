import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, TouchableWithoutFeedback } from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Trash2, Pin } from 'lucide-react-native';
import type { Post } from '../../types/communityTypes';
import { useTimeAgo } from '../../hooks/useTimeAgo';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (post: Post) => void;
  onShare?: (post: Post) => void;
  onBookmark?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  isOwner?: boolean; // Kiểm tra xem user có phải là chủ sở hữu post không
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onDelete,
  isOwner = false,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleDelete = () => {
    setShowMenu(false);
    
    if (!onDelete) return;
    
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(post.id);
          },
        },
      ]
    );
  };
  // Extract hashtags from content
  const extractHashtags = (text: string) => {
    if (!text || typeof text !== 'string') return [];
    const hashtagRegex = /#\w+/g;
    return text.match(hashtagRegex) || [];
  };

  const postContent = typeof post.content === 'string' ? post.content : '';
  const hashtags = extractHashtags(postContent);
  const contentWithoutHashtags = postContent.replace(/#\w+/g, '').trim();

  // Real-time time ago
  const timeAgo = useTimeAgo(post.createdAt);

  // Get safe numeric value
  const getSafeNumber = (value: number | undefined | null, defaultValue: number = 0) => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    return defaultValue;
  };

  // Get username from author or generate from id
  const getUsername = () => {
    // If userId exists and looks like a username, use it directly
    if (post.userId && typeof post.userId === 'string' && !post.userId.includes('@')) {
      return `@${post.userId}`;
    }
    // Generate username from author name (Vietnamese name format)
    // Ensure author is a string
    let authorName = 'User';
    if (typeof post.author === 'string') {
      authorName = post.author;
    } else if (post.author && typeof post.author === 'object') {
      // If author is an object, try to get name property
      authorName = (post.author as any).name || (post.author as any).firstName || 'User';
    }
    
    // Convert Vietnamese name to username format (e.g., "Lê Hoàng Nam" -> "@nam_le_99")
    const parts = authorName.toLowerCase().split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1]; // Last name
      const firstPart = parts[0]; // First name
      return `@${lastPart}_${firstPart.slice(0, 2)}_99`;
    }
    const username = authorName.toLowerCase().replace(/\s+/g, '_');
    return `@${username}`;
  };

  // Get author display name safely
  const getAuthorName = () => {
    if (typeof post.author === 'string') {
      return post.author;
    }
    if (post.author && typeof post.author === 'object') {
      const authorObj = post.author as any;
      if (authorObj.name) return authorObj.name;
      if (authorObj.firstName && authorObj.lastName) {
        return `${authorObj.firstName} ${authorObj.lastName}`;
      }
      if (authorObj.firstName) return authorObj.firstName;
      if (authorObj.username) return authorObj.username;
    }
    return 'User';
  };

  // Avatar mặc định chung cho tất cả user chưa có avatar
  const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=3CBCB2&color=fff&size=128&bold=true&format=png';

  // Get author avatar safely
  const getAuthorAvatar = () => {
    // Nếu có avatar trực tiếp trong post và không phải placeholder
    if (post.avatar && 
        !post.avatar.includes('placehold') && 
        !post.avatar.includes('40x40') &&
        post.avatar.trim() !== '') {
      return post.avatar;
    }
    
    // Nếu author là object, lấy avatar từ author
    if (post.author && typeof post.author === 'object') {
      const authorObj = post.author as any;
      const avatar = authorObj.avatar || authorObj.imgUrl;
      if (avatar && 
          !avatar.includes('placehold') && 
          !avatar.includes('40x40') &&
          avatar.trim() !== '') {
        return avatar;
      }
      // Nếu không có avatar hợp lệ, dùng avatar mặc định chung
      return DEFAULT_AVATAR;
    }
    
    // Nếu author là string và không có avatar, dùng avatar mặc định chung
    // Nếu có avatar trong post nhưng là placeholder, dùng avatar mặc định
    return DEFAULT_AVATAR;
  };

  return (
    <View style={[styles.container, post.isPinned && styles.pinnedContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri: getAuthorAvatar(),
            }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{getAuthorName()}</Text>
              {post.isPinned && (
                <Pin size={14} color="#3CBCB2" fill="#3CBCB2" style={styles.pinIcon} />
              )}
            </View>
            <Text style={styles.username}>{getUsername()}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
          {isOwner && (
            <TouchableOpacity
              onPress={() => {
                setShowMenu(!showMenu);
              }}
              style={styles.menuButton}
            >
              <MoreVertical size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Menu Dropdown */}
      {showMenu && isOwner && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color="#EF4444" />
            <Text style={styles.menuItemTextDelete}>Delete Post</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.postText}>{contentWithoutHashtags}</Text>
        {hashtags.length > 0 && (
          <View style={styles.hashtags}>
            {hashtags.map((tag, index) => (
              <Text key={index} style={styles.hashtag}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Image if available */}
      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike?.(post.id)}
        >
          <Heart
            size={20}
            color={post.userVote === 'UP' ? '#EF4444' : '#666'}
            fill={post.userVote === 'UP' ? '#EF4444' : 'none'}
          />
          <Text style={styles.actionText}>
            {getSafeNumber(post.likes || post.voteCount)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment?.(post)}
        >
          <MessageCircle size={20} color="#666" />
          <Text style={styles.actionText}>{getSafeNumber(post.comments)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare?.(post)}
        >
          <Share2 size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.bookmarkButton]}
          onPress={() => onBookmark?.(post.id)}
        >
          <Bookmark size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pinnedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#3CBCB2',
    backgroundColor: '#F0FDFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  pinIcon: {
    marginLeft: 6,
  },
  username: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  menuButton: {
    padding: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuItemTextDelete: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  content: {
    marginBottom: 12,
  },
  postText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 8,
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  hashtag: {
    fontSize: 14,
    color: '#3CBCB2',
    fontWeight: '500',
    marginRight: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  bookmarkButton: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  actionText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
});

export default PostCard;

