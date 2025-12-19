import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import type { Lesson } from '../types/lessonTypes';
import type { Material } from '../types/material';
import useLesson from './useLesson';

const PLACEHOLDER_LESSON = 'https://placehold.co/600x400?text=Lesson+Resource';

interface UseMaterialDetailProps {
  material: Material;
  learningMaterialId: string;
}

export const useMaterialDetail = ({ material, learningMaterialId }: UseMaterialDetailProps) => {
  const {
    lessons: lessonList,
    isLoading,
    fetchLessonsByMaterial,
    getLessonAssetSource,
    getLessonAssetDownloadConfig,
    getLessonVideoUrlByNameFile,
  } = useLesson();

  const [activeVideoLessonId, setActiveVideoLessonId] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<{ uri: string; headers?: any } | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const lastProcessedLessonId = useRef<string | null>(null);
  const lastProcessedFileName = useRef<string | null>(null);

  // Fetch lessons khi component mount
  useEffect(() => {
    fetchLessonsByMaterial(learningMaterialId);
  }, [learningMaterialId, fetchLessonsByMaterial]);

  // Derived lessons - fallback về material content nếu không có lessons
  const lessons = Array.isArray(lessonList) ? lessonList : [];
  const derivedLessons = useMemo(() => {
    if (lessons.length > 0) return lessons;
    if (!material.contentUrl) return lessons;
    return [
      {
        id: learningMaterialId,
        title: material.title,
        description: material.description,
        fileName: material.contentUrl,
        videoUrl: material.contentUrl,
      } as Lesson,
    ];
  }, [lessons, material.contentUrl, material.title, material.description, learningMaterialId]);

  // Tự động chọn lesson đầu tiên có video
  useEffect(() => {
    if (lessons.length === 0) return;
    
    const firstWithVideo = lessons.find(
      lesson => lesson.videoUrl || lesson.fileName
    );
    
    if (firstWithVideo) {
      const currentActive = lessons.find(l => l.id === activeVideoLessonId);
      const currentHasVideo = currentActive && (
        currentActive.videoUrl || currentActive.fileName
      );
      
      if (!activeVideoLessonId || !currentHasVideo) {
        setActiveVideoLessonId(firstWithVideo.id);
      }
    } else if (lessons.length > 0 && !activeVideoLessonId) {
      setActiveVideoLessonId(lessons[0].id);
    }
  }, [lessons, activeVideoLessonId]);

  // Featured lesson (lesson đầu tiên có video)
  const featuredLesson = useMemo(
    () => derivedLessons.find(
      lesson => lesson.videoUrl || lesson.fileName
    ),
    [derivedLessons],
  );

  // Display lesson (lesson đang được hiển thị)
  const displayLesson = useMemo(() => {
    if (activeVideoLessonId) {
      const activeLesson = derivedLessons.find(lesson => lesson.id === activeVideoLessonId);
      if (activeLesson) {
        const hasVideo = activeLesson.videoUrl || activeLesson.fileName;
        if (hasVideo) {
          return activeLesson;
        }
      }
    }
    return featuredLesson ?? derivedLessons[0] ?? null;
  }, [activeVideoLessonId, featuredLesson, derivedLessons]);

  // Helper function để tạo clean video source
  const createCleanVideoSource = useCallback((assetSource: { uri: string; headers?: any }) => {
    if (!assetSource.uri || assetSource.uri === PLACEHOLDER_LESSON) {
      return null;
    }
    return {
      uri: assetSource.uri,
      ...(assetSource.headers && Object.keys(assetSource.headers).length > 0 
        ? { headers: assetSource.headers } 
        : {})
    };
  }, []);

  // Helper function để load video từ source (URL hoặc fileName)
  const loadVideoFromSource = useCallback(async (source: string): Promise<{ uri: string; headers?: any } | null> => {
    // Nếu là URL đầy đủ, validate và dùng trực tiếp
    if (/^https?:\/\//i.test(source)) {
      try {
        new URL(source); // Validate URL
        return { uri: source };
      } catch {
        return null;
      }
    }

    // Thử lấy URL từ API
    try {
      const url = await getLessonVideoUrlByNameFile(source);
      if (url && /^https?:\/\//i.test(url)) {
        return { uri: url };
      }
    } catch (error) {
      // Fallback sẽ được xử lý bên dưới
    }

    // Fallback: dùng như fileName để build URL
    const assetSource = getLessonAssetSource(source);
    return createCleanVideoSource(assetSource);
  }, [getLessonVideoUrlByNameFile, getLessonAssetSource, createCleanVideoSource]);

  // Load video khi displayLesson thay đổi
  useEffect(() => {
    let isMounted = true;
    
    const loadVideo = async () => {
      if (!displayLesson) {
        if (isMounted) {
          setVideoSource(null);
          setVideoError('No video available for this material.');
        }
        lastProcessedLessonId.current = null;
        lastProcessedFileName.current = null;
        return;
      }

      // Check if this lesson has been processed to avoid calling API continuously
      const currentLessonId = displayLesson.id;
      const currentFileName = displayLesson.fileName || displayLesson.videoUrl;
      
      if (
        lastProcessedLessonId.current === currentLessonId &&
        lastProcessedFileName.current === currentFileName
      ) {
        return;
      }

      // Update ref to mark as processed
      lastProcessedLessonId.current = currentLessonId;
      lastProcessedFileName.current = currentFileName || null;

      // Get video URL or fileName from lesson (prefer videoUrl)
      const source = displayLesson.videoUrl || displayLesson.fileName;
      
      if (!source) {
        if (isMounted) {
          setVideoSource(null);
          setVideoError('No video available for this lesson.');
          setVideoLoading(false);
        }
        return;
      }

      // Load video from source
      setVideoLoading(true);
      loadVideoFromSource(source).then((videoSource) => {
        if (!isMounted) return;
        
        if (videoSource) {
          setVideoSource(videoSource);
          setVideoError(null);
        } else {
          setVideoSource(null);
          setVideoError('Unable to load video. Please try again.');
        }
        setVideoLoading(false);
      }).catch((error) => {
        if (!isMounted) return;
        console.error('Error loading video:', error);
        setVideoSource(null);
        setVideoError('Error loading video.');
        setVideoLoading(false);
      });
    };

    loadVideo();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayLesson?.id, displayLesson?.fileName, displayLesson?.videoUrl, loadVideoFromSource]);

  // Hàm refresh lessons để cập nhật progress
  const refreshLessons = useCallback(() => {
    fetchLessonsByMaterial(learningMaterialId);
  }, [learningMaterialId, fetchLessonsByMaterial]);

  return {
    // Lessons
    lessons: derivedLessons,
    isLoading,
    displayLesson,
    featuredLesson,
    
    // Video state
    videoSource,
    videoLoading,
    videoError,
    
    // Actions
    setActiveVideoLessonId,
    getLessonAssetDownloadConfig,
    refreshLessons,
  };
};

