import type { AxiosResponse } from 'axios';
import axiosInstance from '../configs/axios';
import type { ApiResponse } from '../types/apiTypes';
import type {
  LessonByMaterialResponse,
  LessonDetailResponse,
  LessonListResponse,
  LessonVideosResponse,
  SaveLessonProgressRequest,
} from '../types/lessonTypes';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const PLACEHOLDER_LESSON =
  'https://placehold.co/600x400?text=Lesson+Resource';

export interface LessonListParams {
  pageNo?: number;
  pageSize?: number;
  sorts?: string[];
  search?: string;
  [key: string]: unknown;
}

const LessonService = {
  /**
   * GET /{fileName}/lesson
   * Tải file lesson (ví dụ video/pdf) theo tên file.
   * Dùng responseType arraybuffer để React Native có thể xử lý linh hoạt.
   */
  getLessonAsset(fileName: string): Promise<AxiosResponse<ArrayBuffer>> {
    const safeFileName = encodeURIComponent(fileName.trim());
    return axiosInstance.get(`/${safeFileName}/lesson`, {
      responseType: 'arraybuffer',
    });
  },

  getLessonAssetUrl(fileName?: string): string {
    if (!fileName || fileName.trim().length === 0 || fileName === 'string') {
      return PLACEHOLDER_LESSON;
    }
    if (!API_BASE_URL) {
      return PLACEHOLDER_LESSON;
    }
    const safeName = encodeURIComponent(fileName.trim());
    return `${API_BASE_URL}/${safeName}/lesson`;
  },

  /**
   * GET /videos?fileName=
   * Lấy danh sách video lesson hoặc một video cụ thể theo fileName.
   */
  getVideos(nameFile?: string): Promise<AxiosResponse<LessonVideosResponse>> {
    const params = nameFile ? { nameFile } : undefined;
    return axiosInstance.get('/videos', { params });
  },

  /**
   * GET /lessons/{id}
   * Lấy chi tiết lesson theo id.
   */
  getLessonById(id: string): Promise<AxiosResponse<LessonDetailResponse>> {
    return axiosInstance.get(`/lessons/${id}`);
  },

  /**
   * GET /lessons
   * Lấy danh sách lesson có phân trang.
   */
  getLessons(
    params?: LessonListParams,
  ): Promise<AxiosResponse<LessonListResponse>> {
    return axiosInstance.get('/lessons', { params });
  },

  /**
   * GET /lessons/progress/by-learning-material/{learningMaterialId}
   * Lấy lesson theo learning material với progress của user.
   */
  getLessonsByLearningMaterial(
    learningMaterialId: string,
  ): Promise<AxiosResponse<LessonByMaterialResponse>> {
    return axiosInstance.get(
      `/lessons/progress/by-learning-material/${learningMaterialId}`,
    );
  },

  /**
   * PUT /lessons/{lessonId}/progress?lastWatchedSecond={seconds}
   * Lưu tiến độ video lesson.
   * API yêu cầu lastWatchedSecond là query parameter, không phải body.
   */
  saveLessonProgress(
    lessonId: string,
    lastWatchedSecond: number,
  ): Promise<AxiosResponse<ApiResponse<unknown>>> {
    return axiosInstance.put(`/lessons/${lessonId}/progress`, null, {
      params: {
        lastWatchedSecond: Math.round(lastWatchedSecond),
      },
    });
  },
};

export default LessonService;

