import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppToast } from '../utils/toast'; // Import toast của mobile
import ExamService from '../services/examService'; // Import service tổng của mobile
import type {
  ActiveExam,
  ExamResult,
  RequestReviewPayload,
  SaveProgressPayload,
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
          throw new Error(res.data.message || 'Failed to start exam');
        }
      } catch (err) {
        handleError(err, 'Failed to start exam');
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
            res.data.message || 'Failed to start combo exam',
          );
        }
      } catch (err) {
        handleError(err, 'Failed to start combo exam');
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
            res.data.message || 'Failed to start random combo exam',
          );
        }
      } catch (err) {
        handleError(err, 'Failed to start random combo exam');
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
          toast.success('Submit successfully!');
          return res.data.data;
        } else {
          throw new Error(res.data.message || 'Submit failed!');
        }
      } catch (err) {
        const errorMessage = handleError(err, 'Submit failed!');
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
        toast.success('Rate successfully!');
      } catch (err) {
        handleError(err, 'Rate failed!');
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
        throw new Error(res.data.message || 'Failed to load attempt result');
      }
    } catch (err) {
      handleError(err, 'Failed to load attempt result');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Subscribe to grading result via SSE (Server-Sent Events) using fetch with streaming.
   * Adapted from web implementation for React Native.
   * @param attemptId - The attempt ID to subscribe to
   * @param onStatusUpdate - Callback for status updates (e.g., "Waiting for grading...")
   * @param timeoutMs - Timeout in milliseconds (default: 60000ms = 60s)
   * @returns Promise that resolves with the result when grading is complete
   */
  const subscribeAttemptResult = useCallback(
    async (
      attemptId: string,
      timeoutMs: number = 60000,
      onStatusUpdate?: (status: string) => void
    ): Promise<AttemptResultDetail | null> => {
      setLoading(true);
      setError(null);

      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem('accessToken');
      const sseUrl = `${API_URL}/exam-attempts/${attemptId}/subscribe`;

      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      try {
        console.log('[SSE] Connecting to:', sseUrl);

        const response = await fetch(sseUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('[SSE] Stream closed by server');
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE format: "event:xxx\ndata:yyy\n\n"
          const lines = buffer.split('\n');
          buffer = ''; // Reset buffer

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line === '') continue;

            // Handle event line
            if (line.startsWith('event:')) {
              const eventType = line.substring(6).trim();
              console.log('[SSE] Event type:', eventType);
              continue;
            }

            // Handle data line
            if (line.startsWith('data:')) {
              const data = line.substring(5).trim();
              console.log('[SSE] Received data:', data);

              // Check if it's a status update (waiting message)
              if (data.includes('Waiting') || data.includes('grading') || data.includes('Processing')) {
                onStatusUpdate?.(data);
                continue;
              }

              // Try to parse as JSON (final result)
              try {
                const result = JSON.parse(data);

                // Check if result contains attemptId (indicates final result)
                if (result && (result.attemptId || result.data?.attemptId)) {
                  const finalResult = result.data || result;
                  console.log('[SSE] Grading completed:', finalResult);

                  clearTimeout(timeoutId);
                  reader.cancel();
                  setLoading(false);
                  setAttemptResultDetail(finalResult as AttemptResultDetail);
                  toast.success('Result details are ready!');
                  return finalResult as AttemptResultDetail;
                }
              } catch {
                // Not JSON, treat as status message
                onStatusUpdate?.(data);
              }
            } else {
              // Keep unparsed line in buffer for next iteration
              buffer = lines.slice(i).join('\n');
              break;
            }
          }
        }

        // Stream ended without result - try to fetch directly
        console.log('[SSE] Stream ended, fetching result directly...');
        clearTimeout(timeoutId);
        const res = await ExamService.getResult(attemptId);
        if (res.data.code === 0 || res.data.code === 1000) {
          setLoading(false);
          setAttemptResultDetail(res.data.data);
          toast.success('Result details are ready!');
          return res.data.data;
        }

        setLoading(false);
        setError('Failed to get grading result');
        return null;
      } catch (err) {
        clearTimeout(timeoutId);
        const error = err as Error;

        // Handle timeout
        if (error.name === 'AbortError') {
          setLoading(false);
          setError('GRADING_TIMEOUT');
          throw new Error('GRADING_TIMEOUT');
        }

        setLoading(false);
        setError('Failed to connect to grading service');

        // Fallback: try to fetch result directly
        try {
          const res = await ExamService.getResult(attemptId);
          if (res.data.code === 0 || res.data.code === 1000) {
            setAttemptResultDetail(res.data.data);
            toast.success('Result details are ready!');
            return res.data.data;
          }
        } catch {
          // Ignore fallback error
        }

        return null;
      }
    },
    []
  );

  /**
  * Lưu tiến độ làm bài (thường dùng cho Auto-save hoặc nút "Lưu tạm").
  * Hàm này thường không nên hiện toast success liên tục để tránh spam, 
  * trừ khi có lỗi.
  */
  const saveProgress = useCallback(
    async (attemptId: string, payload: SaveProgressPayload) => {
      // Lưu ý: Có thể không cần set loading toàn cục nếu muốn save ngầm (silent save)
      // Ở đây mình set loading để có thể hiển thị trạng thái "Đang lưu..."
      setLoading(true);
      try {
        const res = await ExamService.saveProgress(attemptId, payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          // Success - có thể return true để component biết đã lưu xong
          return true;
        } else {
          console.error("Save progress failed:", res.data.message);
          return false;
        }
      } catch (err) {
        console.error("Save progress error:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Khôi phục đáp án từ savedAnswer trong ActiveExam
   */
  const restoreSavedAnswers = useCallback(
    (activeExam: ActiveExam | null) => {
      if (!activeExam?.savedAnswer) {
        return null;
      }
      return activeExam.savedAnswer;
    },
    []
  );

  /**
   * Kiểm tra xem có đáp án đã lưu hay không
   */
  const hasSavedAnswers = useCallback(
    (activeExam: ActiveExam | null) => {
      return activeExam?.savedAnswer !== null &&
        activeExam?.savedAnswer?.answers !== undefined &&
        activeExam.savedAnswer.answers.length > 0;
    },
    []
  );

  const requestReview = useCallback(
    async (attemptId: string, payload: RequestReviewPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await ExamService.requestReview(attemptId, payload);
        if (res.data.code === 0 || res.data.code === 1000) {
          toast.success("Request review successfully!");
          return true;
        } else {
          throw new Error(res.data.message || "Failed to request review");
        }
      } catch (err) {
        handleError(err, "Failed to request review");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );


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
    saveProgress,
    restoreSavedAnswers,
    hasSavedAnswers,
    requestReview
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
    fetchHistory(0, 20, ['startTime_desc']); // Keep default sorting for initial load
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
