import { useCallback, useState } from 'react';
import LessonService, {
  LessonListParams,
} from '../services/lessonService';
import type {
  Lesson,
  LessonVideo,
  LessonDetailResponse,
  LessonListResponse,
  LessonByMaterialResponse,
  LessonVideosResponse,
} from '../types/lessonTypes';
import type { PageInfo } from '../types/apiTypes';

interface LessonState {
  items: Lesson[];
  pageInfo: PageInfo<Lesson> | null;
}

const INITIAL_STATE: LessonState = {
  items: [],
  pageInfo: null,
};

export const useLesson = () => {
  const [lessons, setLessons] = useState<LessonState>(INITIAL_STATE);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [videos, setVideos] = useState<LessonVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown, fallback: string) => {
    const message =
      err instanceof Error ? err.message : fallback;
    setError(message);
    return Promise.reject(err);
  };

  const fetchLessons = useCallback(
    async (params?: LessonListParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await LessonService.getLessons(params);
        const payload: LessonListResponse['data'] =
          response.data.data;

        setLessons({
          items: payload.items ?? payload.content ?? [],
          pageInfo: payload,
        });
        return payload;
      } catch (err) {
        return handleError(err, 'Không thể tải danh sách bài học');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchLessonById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: LessonDetailResponse =
        (await LessonService.getLessonById(id)).data;
      setCurrentLesson(response.data);
      return response.data;
    } catch (err) {
      return handleError(err, 'Không thể tải chi tiết bài học');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLessonsByMaterial = useCallback(
    async (learningMaterialId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response: LessonByMaterialResponse =
          (await LessonService.getLessonsByLearningMaterial(
            learningMaterialId,
          )).data;
        setLessons({
          items: response.data,
          pageInfo: null,
        });
        return response.data;
      } catch (err) {
        return handleError(err, 'Không thể tải lesson theo tài liệu');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchLessonVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: LessonVideosResponse =
        (await LessonService.getVideos()).data;
      setVideos(response.data);
      return response.data;
    } catch (err) {
      return handleError(err, 'Không thể tải danh sách video');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLessonAsset = useCallback(async (fileName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await LessonService.getLessonAsset(fileName);
      return response.data;
    } catch (err) {
      return handleError(err, 'Không thể tải file bài học');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetLessons = useCallback(() => {
    setLessons(INITIAL_STATE);
    setCurrentLesson(null);
    setVideos([]);
    setError(null);
  }, []);

  return {
    lessons: lessons.items,
    lessonPageInfo: lessons.pageInfo,
    currentLesson,
    videos,
    isLoading,
    error,
    fetchLessons,
    fetchLessonById,
    fetchLessonsByMaterial,
    fetchLessonVideos,
    getLessonAsset,
    resetLessons,
  };
};

export default useLesson;

