import { useCallback, useState } from 'react';
import PostService from '../services/postService';
import type {
  Post,
  UpdatePostRequest,
  PostVoteRequest,
  CommentDetail,
  CreateCommentRequest,
} from '../types/communityTypes';
import type { ApiResponse, PageInfo } from '../types/apiTypes';

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

const normalizeCommentResponse = (
  response: ApiResponse<PageInfo<CommentDetail> | CommentDetail[] | undefined | null>,
): CommentDetail[] => {
  if (!response || !response.data) return [];

  const rawData = response.data;

  if (Array.isArray(rawData)) {
    return rawData;
  }

  const pageInfo = rawData as PageInfo<CommentDetail>;
  return pageInfo.items || pageInfo.content || [];
};

export const usePost = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postComments, setPostComments] = useState<CommentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cập nhật post
   */
  const updatePost = useCallback(
    async (postId: string, payload: UpdatePostRequest): Promise<Post> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PostService.updatePost(postId, payload);
        const updated =
          (response.data as ApiResponse<Post>).data || (response.data as any);
        setPosts(prev =>
          prev.map(p => (p.id === postId ? { ...p, ...updated } : p)),
        );
        return updated;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể cập nhật post.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Xóa post
   */
  const deletePost = useCallback(
    async (postId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        await PostService.deletePost(postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
        return true;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể xóa post.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Pin/Unpin post
   */
  const pinPost = useCallback(
    async (postId: string): Promise<Post> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PostService.pinPost(postId);
        const updated =
          (response.data as ApiResponse<Post>).data || (response.data as any);
        setPosts(prev =>
          prev.map(p => (p.id === postId ? { ...p, ...updated } : p)),
        );
        return updated;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể pin/unpin post.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Vote cho post (UP hoặc DOWN)
   */
  const votePost = useCallback(
    async (postId: string, payload: PostVoteRequest): Promise<Post> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PostService.votePost(postId, payload);
        const updated =
          (response.data as ApiResponse<Post>).data || (response.data as any);
        setPosts(prev =>
          prev.map(p => (p.id === postId ? { ...p, ...updated } : p)),
        );
        return updated;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể vote post.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Lấy danh sách comments của post
   */
  const fetchPostComments = useCallback(
    async (
      postId: string,
      params?: {
        pageNo?: number;
        pageSize?: number;
      },
    ): Promise<CommentDetail[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PostService.getPostComments(postId, params);
        const list = normalizeCommentResponse(response.data);
        setPostComments(list);
        return list;
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
  const createPostComment = useCallback(
    async (
      postId: string,
      payload: CreateCommentRequest,
    ): Promise<CommentDetail> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PostService.createPostComment(postId, payload);
        const comment =
          (response.data as ApiResponse<CommentDetail>).data ||
          (response.data as any);
        setPostComments(prev => [comment, ...prev]);
        return comment;
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
   * Lấy danh sách tất cả posts (feed)
   */
  const fetchAllPosts = useCallback(
    async (params?: {
      pageNo?: number;
      pageSize?: number;
      subject?: string;
      communityId?: string;
    }): Promise<Post[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PostService.getAllPosts(params);
        const list = normalizePostResponse(response.data);
        setPosts(list);
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
   * Lấy chi tiết một post
   */
  const fetchPostById = useCallback(
    async (postId: string): Promise<Post> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PostService.getPostById(postId);
        const post =
          (response.data as ApiResponse<Post>).data || (response.data as any);
        return post;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tải chi tiết post.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Lấy danh sách posts của user hiện tại
   */
  const fetchMyPosts = useCallback(
    async (params?: {
      pageNo?: number;
      pageSize?: number;
    }): Promise<Post[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PostService.getMyPosts(params);
        const list = normalizePostResponse(response.data);
        setPosts(list);
        return list;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể tải danh sách posts của bạn.';
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
  const createPost = useCallback(
    async (
      communityId: string,
      data: {
        title: string;
        content: string;
        image?: any;
      },
    ): Promise<Post> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await PostService.createPost(communityId, data);
        const post =
          (response.data as ApiResponse<Post>).data || (response.data as any);
        setPosts(prev => [post, ...prev]);
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

  return {
    // state
    posts,
    postComments,
    isLoading,
    error,

    // actions
    fetchAllPosts,
    fetchPostById,
    updatePost,
    deletePost,
    pinPost,
    votePost,
    fetchPostComments,
    createPostComment,
    fetchMyPosts,
    createPost,
  };
};

export default usePost;

