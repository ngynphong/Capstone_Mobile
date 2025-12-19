import type { ApiResponse, PageInfo } from './apiTypes';

/**
 * Thông tin cơ bản của một lesson.
 * Các field được để optional vì backend có thể chưa cố định hoàn toàn.
 */
export interface Lesson {
  id: string;
  learningMaterialId?: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  documentUrl?: string;
  durationInSeconds?: number;
  orderIndex?: number;
  fileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Thông tin video lesson trả về từ /videos.
 */
export interface LessonVideo {
  id: string;
  lessonId?: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  durationInSeconds?: number;
  uri?: string;
  videoUrl?: string;
}

/**
 * Kết quả phân trang chung cho danh sách lesson.
 */
export type LessonListResponse = ApiResponse<PageInfo<Lesson>>;

/**
 * Kết quả trả về khi gọi GET /lessons/{id}.
 */
export type LessonDetailResponse = ApiResponse<Lesson>;

/**
 * Kết quả trả về khi gọi GET /videos.
 */
export type LessonVideosResponse = ApiResponse<LessonVideo[]>;

/**
 * Kết quả trả về khi lấy lesson theo learning material.
 * Có thể là array trực tiếp hoặc PageInfo structure
 */
export type LessonByMaterialResponse = ApiResponse<Lesson[] | PageInfo<Lesson>>;

/**
 * Request body để lưu progress của lesson video.
 */
export interface SaveLessonProgressRequest {
  currentTime?: number; // Thời gian hiện tại đã xem (giây)
  progressPercentage?: number; // Phần trăm hoàn thành (0-100)
  completed?: boolean; // Đã hoàn thành lesson chưa
  [key: string]: unknown; // Cho phép các field khác từ backend
}

