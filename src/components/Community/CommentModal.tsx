import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Send, Heart, MessageCircle, Image as ImageIcon, XCircle, MoreVertical, Trash2, Edit2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CommentDetail } from '../../types/communityTypes';
import { useComment } from '../../hooks/useComment';
import { useTimeAgo } from '../../hooks/useTimeAgo';
import { useAuth } from '../../context/AuthContext';
import EditCommentModal from './EditCommentModal';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  postAuthor: string;
  onCommentAdded?: () => void; // Callback khi comment được thêm thành công
}

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  postId,
  postTitle,
  postAuthor,
  onCommentAdded,
}) => {
  const { user } = useAuth();
  const { comments, isLoading, fetchPostComments, createComment, deleteComment, updateComment } = useComment();
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);

  useEffect(() => {
    if (visible && postId) {
      // Fetch comments khi modal mở
      fetchPostComments(postId, { page: 1, size: 50 }).catch(() => {
        // Error handled in hook
      });
    }
    // Reset form khi đóng modal
    if (!visible) {
      setNewComment('');
      setSelectedImage(null);
      setEditingComment(null);
      setShowMenuId(null);
    }
  }, [visible, postId, fetchPostComments]);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() && !selectedImage) {
      Alert.alert('Error', 'Please enter a comment or select an image');
      return;
    }

    try {
      const imageData = selectedImage
        ? {
            uri: selectedImage,
            type: 'image/jpeg',
            name: `comment_image_${Date.now()}.jpg`,
          }
        : undefined;

      await createComment(postId, {
        content: newComment.trim() || '',
        postId: postId,
        image: imageData,
      });
      setNewComment('');
      setSelectedImage(null);
      // Gọi callback để cập nhật số comment
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || error?.message || 'Failed to create comment'
      );
    }
  };

  const getCommentAuthorName = (author: any): string => {
    if (typeof author === 'string') return author;
    if (author && typeof author === 'object') {
      // Ưu tiên name hoặc username
      if (author.name) return author.name;
      if (author.username) return author.username;
      
      // Combine firstName và lastName nếu có
      if (author.firstName || author.lastName) {
        const parts = [author.firstName, author.lastName].filter(Boolean);
        if (parts.length > 0) return parts.join(' ');
      }
      
      return 'Unknown';
    }
    return 'Unknown';
  };

  const getCommentAuthorAvatar = (author: any): string => {
    if (author && typeof author === 'object') {
      // Ưu tiên imgUrl, sau đó avatar
      return author.imgUrl || author.avatar || 'https://placehold.co/32x32';
    }
    return 'https://placehold.co/32x32';
  };

  const isCommentOwner = (comment: CommentDetail): boolean => {
    if (!user || !user.id) return false;
    const commentUserId = comment.userId || (comment.author as any)?.id;
    return commentUserId === user.id;
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(commentId);
              setShowMenuId(null);
              if (onCommentAdded) {
                onCommentAdded();
              }
            } catch (error: any) {
              Alert.alert(
                'Error',
                error?.response?.data?.message || error?.message || 'Failed to delete comment'
              );
            }
          },
        },
      ]
    );
  };

  const handleStartEdit = useCallback((comment: CommentDetail) => {
    setShowMenuId(null);
    
    // Normalize content - đảm bảo không phải JSON string
    let normalizedContent = comment.content || '';
    if (typeof normalizedContent === 'string' && normalizedContent.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(normalizedContent);
        normalizedContent = parsed.content || normalizedContent;
      } catch (e) {
        // Nếu không parse được, giữ nguyên
      }
    }
    
    setEditingComment({
      id: comment.id,
      content: normalizedContent
    });
  }, []);

  const handleSaveEdit = useCallback(async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, { content });
      // Refresh comments sau khi update
      await fetchPostComments(postId, { page: 1, size: 50 });
      if (onCommentAdded) {
        onCommentAdded();
      }
      setEditingComment(null);
    } catch (error: any) {
      throw error; // Let EditCommentModal handle the error
    }
  }, [updateComment, fetchPostComments, postId, onCommentAdded]);

  // Memoize các handlers để tránh re-render CommentItem
  const handleSetShowMenuId = useCallback((id: string | null) => {
    setShowMenuId(id);
  }, []);


  const CommentItem: React.FC<{ 
    comment: CommentDetail;
    showMenuId: string | null;
    onSetShowMenuId: (id: string | null) => void;
    onStartEdit: (comment: CommentDetail) => void;
    onDeleteComment: (commentId: string) => void;
  }> = React.memo(({ 
    comment,
    showMenuId,
    onSetShowMenuId,
    onStartEdit,
    onDeleteComment,
  }) => {
    const timeAgo = useTimeAgo(comment.createdAt);
    const authorName = getCommentAuthorName(comment.author);
    const authorAvatar = comment.avatar || getCommentAuthorAvatar(comment.author);
    const voteCount = comment.voteCount || 0;
    const commentImageUrl = (comment as any).imgUrl;
    const isOwner = isCommentOwner(comment);

    return (
      <View style={styles.commentContainer}>
        <View style={styles.commentHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: authorAvatar || 'https://placehold.co/32x32' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.commentContent}>
            <View style={styles.authorRow}>
              <Text style={styles.authorName}>{authorName}</Text>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
              {isOwner && (
                <TouchableOpacity
                  onPress={() => onSetShowMenuId(showMenuId === comment.id ? null : comment.id)}
                  style={styles.menuButton}
                >
                  <MoreVertical size={16} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            {showMenuId === comment.id && isOwner && (
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={(e) => {
                    e.stopPropagation();
                    onStartEdit(comment);
                  }}
                  activeOpacity={0.7}
                >
                  <Edit2 size={14} color="#3CBCB2" />
                  <Text style={styles.menuItemText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDeleteComment(comment.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#EF4444" />
                  <Text style={styles.menuItemTextDelete}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
            {comment.content && (
              <Text style={styles.commentText}>{comment.content}</Text>
            )}
            {commentImageUrl && (
              <View style={styles.commentImageContainer}>
                <Image
                  source={{ uri: commentImageUrl }}
                  style={styles.commentImage}
                  resizeMode="cover"
                />
              </View>
            )}
            <View style={styles.likeRow}>
              <Heart size={12} color="#666" fill="transparent" />
              <Text style={styles.likeCount}>{voteCount}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, (prevProps, nextProps) => {
    // Return true nếu props giống nhau (không cần re-render)
    return prevProps.comment.id === nextProps.comment.id &&
           prevProps.showMenuId === nextProps.showMenuId;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Post Info */}
        <View style={styles.postInfo}>
          <Text style={styles.postAuthor}>{postAuthor}</Text>
          <Text style={styles.postTitle}>{postTitle}</Text>
        </View>

        {/* Comments List */}
        {isLoading && comments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3CBCB2" />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={({ item }) => (
              <CommentItem 
                comment={item}
                showMenuId={showMenuId}
                onSetShowMenuId={handleSetShowMenuId}
                onStartEdit={handleStartEdit}
                onDeleteComment={handleDeleteComment}
              />
            )}
            keyExtractor={(item) => item.id}
            style={styles.commentsList}
            contentContainerStyle={styles.commentsListContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
            keyboardShouldPersistTaps="handled"
            extraData={showMenuId}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MessageCircle size={48} color="#ccc" />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to comment!</Text>
              </View>
            }
          />
        )}

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity
                onPress={handleRemoveImage}
                style={styles.removeImageButton}
              >
                <XCircle size={20} color="#EF4444" fill="white" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity
              onPress={handlePickImage}
              style={styles.imageButton}
            >
              <ImageIcon size={20} color="#3CBCB2" />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Write a comment..."
                placeholderTextColor="#9CA3AF"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              onPress={handleAddComment}
              style={styles.sendButton}
            >
              <Send size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Edit Comment Modal */}
      <EditCommentModal
        visible={editingComment !== null}
        commentId={editingComment?.id || ''}
        initialContent={editingComment?.content || ''}
        onClose={() => setEditingComment(null)}
        onSave={handleSaveEdit}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 24,
  },
  postInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 14,
    color: '#4B5563',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    color: '#6B7280',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3CBCB2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  commentContent: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  timeAgo: {
    fontSize: 11,
    color: '#6B7280',
  },
  commentText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 18,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
  },
  likeCount: {
    fontSize: 11,
    color: '#6B7280',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  imageButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentImageContainer: {
    marginTop: 6,
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  commentImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  menuButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    marginTop: 4,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  menuItemText: {
    fontSize: 13,
    color: '#111827',
  },
  menuItemTextDelete: {
    fontSize: 13,
    color: '#EF4444',
  },
});

export default CommentModal;
