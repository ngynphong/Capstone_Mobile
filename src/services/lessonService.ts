import type { AxiosResponse } from 'axios';
import axiosInstance from '../configs/axios';
import type {
  LessonByMaterialResponse,
  LessonDetailResponse,
  LessonListResponse,
  LessonVideosResponse,
} from '../types/lessonTypes';

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

  /**
   * GET /videos
   * Lấy danh sách video lesson.
   */
  getVideos(): Promise<AxiosResponse<LessonVideosResponse>> {
    return axiosInstance.get('/videos');
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
   * GET /lessons/by-learning-material/{learningMaterialId}
   * Lấy lesson theo learning material.
   */
  getLessonsByLearningMaterial(
    learningMaterialId: string,
  ): Promise<AxiosResponse<LessonByMaterialResponse>> {
    return axiosInstance.get(
      `/lessons/by-learning-material/${learningMaterialId}`,
    );
  },
};

export default LessonService;

