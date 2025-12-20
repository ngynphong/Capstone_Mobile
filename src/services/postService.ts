import type { AxiosResponse } from 'axios';
import axiosInstance from '../configs/axios';
import type { ApiResponse, PageInfo } from '../types/apiTypes';
import type {
  Post,
  UpdatePostRequest,
  PostVoteRequest,
  CommentDetail,
  CreateCommentRequest,
} from '../types/communityTypes';

const PostService = {
  /**
   * PUT /posts/{postId}
   * Cập nhật post.
   */
  updatePost(
    postId: string,
    payload: UpdatePostRequest,
  ): Promise<AxiosResponse<ApiResponse<Post>>> {
    return axiosInstance.put(`/posts/${postId}`, payload);
  },

  /**
   * DELETE /posts/{postId}
   * Xóa post.
   */
  deletePost(postId: string): Promise<AxiosResponse<ApiResponse<void>>> {
    return axiosInstance.delete(`/posts/${postId}`);
  },

  /**
   * PUT /posts/{postId}/pin
   * Pin/Unpin post.
   */
  pinPost(postId: string): Promise<AxiosResponse<ApiResponse<Post>>> {
    return axiosInstance.put(`/posts/${postId}/pin`);
  },

  /**
   * POST /posts/{postId}/vote
   * Vote cho post (UP hoặc DOWN).
   */
  votePost(
    postId: string,
    payload: PostVoteRequest,
  ): Promise<AxiosResponse<ApiResponse<Post>>> {
    return axiosInstance.post(`/posts/${postId}/vote`, payload);
  },

  /**
   * GET /posts/{postId}/comments
   * Lấy danh sách comments của post.
   */
  getPostComments(
    postId: string,
    params?: {
      pageNo?: number;
      pageSize?: number;
    },
  ): Promise<AxiosResponse<ApiResponse<PageInfo<CommentDetail> | CommentDetail[]>>> {
    return axiosInstance.get(`/posts/${postId}/comments`, { params });
  },

  /**
   * POST /posts/{postId}/comments
   * Tạo comment mới cho post.
   */
  createPostComment(
    postId: string,
    payload: CreateCommentRequest,
  ): Promise<AxiosResponse<ApiResponse<CommentDetail>>> {
    return axiosInstance.post(`/posts/${postId}/comments`, payload);
  },

  /**
   * GET /posts/my-posts
   * Lấy danh sách posts của user hiện tại.
   */
  getMyPosts(
    params?: {
      pageNo?: number;
      pageSize?: number;
    },
  ): Promise<AxiosResponse<ApiResponse<PageInfo<Post> | Post[]>>> {
    return axiosInstance.get('/posts/my-posts', { params });
  },
};

export default PostService;

