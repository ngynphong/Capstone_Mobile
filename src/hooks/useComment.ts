import { useCallback, useState } from 'react';
import CommentService from '../services/commentService';
import type {
  CommentDetail,
  UpdateCommentRequest,
  CommentVoteRequest,
} from '../types/communityTypes';
import type { ApiResponse } from '../types/apiTypes';

export const useComment = () => {
  const [comments, setComments] = useState<CommentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
   * Vote cho comment (UP hoặc DOWN)
   */
  const voteComment = useCallback(
    async (
      commentId: string,
      payload: CommentVoteRequest,
    ): Promise<CommentDetail> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommentService.voteComment(commentId, payload);
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
        const replies =
          Array.isArray(response.data?.data)
            ? response.data.data
            : response.data?.data
              ? [response.data.data]
              : [];
        setComments(prev => {
          const existing = prev.find(c => c.id === commentId);
          if (existing) {
            return prev.map(c =>
              c.id === commentId ? { ...c, replies } : c,
            );
          }
          return prev;
        });
        return replies;
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
    updateComment,
    deleteComment,
    voteComment,
    fetchCommentReplies,
  };
};

export default useComment;

