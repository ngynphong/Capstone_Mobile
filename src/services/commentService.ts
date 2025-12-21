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
   * GET /posts/{postId}/comments
   * Lấy danh sách comments của post.
   */
  getPostComments(
    postId: string,
    params?: {
      page?: number;
      size?: number;
    },
  ): Promise<AxiosResponse<ApiResponse<CommentDetail[]>>> {
    return axiosInstance.get(`/posts/${postId}/comments`, { params });
  },

  createComment(
    postId: string,
    payload: CreateCommentRequest & { image?: any },
  ): Promise<AxiosResponse<ApiResponse<CommentDetail>>> {
    const { content, parentId, image } = payload;
    
    // Query parameters cho cả 2 trường hợp
    const params: any = { content };
    if (parentId) {
      params.parenCommentId = parentId;
    }
    
    // Nếu có image, gửi multipart/form-data
    if (image && image.uri) {
      const formData = new FormData();
      
      const imageUri = image.uri;
      if (imageUri.startsWith('blob:')) {
        // Web: fetch blob và tạo File
        return fetch(imageUri)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], image.name || `image_${Date.now()}.jpg`, {
              type: image.type || 'image/jpeg',
            });
            formData.append('image', file);
            return axiosInstance.post(`/posts/${postId}/comments`, formData, { params });
          });
      } else {
        // Native: append file object
        const fileData: any = {
          uri: imageUri,
          type: image.type || 'image/jpeg',
          name: image.name || `image_${Date.now()}.jpg`,
        };
        formData.append('image', fileData);
        return axiosInstance.post(`/posts/${postId}/comments`, formData, { params });
      }
    }
    
    // Không có image: thử gửi content trong FormData (mobile có thể không chấp nhận FormData rỗng)
    const formData = new FormData();
    formData.append('content', content || '');
    if (parentId) {
      formData.append('parenCommentId', parentId);
    }
    return axiosInstance.post(`/posts/${postId}/comments`, formData);
  },

  /**
   * PUT /comments/{commentId}
   * Cập nhật comment.
   */
  updateComment(
    commentId: string,
    payload: UpdateCommentRequest,
  ): Promise<AxiosResponse<ApiResponse<CommentDetail>>> {
    // Đảm bảo payload chỉ chứa content là string thuần
    const cleanPayload = {
      content: typeof payload.content === 'string' ? payload.content : String(payload.content)
    };
    return axiosInstance.put(`/comments/${commentId}`, cleanPayload);
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
   * POST /comments/{commentId}/vote?value={value}
   * Vote cho comment với value: 1 (like) hoặc -1 (dislike).
   */
  voteComment(
    commentId: string,
    value: number, // 1 for like, -1 for dislike
  ): Promise<AxiosResponse<ApiResponse<CommentDetail>>> {
    return axiosInstance.post(`/comments/${commentId}/vote`, null, {
      params: { value }
    });
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

