import { useCallback, useEffect, useState } from 'react';
import QuestionService from '../services/questionService';
import type { QuestionV2 } from '../types/question';
import { useAppToast } from '../utils/toast';
import type { ApiResponse, PageInfo } from '../types/apiTypes';

/**
 * Hook để lấy danh sách tất cả câu hỏi với phân trang và tìm kiếm.
 */
export const useGetAllQuestions = (
  initialParams: { pageNo?: number; pageSize?: number; keyword?: string } = {},
) => {
  const [questions, setQuestions] = useState<QuestionV2[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useAppToast();

  // Trạng thái phân trang và filter
  const [params, setParams] = useState({
    pageNo: 0,
    pageSize: 10,
    ...initialParams,
  });

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Xử lý lỗi chung
  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    toast.error(message);
    return message;
  };

  // Hàm gọi API
  const fetchQuestions = useCallback(
    async (newParams: typeof params) => {
      setLoading(true);
      setError(null);
      try {
        const res = await QuestionService.getAll(newParams);

        if (res.data.code === 0 || res.data.code === 1000) {
          const pageData = res.data.data as PageInfo<QuestionV2>;
          setQuestions(pageData.items || []);
          setTotalElements(pageData.totalElement || pageData.totalElements || 0);
          setTotalPages(pageData.totalPage || 0);
          setParams(prev => ({
            ...prev,
            pageNo: pageData.pageNo || 0,
            pageSize: pageData.pageSize || 10,
          }));
        } else {
          throw new Error(res.data.message || 'Failed to fetch questions');
        }
      } catch (err) {
        handleError(err, 'Không thể tải danh sách câu hỏi');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch dữ liệu lần đầu khi component mount
  useEffect(() => {
    fetchQuestions(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần lúc đầu

  /**
   * Hàm để set filter và gọi lại API
   */
  const applyFilters = useCallback(
    (filters: Omit<typeof params, 'pageNo' | 'pageSize'>) => {
      const newParams = {
        pageNo: 0,
        pageSize: params.pageSize || 10,
        ...filters,
      };
      setParams(newParams);
      fetchQuestions(newParams);
    },
    [params.pageSize, fetchQuestions],
  );

  /**
   * Hàm xử lý thay đổi trang (cho phân trang)
   */
  const handlePageChange = (newPage: number, newSize: number) => {
    const newParams = { ...params, pageNo: newPage - 1, pageSize: newSize };
    setParams(newParams);
    fetchQuestions(newParams);
  };

  return {
    questions,
    loading,
    error,
    pageNo: (params.pageNo || 0) + 1, // 1-based for UI
    pageSize: params.pageSize || 10,
    totalElements,
    totalPages,
    filters: params,
    fetchQuestions,
    applyFilters,
    handlePageChange,
  };
};

/**
 * Hook để lấy danh sách câu hỏi theo subjectId.
 */
export const useGetQuestionsBySubjectId = (subjectId: string | undefined) => {
  const [questions, setQuestions] = useState<QuestionV2[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useAppToast();

  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    toast.error(message);
    return message;
  };

  const fetchQuestionsBySubjectId = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await QuestionService.getBySubjectId(id);
      if (res.data.code === 0 || res.data.code === 1000) {
        setQuestions(res.data.data || []);
        return res.data.data;
      } else {
        throw new Error(res.data.message || 'Failed to fetch questions by subject');
      }
    } catch (err) {
      handleError(err, 'Không thể tải danh sách câu hỏi theo môn học');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subjectId) {
      fetchQuestionsBySubjectId(subjectId);
    }
  }, [subjectId, fetchQuestionsBySubjectId]);

  return {
    questions,
    loading,
    error,
    fetchQuestionsBySubjectId,
  };
};

/**
 * Hook để tìm kiếm câu hỏi.
 */
export const useSearchQuestions = () => {
  const [questions, setQuestions] = useState<QuestionV2[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useAppToast();

  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    toast.error(message);
    return message;
  };

  const searchQuestions = useCallback(async (searchParams: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await QuestionService.search(searchParams);
      if (res.data.code === 0 || res.data.code === 1000) {
        setQuestions(res.data.data || []);
        return res.data.data;
      } else {
        throw new Error(res.data.message || 'Failed to search questions');
      }
    } catch (err) {
      handleError(err, 'Không thể tìm kiếm câu hỏi');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    questions,
    loading,
    error,
    searchQuestions,
  };
};
