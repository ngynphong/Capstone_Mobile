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
        const mappedLessons: Lesson[] = lessonsArray.map((lesson: any) => ({
          ...lesson,
          fileName: lesson.fileName || lesson.file,
          videoUrl: lesson.videoUrl || lesson.url,
          title: lesson.title || lesson.name,
        }));
        
        console.log('Fetched lessons count:', mappedLessons.length);
        console.log('Mapped lessons:', mappedLessons);
        
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
      console.log('getVideos API response:', JSON.stringify(responseData, null, 2));
      console.log('Response data type:', typeof responseData.data);
      console.log('Response data:', responseData.data);
      
      // Kiểm tra cấu trúc response - có thể là:
      // 1. ApiResponse<LessonVideo[]> -> responseData.data là array
      // 2. ApiResponse<string> -> responseData.data là URL string trực tiếp
      // 3. ApiResponse<LessonVideo> -> responseData.data là object
      // 4. Response trực tiếp là URL string (không có wrapper)
      
      let videoUrl = null;
      
      // Trường hợp 1: data là string URL trực tiếp
      if (typeof responseData.data === 'string') {
        videoUrl = responseData.data;
        console.log('Response data is direct URL string:', videoUrl);
      }
      // Trường hợp 2: data là array
      else if (Array.isArray(responseData.data)) {
        if (responseData.data.length > 0) {
          const firstVideo = responseData.data[0];
          videoUrl = firstVideo.url || firstVideo.videoUrl || firstVideo.uri || firstVideo.videoUrl;
          console.log('Extracted from array, firstVideo:', firstVideo);
          console.log('Extracted video URL:', videoUrl);
        }
      }
      // Trường hợp 3: data là object
      else if (responseData.data && typeof responseData.data === 'object') {
        // Thử nhiều field khác nhau
        videoUrl = responseData.data.url || 
                   responseData.data.videoUrl || 
                   responseData.data.uri ||
                   responseData.data.videoUrl ||
                   (responseData.data as any).video_url;
        console.log('Extracted from object, video URL:', videoUrl);
        console.log('Object keys:', Object.keys(responseData.data));
      }
      
      // Nếu vẫn chưa có, thử xem responseData có phải là URL trực tiếp không
      if (!videoUrl && typeof responseData === 'string' && /^https?:\/\//i.test(responseData)) {
        videoUrl = responseData;
        console.log('ResponseData itself is URL:', videoUrl);
      }
      
      if (videoUrl && /^https?:\/\//i.test(videoUrl)) {
        console.log('✅ Valid video URL found:', videoUrl);
        return videoUrl;
      }
      
      console.log('❌ No valid video URL found in response');
      console.log('Response structure:', {
        hasData: !!responseData.data,
        dataType: typeof responseData.data,
        isArray: Array.isArray(responseData.data),
        dataKeys: responseData.data && typeof responseData.data === 'object' ? Object.keys(responseData.data) : null
      });
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

