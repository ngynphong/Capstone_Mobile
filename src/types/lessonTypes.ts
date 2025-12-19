import type { ApiResponse, PageInfo } from './apiTypes';

/**
 * Basic information of a lesson.
 * Fields are optional because backend may not be fully fixed yet.
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
  // Progress fields from API /lessons/progress/by-learning-material
  completed?: boolean; // Whether the lesson is completed
  progressPercentage?: number; // Completion percentage (0-100)
  nextToContinue?: boolean; // Next lesson to continue
  lastWatchedSecond?: number; // Last watched second
}

/**
 * Video lesson information returned from /videos.
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
 * Paginated result for lesson list.
 */
export type LessonListResponse = ApiResponse<PageInfo<Lesson>>;

/**
 * Response when calling GET /lessons/{id}.
 */
export type LessonDetailResponse = ApiResponse<Lesson>;

/**
 * Response when calling GET /videos.
 */
export type LessonVideosResponse = ApiResponse<LessonVideo[]>;

/**
 * Response when getting lessons by learning material.
 * Can be a direct array or PageInfo structure
 */
export type LessonByMaterialResponse = ApiResponse<Lesson[] | PageInfo<Lesson>>;

/**
 * Request body to save lesson video progress.
 */
export interface SaveLessonProgressRequest {
  currentTime?: number; // Current watched time (seconds)
  progressPercentage?: number; // Completion percentage (0-100)
  completed?: boolean; // Whether the lesson is completed
  [key: string]: unknown; // Allow other fields from backend
}

