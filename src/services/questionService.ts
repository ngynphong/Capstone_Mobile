import axiosInstance from '../configs/axios';
import type { ApiResponse, PageInfo } from '../types/apiTypes';
import type { QuestionV2 } from '../types/question';
import type { AxiosResponse } from 'axios';

/**
 * Service quản lý các API liên quan đến câu hỏi (questions-v2).
 */
const QuestionService = {
  /**
   * 🔹 Lấy danh sách tất cả câu hỏi với phân trang và tìm kiếm.
   * (GET /questions-v2)
   */
  async getAll(
    params?: { pageNo?: number; pageSize?: number; keyword?: string }
  ): Promise<AxiosResponse<ApiResponse<PageInfo<QuestionV2>>>> {
    return axiosInstance.get("/questions-v2", { params });
  },

  /**
   * 🔹 Lấy danh sách câu hỏi theo subjectId.
   * (GET /questions-v2/subject/{subjectId})
   */
  async getBySubjectId(
    subjectId: string
  ): Promise<AxiosResponse<ApiResponse<QuestionV2[]>>> {
    return axiosInstance.get(`/questions-v2/subject/${subjectId}`);
  },

  /**
   * 🔹 Tìm kiếm câu hỏi.
   * (GET /questions-v2/search)
   */
  async search(
    params: Record<string, unknown>
  ): Promise<AxiosResponse<ApiResponse<QuestionV2[]>>> {
    return axiosInstance.get("/questions-v2/search", { params });
  },
};

export default QuestionService;
