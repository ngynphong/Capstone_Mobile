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
import { X, Send, ThumbsUp, ThumbsDown, MessageCircle, Image as ImageIcon, XCircle, MoreVertical, Trash2, Edit2 } from 'lucide-react-native';
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
  const { comments, isLoading, fetchPostComments, createComment, deleteComment, updateComment, voteComment, fetchCommentReplies } = useComment();
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyingToAuthor, setReplyingToAuthor] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [repliesData, setRepliesData] = useState<Map<string, CommentDetail[]>>(new Map());
  const [repliesCount, setRepliesCount] = useState<Map<string, number>>(new Map());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
  const [localComments, setLocalComments] = useState<CommentDetail[]>([]);
  const shouldSyncRef = useRef(true);
  
  useEffect(() => {
    if (shouldSyncRef.current) {
      setLocalComments(comments);
    }
  }, [comments]);

  useEffect(() => {
    if (visible && postId) {
      shouldSyncRef.current = true;
      fetchPostComments(postId, { page: 1, size: 50 }).catch(() => {});
    }
    if (!visible) {
      setNewComment('');
      setSelectedImage(null);
      setEditingComment(null);
      setShowMenuId(null);
      setReplyingToCommentId(null);
      setReplyingToAuthor(null);
      setExpandedReplies(new Set());
      setRepliesData(new Map());
      setRepliesCount(new Map());
      setLoadingReplies(new Set());
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

      const parentId = replyingToCommentId;
      const newCommentResult = await createComment(postId, {
        content: newComment.trim() || '',
        postId: postId,
        image: imageData,
        parentId: parentId || undefined,
      });
      setNewComment('');
      setSelectedImage(null);
      
      const normalizedComment: CommentDetail = {
        ...newCommentResult,
        parenCommentId: parentId || undefined,
      };
      
      shouldSyncRef.current = false;
      setLocalComments(prev => {
        const updated = prev.map(c => c.id === normalizedComment.id ? normalizedComment : c);
        // Nếu chưa có trong list, thêm vào
        if (!updated.find(c => c.id === normalizedComment.id)) {
          return [normalizedComment, ...updated];
        }
        return updated;
      });
      
      // Nếu là reply, thêm vào repliesData và expand replies
      if (parentId) {
        setExpandedReplies(prev => new Set(prev).add(parentId));
        // Thêm reply mới vào repliesData
        setRepliesData(prev => {
          const newMap = new Map(prev);
          const existingReplies = newMap.get(parentId) || [];
          newMap.set(parentId, [normalizedComment, ...existingReplies]);
          return newMap;
        });
        // Cập nhật số lượng replies
        setRepliesCount(prev => {
          const newMap = new Map(prev);
          const currentCount = newMap.get(parentId) || 0;
          newMap.set(parentId, currentCount + 1);
          return newMap;
        });
      }
      
      setReplyingToCommentId(null);
      setReplyingToAuthor(null);
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
      if (author.name) return author.name;
      if (author.username) return author.username;
      
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
    
    let normalizedContent = comment.content || '';
    if (typeof normalizedContent === 'string' && normalizedContent.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(normalizedContent);
        normalizedContent = parsed.content || normalizedContent;
      } catch (e) {
        // Ignore parse error
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
      await fetchPostComments(postId, { page: 1, size: 50 });
      if (onCommentAdded) {
        onCommentAdded();
      }
      setEditingComment(null);
    } catch (error: any) {
      throw error;
    }
  }, [updateComment, fetchPostComments, postId, onCommentAdded]);

  const handleSetShowMenuId = useCallback((id: string | null) => {
    setShowMenuId(id);
  }, []);

  const handleReplyComment = useCallback((commentId: string, authorName: string) => {
    setReplyingToCommentId(commentId);
    setReplyingToAuthor(authorName);
    setShowMenuId(null);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingToCommentId(null);
    setReplyingToAuthor(null);
  }, []);

  const handleToggleReplies = useCallback(async (commentId: string) => {
    const isExpanded = expandedReplies.has(commentId);
    
    if (isExpanded) {
      // Đóng replies
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      // Mở replies - fetch nếu chưa có
      setExpandedReplies(prev => new Set(prev).add(commentId));
      
      // Nếu chưa có replies trong cache, fetch từ API
      if (!repliesData.has(commentId)) {
        try {
          setLoadingReplies(prev => new Set(prev).add(commentId));
          const replies = await fetchCommentReplies(commentId, { pageNo: 0, pageSize: 50 });
          setRepliesData(prev => {
            const newMap = new Map(prev);
            newMap.set(commentId, replies);
            return newMap;
          });
          // Lưu số lượng replies từ API response
          setRepliesCount(prev => {
            const newMap = new Map(prev);
            newMap.set(commentId, replies.length);
            return newMap;
          });
        } catch (error) {
          console.error('Failed to fetch replies:', error);
        } finally {
          setLoadingReplies(prev => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
          });
        }
      }
    }
  }, [expandedReplies, repliesData, fetchCommentReplies]);

  // Tổ chức comments thành parent và children
  const organizeComments = useMemo(() => {
    const allComments = localComments.length > 0 ? localComments : comments;
    const parentComments: CommentDetail[] = [];
    const repliesMap = new Map<string, CommentDetail[]>();

    // Phân loại comments thành parent và replies
    // Đơn giản: chỉ cần check parenCommentId
    allComments.forEach(comment => {
      const parenCommentId = comment.parenCommentId;
      
      // Nếu có parenCommentId -> đây là reply
      if (parenCommentId && parenCommentId.trim() !== '') {
        const parenCommentIdString = parenCommentId.trim();
        if (!repliesMap.has(parenCommentIdString)) {
          repliesMap.set(parenCommentIdString, []);
        }
        repliesMap.get(parenCommentIdString)!.push(comment);
      } else {
        // Không có parenCommentId -> đây là parent comment
        parentComments.push(comment);
      }
    });
    

    // Sắp xếp parent comments theo thời gian (mới nhất trước)
    parentComments.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    // Sắp xếp replies theo thời gian (cũ nhất trước)
    repliesMap.forEach((replies) => {
      replies.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return timeA - timeB;
      });
    });

    return { parentComments, repliesMap };
  }, [localComments, comments]);

  const handleVoteComment = useCallback(async (commentId: string, value: number) => {
    try {
      shouldSyncRef.current = false;
      
      const currentComment = localComments.find(c => c.id === commentId);
      const currentVoteValue = currentComment?.userVote === 'UP' ? 1 : currentComment?.userVote === 'DOWN' ? -1 : 0;
      
      let newVoteValue: number;
      if (value === 1) {
        newVoteValue = currentVoteValue === 1 ? 0 : 1;
      } else if (value === -1) {
        newVoteValue = currentVoteValue === -1 ? 0 : -1;
      } else {
        newVoteValue = 0;
      }
      
      const newVote: 'UP' | 'DOWN' | null = newVoteValue === 1 ? 'UP' : newVoteValue === -1 ? 'DOWN' : null;
      
      const currentCount = currentComment?.voteCount || 0;
      let newCount = currentCount;
      
      if (currentVoteValue === 1 && newVoteValue === 0) {
        newCount = currentCount - 1;
      } else if (currentVoteValue === -1 && newVoteValue === 0) {
        newCount = currentCount + 1;
      } else if (currentVoteValue === -1 && newVoteValue === 1) {
        newCount = currentCount + 2;
      } else if (currentVoteValue === 0 && newVoteValue === 1) {
        newCount = currentCount + 1;
      } else if (currentVoteValue === 1 && newVoteValue === -1) {
        newCount = currentCount - 2;
      } else if (currentVoteValue === 0 && newVoteValue === -1) {
        newCount = currentCount - 1;
      }
      
      setLocalComments(prev =>
        prev.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              userVote: newVote,
              voteCount: newCount,
            };
          }
          return c;
        })
      );
      
      const updatedComment = await voteComment(commentId, newVoteValue);
      const serverVoteValue = (updatedComment as any).userVoteValue !== undefined 
        ? (updatedComment as any).userVoteValue
        : (updatedComment.userVote === 'UP' ? 1 : updatedComment.userVote === 'DOWN' ? -1 : newVoteValue);
      const serverVote: 'UP' | 'DOWN' | null = serverVoteValue === 1 ? 'UP' : serverVoteValue === -1 ? 'DOWN' : null;
      
      setLocalComments(prev =>
        prev.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              ...updatedComment,
              userVote: serverVote || newVote,
              voteCount: updatedComment.voteCount ?? newCount,
            };
          }
          return c;
        })
      );
    } catch (error) {
      shouldSyncRef.current = true;
      await fetchPostComments(postId, { page: 1, size: 50 });
    }
  }, [voteComment, localComments, fetchPostComments, postId]);


  const CommentItem: React.FC<{ 
    comment: CommentDetail;
    replies?: CommentDetail[];
    showMenuId: string | null;
    expandedReplies: Set<string>;
    repliesData: Map<string, CommentDetail[]>;
    repliesCount: Map<string, number>;
    loadingReplies: Set<string>;
    onSetShowMenuId: (id: string | null) => void;
    onStartEdit: (comment: CommentDetail) => void;
    onDeleteComment: (commentId: string) => void;
    onVoteComment: (commentId: string, value: number) => void;
    onReplyComment: (commentId: string, authorName: string) => void;
    onToggleReplies: (commentId: string) => void;
  }> = React.memo(({ 
    comment,
    replies = [],
    showMenuId,
    expandedReplies,
    repliesData,
    repliesCount,
    loadingReplies,
    onSetShowMenuId,
    onStartEdit,
    onDeleteComment,
    onVoteComment,
    onReplyComment,
    onToggleReplies,
  }) => {
    const timeAgo = useTimeAgo(comment.createdAt);
    const authorName = getCommentAuthorName(comment.author);
    const authorAvatar = comment.avatar || getCommentAuthorAvatar(comment.author);
    const voteCount = comment.voteCount || 0;
    const commentImageUrl = (comment as any).imgUrl;
    const isOwner = isCommentOwner(comment);
    const userVote = (comment as any).userVote;

    return (
      <View>
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
              <View style={styles.voteRow}>
                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    userVote === 'UP' && styles.voteButtonActive,
                  ]}
                  onPress={() => onVoteComment(comment.id, 1)}
                >
                  <ThumbsUp
                    size={14}
                    color={userVote === 'UP' ? '#FFFFFF' : '#6B7280'}
                    fill={userVote === 'UP' ? '#FFFFFF' : 'none'}
                  />
                  <Text
                    style={[
                      styles.voteButtonText,
                      userVote === 'UP' && styles.voteButtonTextActive,
                    ]}
                  >
                    Like
                  </Text>
                </TouchableOpacity>
                <Text style={styles.voteCount}>{voteCount}</Text>

                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    userVote === 'DOWN' && styles.voteButtonActiveDislike,
                  ]}
                  onPress={() => onVoteComment(comment.id, -1)}
                >
                  <ThumbsDown
                    size={14}
                    color={userVote === 'DOWN' ? '#FFFFFF' : '#6B7280'}
                    fill={userVote === 'DOWN' ? '#FFFFFF' : 'none'}
                  />
                  <Text
                    style={[
                      styles.voteButtonText,
                      userVote === 'DOWN' && styles.voteButtonTextActive,
                    ]}
                  >
                    Dislike
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => onReplyComment(comment.id, authorName)}
                >
                  <MessageCircle size={14} color="#6B7280" />
                  <Text style={styles.replyButtonText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {(repliesCount.get(comment.id) || repliesData.get(comment.id)?.length || (comment as any).replyCount || replies.length || 0) > 0 && (
          <View style={styles.repliesSection}>
            <TouchableOpacity
              onPress={() => onToggleReplies(comment.id)}
              style={styles.viewRepliesButton}
            >
              {loadingReplies.has(comment.id) ? (
                <ActivityIndicator size="small" color="#3CBCB2" />
              ) : (
                <Text style={styles.viewRepliesText}>
                  {expandedReplies.has(comment.id) 
                    ? 'Hide' 
                    : `View ${repliesCount.get(comment.id) || repliesData.get(comment.id)?.length || (comment as any).replyCount || replies.length || 0} replies`}
                </Text>
              )}
            </TouchableOpacity>
            {expandedReplies.has(comment.id) && (
              <View style={styles.repliesWrapper}>
                <View style={styles.replyConnectorLine} />
                <View style={styles.repliesContainer}>
                  {(repliesData.get(comment.id) || replies).map((reply) => (
                    <ReplyItem
                      key={reply.id}
                      comment={reply}
                      showMenuId={showMenuId}
                      onSetShowMenuId={onSetShowMenuId}
                      onStartEdit={onStartEdit}
                      onDeleteComment={onDeleteComment}
                      onVoteComment={onVoteComment}
                      onReplyComment={onReplyComment}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }, (prevProps, nextProps) => {
    return prevProps.comment.id === nextProps.comment.id &&
           prevProps.showMenuId === nextProps.showMenuId;
  });

  const ReplyItem: React.FC<{ 
    comment: CommentDetail;
    showMenuId: string | null;
    onSetShowMenuId: (id: string | null) => void;
    onStartEdit: (comment: CommentDetail) => void;
    onDeleteComment: (commentId: string) => void;
    onVoteComment: (commentId: string, value: number) => void;
    onReplyComment: (commentId: string, authorName: string) => void;
  }> = React.memo(({ 
    comment,
    showMenuId,
    onSetShowMenuId,
    onStartEdit,
    onDeleteComment,
    onVoteComment,
    onReplyComment,
  }) => {
    const timeAgo = useTimeAgo(comment.createdAt);
    const authorName = getCommentAuthorName(comment.author);
    const authorAvatar = comment.avatar || getCommentAuthorAvatar(comment.author);
    const voteCount = comment.voteCount || 0;
    const commentImageUrl = (comment as any).imgUrl;
    const isOwner = isCommentOwner(comment);
    const userVote = (comment as any).userVote;

    return (
      <View style={styles.replyContainer}>
        <View style={styles.replyCommentContainer}>
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
              <View style={styles.voteRow}>
                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    userVote === 'UP' && styles.voteButtonActive,
                  ]}
                  onPress={() => onVoteComment(comment.id, 1)}
                >
                  <ThumbsUp
                    size={14}
                    color={userVote === 'UP' ? '#FFFFFF' : '#6B7280'}
                    fill={userVote === 'UP' ? '#FFFFFF' : 'none'}
                  />
                  <Text
                    style={[
                      styles.voteButtonText,
                      userVote === 'UP' && styles.voteButtonTextActive,
                    ]}
                  >
                    Like
                  </Text>
                </TouchableOpacity>
                <Text style={styles.voteCount}>{voteCount}</Text>

                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    userVote === 'DOWN' && styles.voteButtonActiveDislike,
                  ]}
                  onPress={() => onVoteComment(comment.id, -1)}
                >
                  <ThumbsDown
                    size={14}
                    color={userVote === 'DOWN' ? '#FFFFFF' : '#6B7280'}
                    fill={userVote === 'DOWN' ? '#FFFFFF' : 'none'}
                  />
                  <Text
                    style={[
                      styles.voteButtonText,
                      userVote === 'DOWN' && styles.voteButtonTextActive,
                    ]}
                  >
                    Dislike
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => onReplyComment(comment.id, authorName)}
                >
                  <MessageCircle size={14} color="#6B7280" />
                  <Text style={styles.replyButtonText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }, (prevProps, nextProps) => {
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
        {isLoading && (localComments.length === 0 && comments.length === 0) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3CBCB2" />
          </View>
        ) : (
          <FlatList
            data={organizeComments.parentComments}
            renderItem={({ item }) => (
              <CommentItem 
                comment={item}
                replies={organizeComments.repliesMap.get(item.id) || []}
                showMenuId={showMenuId}
                expandedReplies={expandedReplies}
                repliesData={repliesData}
                repliesCount={repliesCount}
                loadingReplies={loadingReplies}
                onSetShowMenuId={handleSetShowMenuId}
                onStartEdit={handleStartEdit}
                onDeleteComment={handleDeleteComment}
                onVoteComment={handleVoteComment}
                onReplyComment={handleReplyComment}
                onToggleReplies={handleToggleReplies}
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
          {replyingToCommentId && replyingToAuthor && (
            <View style={styles.replyInfoContainer}>
              <Text style={styles.replyInfoText}>
                Replying to <Text style={styles.replyInfoAuthor}>{replyingToAuthor}</Text>
              </Text>
              <TouchableOpacity onPress={handleCancelReply} style={styles.cancelReplyButton}>
                <X size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
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
                placeholder={replyingToCommentId ? `Reply to ${replyingToAuthor}...` : "Write a comment..."}
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
  replyCommentContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
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
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  voteButtonActive: {
    backgroundColor: '#3CBCB2',
    borderColor: '#3CBCB2',
  },
  voteButtonActiveDislike: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  voteButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  voteButtonTextActive: {
    color: '#FFFFFF',
  },
  voteCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3CBCB2',
    marginRight: 4,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  replyButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 4,
  },
  replyInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyInfoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  replyInfoAuthor: {
    fontWeight: '600',
    color: '#3CBCB2',
  },
  cancelReplyButton: {
    padding: 4,
  },
  repliesSection: {
    marginTop: 4,
  },
  viewRepliesButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginTop: 4,
    marginLeft: 0,
  },
  viewRepliesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3CBCB2',
  },
  repliesWrapper: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 0,
    alignItems: 'flex-start',
    minHeight: 50,
  },
  replyConnectorLine: {
    width: 3,
    backgroundColor: '#3CBCB2',
    marginRight: 12,
    marginLeft: 20,
    alignSelf: 'stretch',
  },
  repliesContainer: {
    flex: 1,
    paddingLeft: 0,
  },
  replyContainer: {
    marginBottom: 8,
  },
  replyConnector: {
    width: 0,
    height: 0,
  },
  replyContent: {
    flex: 1,
  },
});

export default CommentModal;
