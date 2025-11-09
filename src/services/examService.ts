import axiosInstance from '../configs/axios';
import type { ApiResponse, PageInfo } from '../types/apiTypes';
import type {
  BrowseExamTemplateParams,
  ExamTemplate,
  ActiveExam,
  SubmitExamPayload,
  ExamResult,
  StartSinglePayload,
  StartComboPayload,
  StartComboRandomPayload,
  RateAttemptPayload,
  AttemptResultDetail,
} from '../types/examTypes';
import type { AxiosResponse } from 'axios';

// API trả về danh sách có phân trang
type TemplateListResponse = ApiResponse<PageInfo<ExamTemplate>>;
// API trả về chi tiết 1 template
type TemplateDetailResponse = ApiResponse<ExamTemplate>;

/**
 * Service quản lý việc lấy template bài thi VÀ các lần thực hiện bài thi (attempts).
 * (Ported từ examService.ts và examAttemptService.ts của web)
 */
const ExamService = {
  // --- Exam Template ---

  /**
   * 🔹 Lấy danh sách bài thi (templates) cho học sinh duyệt.
   * (GET /exam-templates/browse)
   */
  browseTemplates: (params: BrowseExamTemplateParams) => {
    return axiosInstance.get<TemplateListResponse>('/exam-templates/browse', {
      params,
    });
  },

  /**
   * 🔹 Lấy chi tiết một bài thi (template).
   * (GET /exam-templates/{id})
   */
  getTemplateById: (
    id: string,
  ): Promise<AxiosResponse<TemplateDetailResponse>> => {
    return axiosInstance.get(`/exam-templates/${id}`);
  },

  // --- Exam Attempt ---

  /**
   * 🔹 Bắt đầu một bài thi đơn lẻ.
   * (POST /exam-attempts/start-single)
   */
  startSingleAttempt: (
    data: StartSinglePayload,
  ): Promise<AxiosResponse<ApiResponse<ActiveExam>>> => {
    return axiosInstance.post('/exam-attempts/start-single', data);
  },

  /**
   * 🔹 Bắt đầu một bài thi tổ hợp (tự chọn).
   * (POST /exam-attempts/start-combo)
   */
  startComboAttempt: (
    data: StartComboPayload,
  ): Promise<AxiosResponse<ApiResponse<ActiveExam>>> => {
    return axiosInstance.post('/exam-attempts/start-combo', data);
  },

  /**
   * 🔹 Bắt đầu một bài thi tổ hợp (ngẫu nhiên).
   * (POST /exam-attempts/start-combo-random)
   */
  startComboRandomAttempt: (
    data: StartComboRandomPayload,
  ): Promise<AxiosResponse<ApiResponse<ActiveExam>>> => {
    return axiosInstance.post('/exam-attempts/start-combo-random', data);
  },

  /**
   * 🔹 Nộp bài thi.
   * (POST /exam-attempts/{attemptId}/submit)
   */
  submitAttempt: (
    attemptId: string,
    data: SubmitExamPayload,
  ): Promise<AxiosResponse<ApiResponse<ExamResult>>> => {
    return axiosInstance.post(`/exam-attempts/${attemptId}/submit`, data);
  },

  /**
   * 🔹 Đánh giá (rate) một lần thi.
   * (POST /exam-attempts/{attemptId}/rate)
   */
  rateAttempt: (
    attemptId: string,
    data: RateAttemptPayload,
  ): Promise<AxiosResponse<ApiResponse<string>>> => {
    return axiosInstance.post(`/exam-attempts/${attemptId}/rate`, data);
  },

  /**
   * 🔹 Lấy kết quả chi tiết của một lần thi.
   * (GET /exam-attempts/{attemptId}/result)
   */
  getResult: (
    attemptId: string,
  ): Promise<AxiosResponse<ApiResponse<AttemptResultDetail>>> => {
    return axiosInstance.get(`/exam-attempts/${attemptId}/result`);
  },

  /**
   * 🔹 Lấy lịch sử thi của cá nhân (phân trang).
   * (GET /exam-attempts/my-history)
   */
  getMyHistory: (params: {
    pageNo?: number;
    pageSize?: number;
    sorts?: string[];
  }): Promise<AxiosResponse<ApiResponse<PageInfo<ExamResult>>>> => {
    return axiosInstance.get('/exam-attempts/my-history', { params });
  },

  /**
   * 🔹 Lấy kết quả chi tiết của một lần thi (subscribe).
   * (GET /exam-attempts/{attemptId}/subscribe)
   */
  subscribe: (
    attemptId: string,
  ): Promise<AxiosResponse<ApiResponse<AttemptResultDetail>>> => {
    return axiosInstance.get(`/exam-attempts/${attemptId}/subscribe`);
  },
};

export default ExamService;