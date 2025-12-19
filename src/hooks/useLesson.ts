import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('accessToken')
      .then(token => setAuthToken(token))
      .catch(() => setAuthToken(null));
  }, []);

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
        const response = await LessonService.getLessonsByLearningMaterial(
          learningMaterialId,
        );
        const responseData: LessonByMaterialResponse = response.data;

        // Kiểm tra cấu trúc response - có thể là array trực tiếp hoặc PageInfo structure
        let lessonsArray: Lesson[] = [];
        if (Array.isArray(responseData.data)) {
          // Nếu là array trực tiếp
          lessonsArray = responseData.data;
        } else if (responseData.data && typeof responseData.data === 'object') {
          // Nếu là PageInfo structure
          const pageInfo = responseData.data as PageInfo<Lesson>;
          lessonsArray = pageInfo.items || pageInfo.content || [];
        }

        // Map các field từ backend sang Lesson interface
        // Backend có thể trả về: file, url, name thay vì fileName, videoUrl, title
        const mappedLessons: Lesson[] = lessonsArray.map((lesson: any) => {
          // Lấy duration từ nhiều nguồn có thể
          const duration = lesson.durationInSeconds 
            || lesson.duration 
            || lesson.durationSeconds
            || (lesson.durationMillis ? Math.round(lesson.durationMillis / 1000) : undefined);
          
          const mapped: Lesson = {
            ...lesson,
            fileName: lesson.fileName || lesson.file,
            videoUrl: lesson.videoUrl || lesson.url,
            title: lesson.title || lesson.name,
            // Map progress fields - đảm bảo map đúng từ API
            completed: lesson.completed !== undefined ? Boolean(lesson.completed) : false,
            progressPercentage: lesson.progressPercentage !== undefined ? Number(lesson.progressPercentage) : undefined,
            lastWatchedSecond: lesson.lastWatchedSecond !== undefined ? Number(lesson.lastWatchedSecond) : undefined,
            durationInSeconds: duration !== undefined ? Number(duration) : lesson.durationInSeconds,
          };
          return mapped;
        });


        setLessons({
          items: mappedLessons,
          pageInfo: null,
        });
        return mappedLessons;
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

  const getLessonAssetUrl = useCallback((fileName?: string) => {
    return LessonService.getLessonAssetUrl(fileName);
  }, []);

  const getLessonAssetSource = useCallback(
    (fileName?: string) => {
      const uri = LessonService.getLessonAssetUrl(fileName);
      if (authToken) {
        return {
          uri,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        };
      }
      return { uri };
    },
    [authToken],
  );

  const getLessonAssetDownloadConfig = useCallback(
    (fileName?: string) => {
      const url = LessonService.getLessonAssetUrl(fileName);
      return {
        url,
        headers: authToken
          ? {
            Authorization: `Bearer ${authToken}`,
          }
          : undefined,
      };
    },
    [authToken],
  );

  const getLessonVideoUrlByNameFile = useCallback(async (nameFile?: string) => {
    if (!nameFile) {
      return null;
    }

    // Nếu backend đã trả sẵn URL đầy đủ thì dùng luôn
    if (/^https?:\/\//i.test(nameFile)) {
      return nameFile;
    }

    // Nếu là URL relative hoặc path, extract tên file từ URL
    let actualFileName = nameFile;
    if (nameFile.includes('/')) {
      // Extract tên file từ path (ví dụ: /videos/video.mp4 -> video.mp4)
      const parts = nameFile.split('/');
      actualFileName = parts[parts.length - 1];
    }

    // Nếu sau khi extract vẫn là URL hoặc rỗng, thử dùng getLessonAssetUrl
    if (!actualFileName || actualFileName.trim().length === 0) {
      return null;
    }

    try {
      const response = await LessonService.getVideos(actualFileName);
      const responseData = response.data;

      // Kiểm tra cấu trúc response - có thể là:
      // 1. ApiResponse<LessonVideo[]> -> responseData.data là array
      // 2. ApiResponse<string> -> responseData.data là URL string trực tiếp
      // 3. ApiResponse<LessonVideo> -> responseData.data là object
      // 4. Response trực tiếp là URL string (không có wrapper)

      let videoUrl = null;

      // Trường hợp 1: data là string URL trực tiếp
      if (typeof responseData.data === 'string') {
        videoUrl = responseData.data;
      }
      // Trường hợp 2: data là array
      else if (Array.isArray(responseData.data)) {
        if (responseData.data.length > 0) {
          const firstVideo = responseData.data[0];
          videoUrl = firstVideo.url || firstVideo.videoUrl || firstVideo.uri || firstVideo.videoUrl;
        }
      }
      // Trường hợp 3: data là object
      else if (responseData.data && typeof responseData.data === 'object') {
        const dataObj = responseData.data as any;
        videoUrl = dataObj.url ||
          dataObj.videoUrl ||
          dataObj.uri ||
          dataObj.video_url;
      }

      // Nếu vẫn chưa có, thử xem responseData có phải là URL trực tiếp không
      if (!videoUrl && typeof responseData === 'string' && /^https?:\/\//i.test(responseData)) {
        videoUrl = responseData;
      }

      if (videoUrl && /^https?:\/\//i.test(videoUrl)) {
        return videoUrl;
      }
      return null;
    } catch (err) {
      console.error('Không thể tải video lesson:', err);
      return null;
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
    getLessonAssetUrl,
    getLessonAssetSource,
    getLessonAssetDownloadConfig,
    getLessonVideoUrlByNameFile,
    resetLessons,
  };
};

export default useLesson;

