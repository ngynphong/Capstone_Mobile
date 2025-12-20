import type { AxiosResponse } from 'axios';
import axiosInstance from '../configs/axios';
import type { ApiResponse } from '../types/apiTypes';
import type {
  CommentDetail,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentVoteRequest,
} from '../types/communityTypes';

const CommentService = {
  /**
   * PUT /comments/{commentId}
   * Cập nhật comment.
   */
  updateComment(
    commentId: string,
    payload: UpdateCommentRequest,
  ): Promise<AxiosResponse<ApiResponse<CommentDetail>>> {
    return axiosInstance.put(`/comments/${commentId}`, payload);
  },

  /**
   * DELETE /comments/{commentId}
   * Xóa comment.
   */
  deleteComment(
    commentId: string,
  ): Promise<AxiosResponse<ApiResponse<void>>> {
    return axiosInstance.delete(`/comments/${commentId}`);
  },

  /**
   * POST /comments/{commentId}/vote
   * Vote cho comment (UP hoặc DOWN).
   */
  voteComment(
    commentId: string,
    payload: CommentVoteRequest,
  ): Promise<AxiosResponse<ApiResponse<CommentDetail>>> {
    return axiosInstance.post(`/comments/${commentId}/vote`, payload);
  },

  /**
   * GET /comments/{commentId}/replies
   * Lấy danh sách replies của comment.
   */
  getCommentReplies(
    commentId: string,
    params?: {
      pageNo?: number;
      pageSize?: number;
    },
  ): Promise<AxiosResponse<ApiResponse<CommentDetail[]>>> {
    return axiosInstance.get(`/comments/${commentId}/replies`, { params });
  },
};

export default CommentService;

