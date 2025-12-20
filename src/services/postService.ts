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
   * GET /posts
   * Lấy danh sách tất cả posts (feed).
   * NOTE: Endpoint này có thể không tồn tại, sử dụng getMyPosts hoặc getCommunityPosts thay thế
   */
  getAllPosts(
    params?: {
      pageNo?: number;
      pageSize?: number;
      subject?: string;
      communityId?: string;
    },
  ): Promise<AxiosResponse<ApiResponse<PageInfo<Post> | Post[]>>> {
    // Nếu có communityId, sử dụng endpoint communities
    if (params?.communityId) {
      const { communityId, ...restParams } = params;
      return axiosInstance.get(`/communities/${communityId}/posts`, { 
        params: {
          page: restParams.pageNo || 1,
          size: restParams.pageSize || 15,
        }
      });
    }
    // Fallback: sử dụng my-posts nếu không có communityId
    return axiosInstance.get('/posts/my-posts', { 
      params: {
        pageNo: params?.pageNo || 0,
        pageSize: params?.pageSize || 20,
      }
    });
  },

  /**
   * GET /posts/{postId}
   * Lấy chi tiết một post.
   */
  getPostById(
    postId: string,
  ): Promise<AxiosResponse<ApiResponse<Post>>> {
    return axiosInstance.get(`/posts/${postId}`);
  },

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

