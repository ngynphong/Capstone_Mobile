import { useCallback, useEffect, useState } from 'react';
import ExamService from '../services/examService';
import type {
  BrowseExamTemplateParams,
  ExamTemplate,
} from '../types/examTypes'; // Import types đã cập nhật
import { useAppToast } from '../utils/toast';
import type { ApiResponse, PageInfo } from '../types/apiTypes';

/**
 * Hook để duyệt (browse) danh sách bài thi (templates) cho học sinh.
 * (Ported từ web `useExamBrowser.ts`)
 */
export const useBrowseExams = (
  initialParams: BrowseExamTemplateParams = {},
) => {
  const [templates, setTemplates] = useState<ExamTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useAppToast();
  // Trạng thái phân trang và filter
  const [params, setParams] = useState<BrowseExamTemplateParams>({
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
  const fetchTemplates = useCallback(
    async (newParams: BrowseExamTemplateParams) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamService.browseTemplates(newParams);

        if (res.data.code === 0 || res.data.code === 1000) {
          const pageData = res.data.data as PageInfo<ExamTemplate>; // Sử dụng PageInfo
          setTemplates(pageData.items || []);
          setTotalElements(pageData.totalElement || pageData.totalElements || 0);
          setTotalPages(pageData.totalPage || 0);
          setParams(prev => ({
            ...prev,
            pageNo: pageData.pageNo || 0,
            pageSize: pageData.pageSize || 10,
          }));
        } else {
          throw new Error(res.data.message || 'Failed to fetch browse templates');
        }
      } catch (err) {
        handleError(err, 'Không thể tải danh sách bài thi');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch dữ liệu lần đầu khi component mount
  useEffect(() => {
    fetchTemplates(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần lúc đầu

  /**
   * Hàm để set filter và gọi lại API
   */
  const applyFilters = useCallback(
    (filters: Omit<BrowseExamTemplateParams, 'pageNo' | 'pageSize'>) => {
      const newParams: BrowseExamTemplateParams = {
        pageNo: 0,
        pageSize: params.pageSize || 10,
        ...filters,
      };
      setParams(newParams);
      fetchTemplates(newParams);
    },
    [params.pageSize, fetchTemplates],
  );

  /**
   * Hàm xử lý thay đổi trang (cho phân trang)
   */
  const handlePageChange = (newPage: number, newSize: number) => {
    const newParams = { ...params, pageNo: newPage - 1, pageSize: newSize };
    setParams(newParams);
    fetchTemplates(newParams);
  };

  return {
    templates,
    loading,
    error,
    pageNo: (params.pageNo || 0) + 1, // 1-based for UI
    pageSize: params.pageSize || 10,
    totalElements,
    totalPages,
    filters: params,
    fetchTemplates,
    applyFilters,
    handlePageChange,
  };
};

/**
 * Hook để lấy chi tiết một bài thi (template).
 */
export const useExamDetails = (examId: string | undefined) => {
  const [exam, setExam] = useState<ExamTemplate | null>(null);
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

  const fetchExamById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ExamService.getTemplateById(id);
      if (res.data.code === 0 || res.data.code === 1000) {
        setExam(res.data.data);
        return res.data.data;
      } else {
        throw new Error(res.data.message || 'Failed to fetch exam details');
      }
    } catch (err) {
      handleError(err, 'Failed to fetch exam details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (examId) {
      fetchExamById(examId);
    }
  }, [examId, fetchExamById]);

  return {
    exam,
    loading,
    error,
    fetchExamById,
  };
};