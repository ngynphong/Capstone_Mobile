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
   * POST /posts/{postId}/vote?value={value}
   * Vote cho post với value: 1 (like) hoặc -1 (dislike).
   */
  votePost(
    postId: string,
    value: number, // 1 for like, -1 for dislike
  ): Promise<AxiosResponse<ApiResponse<Post>>> {
    return axiosInstance.post(`/posts/${postId}/vote`, null, {
      params: { value }
    });
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

  /**
   * POST /communities/{communityId}/posts
   * Tạo post mới trong community.
   */
  createPost(
    communityId: string,
    data: {
      title: string;
      content: string;
      image?: any; // File object hoặc URI
    },
  ): Promise<AxiosResponse<ApiResponse<Post>>> {
    const formData = new FormData();
    
    // Append title và content vào FormData
    formData.append('title', data.title);
    formData.append('content', data.content);

    // Xử lý image: blob URL (web) hoặc file URI (native)
    if (data.image && data.image.uri) {
      const imageUri = data.image.uri;
      
      if (imageUri.startsWith('blob:')) {
        // Trên web: convert blob URL thành File object
        return fetch(imageUri)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], data.image.name || `image_${Date.now()}.jpg`, {
              type: data.image.type || 'image/jpeg',
            });
            const webFormData = new FormData();
            webFormData.append('title', data.title);
            webFormData.append('content', data.content);
            webFormData.append('image', file);
            
            return axiosInstance.post(`/communities/${communityId}/posts`, webFormData);
          });
      } else {
        // Trên native: sử dụng object với uri, type, name
        const fileData: any = {
          uri: imageUri,
          type: data.image.type || 'image/jpeg',
          name: data.image.name || `image_${Date.now()}.jpg`,
        };
        formData.append('image', fileData);
      }
    }

    return axiosInstance.post(`/communities/${communityId}/posts`, formData);
  },
};

export default PostService;

