import { useCallback, useState } from 'react';
import CommentService from '../services/commentService';
import type {
  CommentDetail,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentVoteRequest,
} from '../types/communityTypes';
import type { ApiResponse } from '../types/apiTypes';

export const useComment = () => {
  const [comments, setComments] = useState<CommentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy danh sách comments của post
   */
  const fetchPostComments = useCallback(
    async (
      postId: string,
      params?: {
        page?: number;
        size?: number;
      },
    ): Promise<CommentDetail[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommentService.getPostComments(postId, params);
        let commentsList: CommentDetail[] = [];

        if (response.data?.data) {
          // response.data.data có thể là mảng thuần, object phân trang { items: [...] } hoặc 1 object đơn
          const data: any = response.data.data;
          if (data.items && Array.isArray(data.items)) {
            commentsList = data.items as CommentDetail[];
          } else if (Array.isArray(data)) {
            commentsList = data as CommentDetail[];
          } else if (typeof data === 'object' && (data as any).id) {
            commentsList = [data as CommentDetail];
          }
        }
        
        // Normalize comments - giữ nguyên author object từ API
        const normalizedComments = commentsList.map((comment: any) => {
          const authorObj =
            typeof comment.author === 'object' && comment.author !== null
              ? (comment.author as any)
              : undefined;
          const userObj =
            typeof comment.user === 'object' && comment.user !== null
              ? (comment.user as any)
              : undefined;

          const authorAvatar = authorObj?.imgUrl || authorObj?.avatar;
          const commentAvatar = comment.avatar;
          
          
          // Đảm bảo content là string, không phải JSON string
          let normalizedContent = comment.content || '';
          // Nếu content là JSON string, parse nó
          if (typeof normalizedContent === 'string' && normalizedContent.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(normalizedContent);
              normalizedContent = parsed.content || normalizedContent;
            } catch (e) {
              // Nếu không parse được, giữ nguyên
            }
          }
          
          const normalizedComment: CommentDetail = {
            ...comment,
            content: normalizedContent,
            author: comment.author || (comment as any).user || 'Unknown',
            avatar:
              authorAvatar ||
              commentAvatar ||
              userObj?.imgUrl ||
              userObj?.avatar,
            voteCount:
              comment.voteCount !== undefined
                ? comment.voteCount
                : (comment.likes || 0),
            createdAt:
              comment.createdAt ||
              (comment as any).created_at ||
              new Date().toISOString(),
            postId: comment.postId || postId,
            parenCommentId: comment.parenCommentId,
          };
          
          return normalizedComment;
        });
        
        setComments(normalizedComments);
        return normalizedComments;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tải danh sách comments.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Tạo comment mới cho post
   */
  const createComment = useCallback(
    async (
      postId: string,
      payload: CreateCommentRequest & { image?: any },
    ): Promise<CommentDetail> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommentService.createComment(postId, payload);
        const newCommentRaw: any =
          (response.data as ApiResponse<CommentDetail>).data ||
          (response.data as any);

        // Normalize comment mới
        const authorObj =
          typeof newCommentRaw.author === 'object' && newCommentRaw.author !== null
            ? (newCommentRaw.author as any)
            : undefined;
        const userObj =
          typeof newCommentRaw.user === 'object' && newCommentRaw.user !== null
            ? (newCommentRaw.user as any)
            : undefined;

        const authorAvatar = authorObj?.imgUrl || authorObj?.avatar;
        const commentAvatar = newCommentRaw.avatar;
        
        let normalizedContent = newCommentRaw.content || '';
        if (typeof normalizedContent === 'string' && normalizedContent.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(normalizedContent);
            normalizedContent = parsed.content || normalizedContent;
          } catch (e) {
            // Ignore parse error
          }
        }
        
        const parenCommentIdValue = payload.parentId || newCommentRaw.parenCommentId;
        
        const newComment: CommentDetail = {
          ...newCommentRaw,
          content: normalizedContent,
          author: newCommentRaw.author || newCommentRaw.user || 'Unknown',
          avatar:
            authorAvatar ||
            commentAvatar ||
            userObj?.imgUrl ||
            userObj?.avatar,
          voteCount:
            newCommentRaw.voteCount !== undefined
              ? newCommentRaw.voteCount
              : (newCommentRaw.likes || 0),
          createdAt:
            newCommentRaw.createdAt ||
            newCommentRaw.created_at ||
            new Date().toISOString(),
          parenCommentId: parenCommentIdValue,
        };
        
        setComments(prev => [newComment, ...prev]);
        return newComment;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tạo comment.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Cập nhật comment
   */
  const updateComment = useCallback(
    async (
      commentId: string,
      payload: UpdateCommentRequest,
    ): Promise<CommentDetail> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommentService.updateComment(commentId, payload);
        const updated: any =
          (response.data as ApiResponse<CommentDetail>).data ||
          (response.data as any);

        // Normalize updated comment
        // Đảm bảo content là string, không phải JSON string
        let normalizedContent = updated.content || '';
        // Nếu content là JSON string, parse nó
        if (typeof normalizedContent === 'string' && normalizedContent.startsWith('{')) {
          try {
            const parsed = JSON.parse(normalizedContent);
            normalizedContent = parsed.content || normalizedContent;
          } catch (e) {
            // Nếu không parse được, giữ nguyên
          }
        }
        
        const authorObj =
          typeof updated.author === 'object' && updated.author !== null
            ? (updated.author as any)
            : undefined;
        const userObj =
          typeof updated.user === 'object' && updated.user !== null
            ? (updated.user as any)
            : undefined;

        const normalizedUpdated: CommentDetail = {
          ...updated,
          content: normalizedContent,
          author: updated.author || updated.user || 'Unknown',
          avatar:
            updated.avatar ||
            authorObj?.imgUrl ||
            authorObj?.avatar ||
            userObj?.imgUrl ||
            userObj?.avatar,
          voteCount:
            updated.voteCount !== undefined
              ? updated.voteCount
              : (updated.likes || 0),
          createdAt:
            updated.createdAt ||
            updated.created_at ||
            new Date().toISOString(),
        };
        
        setComments(prev =>
          prev.map(c => (c.id === commentId ? { ...c, ...normalizedUpdated } : c)),
        );
        return normalizedUpdated;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể cập nhật comment.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Xóa comment
   */
  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        await CommentService.deleteComment(commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể xóa comment.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Vote cho comment với value: 1 (like) hoặc -1 (dislike)
   */
  const voteComment = useCallback(
    async (
      commentId: string,
      value: number,
    ): Promise<CommentDetail> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommentService.voteComment(commentId, value);
        const updated =
          (response.data as ApiResponse<CommentDetail>).data ||
          (response.data as any);
        setComments(prev =>
          prev.map(c => (c.id === commentId ? { ...c, ...updated } : c)),
        );
        return updated;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể vote comment.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Lấy danh sách replies của comment
   */
  const fetchCommentReplies = useCallback(
    async (
      commentId: string,
      params?: {
        pageNo?: number;
        pageSize?: number;
      },
    ): Promise<CommentDetail[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommentService.getCommentReplies(
          commentId,
          params,
        );
        
        // Parse paginated response với structure: { data: { items: [...], ... } }
        let repliesList: CommentDetail[] = [];
        if (response.data?.data) {
          const data: any = response.data.data;
          if (data.items && Array.isArray(data.items)) {
            repliesList = data.items as CommentDetail[];
          } else if (Array.isArray(data)) {
            repliesList = data as CommentDetail[];
          } else if (typeof data === 'object' && (data as any).id) {
            repliesList = [data as CommentDetail];
          }
        }
        
        // Normalize replies
        const normalizedReplies = repliesList.map((reply: any) => {
          const authorAvatar = reply.author?.imgUrl || reply.author?.avatar;
          const replyAvatar = reply.avatar;
          
          let normalizedContent = reply.content || '';
          if (typeof normalizedContent === 'string' && normalizedContent.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(normalizedContent);
              normalizedContent = parsed.content || normalizedContent;
            } catch (e) {
              // Ignore parse error
            }
          }
          
          return {
            ...reply,
            content: normalizedContent,
            author: reply.author || reply.user || 'Unknown',
            avatar: authorAvatar || replyAvatar || reply.user?.imgUrl || reply.user?.avatar,
            voteCount: reply.voteCount !== undefined ? reply.voteCount : (reply.likes || 0),
            createdAt: reply.createdAt || reply.created_at || new Date().toISOString(),
            parentId: reply.parenCommentId || reply.parentCommentId || reply.parentId,
          };
        });
        
        setComments(prev => {
          const existing = prev.find(c => c.id === commentId);
          if (existing) {
            return prev.map(c =>
              c.id === commentId ? { ...c, replies: normalizedReplies } : c,
            );
          }
          return prev;
        });
        return normalizedReplies;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tải danh sách replies.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    // state
    comments,
    isLoading,
    error,

    // actions
    fetchPostComments,
    createComment,
    updateComment,
    deleteComment,
    voteComment,
    fetchCommentReplies,
  };
};

export default useComment;

