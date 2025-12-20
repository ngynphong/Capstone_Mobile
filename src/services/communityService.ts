import type { AxiosResponse } from 'axios';
import axiosInstance from '../configs/axios';
import type { ApiResponse, PageInfo } from '../types/apiTypes';
import type {
  Community,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  CommunitySearchParams,
  Post,
} from '../types/communityTypes';

const CommunityService = {
  /**
   * GET /communities
   * Lấy danh sách communities.
   */
  getCommunities(
    params?: {
      pageNo?: number;
      pageSize?: number;
      subject?: string;
    },
  ): Promise<AxiosResponse<ApiResponse<PageInfo<Community> | Community[]>>> {
    return axiosInstance.get('/communities', { params });
  },

  /**
   * POST /communities
   * Tạo community mới.
   */
  createCommunity(
    payload: CreateCommunityRequest,
  ): Promise<AxiosResponse<ApiResponse<Community>>> {
    return axiosInstance.post('/communities', payload);
  },

  /**
   * PUT /communities/{communityId}
   * Cập nhật community.
   */
  updateCommunity(
    communityId: string,
    payload: UpdateCommunityRequest,
  ): Promise<AxiosResponse<ApiResponse<Community>>> {
    return axiosInstance.put(`/communities/${communityId}`, payload);
  },

  /**
   * DELETE /communities/{communityId}
   * Xóa community.
   */
  deleteCommunity(
    communityId: string,
  ): Promise<AxiosResponse<ApiResponse<void>>> {
    return axiosInstance.delete(`/communities/${communityId}`);
  },

  /**
   * GET /communities/{communityId}/posts
   * Lấy danh sách posts trong community.
   */
  getCommunityPosts(
    communityId: string,
    params?: {
      pageNo?: number;
      pageSize?: number;
    },
  ): Promise<AxiosResponse<ApiResponse<PageInfo<Post> | Post[]>>> {
    return axiosInstance.get(`/communities/${communityId}/posts`, { params });
  },

  /**
   * POST /communities/{communityId}/posts
   * Tạo post mới trong community.
   */
  createCommunityPost(
    communityId: string,
    payload: {
      title: string;
      content: string;
      subject?: string;
      categoryId?: string;
    },
  ): Promise<AxiosResponse<ApiResponse<Post>>> {
    return axiosInstance.post(`/communities/${communityId}/posts`, payload);
  },

  /**
   * GET /communities/search
   * Tìm kiếm communities.
   */
  searchCommunities(
    params: CommunitySearchParams,
  ): Promise<AxiosResponse<ApiResponse<PageInfo<Community> | Community[]>>> {
    return axiosInstance.get('/communities/search', { params });
  },
};

export default CommunityService;

