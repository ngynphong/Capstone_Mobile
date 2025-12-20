import { useCallback, useState } from 'react';
import CommunityService from '../services/communityService';
import type {
  Community,
  CreateCommunityRequest,
  UpdateCommunityRequest,
  CommunitySearchParams,
  Post,
} from '../types/communityTypes';
import type { ApiResponse, PageInfo } from '../types/apiTypes';

const normalizeCommunityResponse = (
  response: ApiResponse<PageInfo<Community> | Community[] | undefined | null>,
): Community[] => {
  if (!response || !response.data) return [];

  const rawData = response.data;

  if (Array.isArray(rawData)) {
    return rawData;
  }

  const pageInfo = rawData as PageInfo<Community>;
  return pageInfo.items || pageInfo.content || [];
};

const normalizePostResponse = (
  response: ApiResponse<PageInfo<Post> | Post[] | undefined | null>,
): Post[] => {
  if (!response || !response.data) return [];

  const rawData = response.data;

  if (Array.isArray(rawData)) {
    return rawData;
  }

  const pageInfo = rawData as PageInfo<Post>;
  return pageInfo.items || pageInfo.content || [];
};

export const useCommunity = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy danh sách communities
   */
  const fetchCommunities = useCallback(
    async (params?: {
      pageNo?: number;
      pageSize?: number;
      subject?: string;
    }): Promise<Community[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommunityService.getCommunities(params);
        const list = normalizeCommunityResponse(response.data);
        setCommunities(list);
        return list;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tải danh sách communities.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Tạo community mới
   */
  const createCommunity = useCallback(
    async (payload: CreateCommunityRequest): Promise<Community> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommunityService.createCommunity(payload);
        const community =
          (response.data as ApiResponse<Community>).data || (response.data as any);
        setCommunities(prev => [community, ...prev]);
        return community;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tạo community.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Cập nhật community
   */
  const updateCommunity = useCallback(
    async (
      communityId: string,
      payload: UpdateCommunityRequest,
    ): Promise<Community> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommunityService.updateCommunity(
          communityId,
          payload,
        );
        const updated =
          (response.data as ApiResponse<Community>).data || (response.data as any);
        setCommunities(prev =>
          prev.map(c => (c.id === communityId ? { ...c, ...updated } : c)),
        );
        return updated;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể cập nhật community.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Xóa community
   */
  const deleteCommunity = useCallback(
    async (communityId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        await CommunityService.deleteCommunity(communityId);
        setCommunities(prev => prev.filter(c => c.id !== communityId));
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể xóa community.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Lấy danh sách posts trong community
   * @param communityId - ID của community (required)
   * @param params - Query parameters: page (default: 1), size (default: 15)
   */
  const fetchCommunityPosts = useCallback(
    async (
      communityId: string,
      params?: {
        page?: number; // Default: 1
        size?: number; // Default: 15
      },
    ): Promise<Post[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommunityService.getCommunityPosts(
          communityId,
          params,
        );
        const list = normalizePostResponse(response.data);
        setCommunityPosts(list);
        return list;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tải danh sách posts.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Tạo post mới trong community
   */
  const createCommunityPost = useCallback(
    async (
      communityId: string,
      payload: {
        title: string;
        content: string;
        subject?: string;
        categoryId?: string;
      },
    ): Promise<Post> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommunityService.createCommunityPost(
          communityId,
          payload,
        );
        const post =
          (response.data as ApiResponse<Post>).data || (response.data as any);
        setCommunityPosts(prev => [post, ...prev]);
        return post;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tạo post.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Tìm kiếm communities
   */
  const searchCommunities = useCallback(
    async (params: CommunitySearchParams): Promise<Community[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await CommunityService.searchCommunities(params);
        const list = normalizeCommunityResponse(response.data);
        setCommunities(list);
        return list;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tìm kiếm communities.';
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
    communities,
    communityPosts,
    isLoading,
    error,

    // actions
    fetchCommunities,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    fetchCommunityPosts,
    createCommunityPost,
    searchCommunities,
  };
};

export default useCommunity;

