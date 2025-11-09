import { useState, useCallback, useEffect } from 'react';
import { useAppToast } from '../utils/toast'; // Import toast của mobile
import ExamService from '../services/examService'; // Import service tổng của mobile
import type {
  ActiveExam,
  ExamResult,
  SubmitExamPayload,
} from '../types/examTypes';
import type {
  AttemptResultDetail,
  RateAttemptPayload,
  StartComboPayload,
  StartComboRandomPayload,
  StartSinglePayload,
  HistoryRecord,
} from '../types/examTypes';
import type { ApiResponse, PageInfo } from '../types/apiTypes';

/**
 * 🔹 Hook quản lý logic khi BẮT ĐẦU và NỘP BÀI thi.
 * (Ported từ web `useExamAttempt.ts`)
 */
export const useExamAttempt = () => {
  const [activeAttempt, setActiveAttempt] = useState<ActiveExam | null>(null);
  const [submissionResult, setSubmissionResult] = useState<ExamResult | null>(
    null,
  );
  const [attemptResultDetail, setAttemptResultDetail] =
    useState<AttemptResultDetail | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useAppToast();
  /**
   * Xử lý lỗi chung và hiển thị toast.
   */
  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    // Giả định cấu trúc lỗi từ axios
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    toast.error(message);
    return message;
  };

  /**
   * Bắt đầu bài thi đơn lẻ.
   */
  const startSingleAttempt = useCallback(
    async (payload: StartSinglePayload) => {
      setLoading(true);
      setError(null);
      try {
        // Đã đổi tên hàm: ExamService.startSingleAttempt
        const res = await ExamService.startSingleAttempt(payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setActiveAttempt(res.data.data);
          return res.data.data;
        } else {
          throw new Error(res.data.message || 'Không thể bắt đầu bài thi');
        }
      } catch (err) {
        handleError(err, 'Không thể bắt đầu bài thi');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Bắt đầu bài thi tổ hợp (tự chọn).
   */
  const startComboAttempt = useCallback(
    async (payload: StartComboPayload) => {
      setLoading(true);
      setError(null);
      try {
        // Đã đổi tên hàm: ExamService.startComboAttempt
        const res = await ExamService.startComboAttempt(payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setActiveAttempt(res.data.data);
          return res.data.data;
        } else {
          throw new Error(
            res.data.message || 'Không thể bắt đầu bài thi tổ hợp',
          );
        }
      } catch (err) {
        handleError(err, 'Không thể bắt đầu bài thi tổ hợp');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Bắt đầu bài thi tổ hợp (ngẫu nhiên).
   */
  const startComboRandomAttempt = useCallback(
    async (payload: StartComboRandomPayload) => {
      setLoading(true);
      setError(null);
      try {
        // Đã đổi tên hàm: ExamService.startComboRandomAttempt
        const res = await ExamService.startComboRandomAttempt(payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setActiveAttempt(res.data.data);
          return res.data.data;
        } else {
          throw new Error(
            res.data.message || 'Không thể bắt đầu bài thi ngẫu nhiên',
          );
        }
      } catch (err) {
        handleError(err, 'Không thể bắt đầu bài thi ngẫu nhiên');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Nộp bài thi.
   */
  const submitAttempt = useCallback(
    async (attemptId: string, payload: SubmitExamPayload) => {
      setLoading(true);
      setError(null);
      try {
        // Đã đổi tên hàm: ExamService.submitAttempt
        const res = await ExamService.submitAttempt(attemptId, payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          setSubmissionResult(res.data.data);
          setActiveAttempt(null); // Xóa bài thi đang làm
          toast.success('Nộp bài thành công!');
          return res.data.data;
        } else {
          throw new Error(res.data.message || 'Không thể nộp bài');
        }
      } catch (err) {
        const errorMessage = handleError(err, 'Không thể nộp bài');
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Đánh giá (rate) bài thi.
   */
  const rateAttempt = useCallback(
    async (attemptId: string, payload: RateAttemptPayload) => {
      setLoading(true);
      setError(null);
      try {
        // Đã đổi tên hàm: ExamService.rateAttempt
        await ExamService.rateAttempt(attemptId, payload);
        toast.success('Đánh giá của bạn đã được gửi!');
      } catch (err) {
        handleError(err, 'Không thể gửi đánh giá');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Lấy kết quả chi tiết của một lần thi.
   */
  const fetchAttemptResult = useCallback(async (attemptId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Tên hàm khớp: ExamService.getResult
      const res = await ExamService.getResult(attemptId);
      if (res.data.code === 0 || res.data.code === 1000) {
        setAttemptResultDetail(res.data.data);
        return res.data.data;
      } else {
        throw new Error(res.data.message || 'Không thể tải kết quả chi tiết');
      }
    } catch (err) {
      handleError(err, 'Không thể tải kết quả chi tiết');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy kết quả chi tiết của một lần thi (subscribe).
   */
  const subscribeAttemptResult = useCallback(async (attemptId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Tên hàm khớp: ExamService.subscribe
      const res = await ExamService.subscribe(attemptId);
      if (res.data.code === 0 || res.data.code === 1000) {
        setAttemptResultDetail(res.data.data);
        return res.data.data;
      } else {
        throw new Error(res.data.message || 'Không thể tải kết quả chi tiết');
      }
    } catch (err) {
      handleError(err, 'Không thể tải kết quả chi tiết');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    activeAttempt,
    submissionResult,
    attemptResultDetail,
    startSingleAttempt,
    startComboAttempt,
    startComboRandomAttempt,
    submitAttempt,
    rateAttempt,
    fetchAttemptResult,
    subscribeAttemptResult,
  };
};

/**
 * 🔹 Hook quản lý LỊCH SỬ THI (my-history).
 * (Ported từ web `useExamAttempt.ts`)
 */
export const useExamAttemptHistory = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo<HistoryRecord> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sorts, setSorts] = useState<string[]>(['startTime_desc']);
  const toast = useAppToast();
  
  if (!sorts) {
    setSorts(['startTime_desc']);
  }

  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const message = apiMessage || e.message || defaultMessage;
    setError(message);
    toast.error(message);
  };

  const fetchHistory = useCallback(
    async (page = 0, size = 10, sorts?: string[]) => {
      setLoading(true);
      setError(null);
      try {
        // Tên hàm khớp: ExamService.getMyHistory
        const res = await ExamService.getMyHistory({
          pageNo: page,
          pageSize: size,
          sorts,
        });
        if (res.data.code === 0 || res.data.code === 1000) {
          const data = res.data.data;
          // Handle different response structures
          if (data.items) {
            setHistory(data.items as unknown as HistoryRecord[]);
            setPageInfo(data as unknown as PageInfo<HistoryRecord>);
          } else if (Array.isArray(data)) {
            setHistory(data as unknown as HistoryRecord[]);
            setPageInfo({
              pageNo: 0,
              pageSize: data.length,
              totalElements: data.length,
              totalElement: data.length,
            } as PageInfo<HistoryRecord>);
          } else {
            setHistory([]);
            setPageInfo(null);
          }
        } else {
          throw new Error(res.data.message || 'Không thể tải lịch sử thi');
        }
      } catch (err) {
        handleError(err, 'Không thể tải lịch sử thi');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchHistory(0, 10, ['startTime_desc']); // Keep default sorting for initial load
  }, [fetchHistory]);

  const handlePageChange = (newPage: number, newSize: number) => {
    fetchHistory(newPage - 1, newSize, ['startTime_desc']);
  };

  return {
    history,
    pageInfo,
    loading,
    error,
    fetchHistory,
    handlePageChange,
    setSorts,
  };
};