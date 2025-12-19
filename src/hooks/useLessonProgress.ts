import { useRef, useCallback } from 'react';
import { AVPlaybackStatus } from 'expo-av';
import LessonService from '../services/lessonService';

interface UseLessonProgressOptions {
  lessonId: string | null | undefined;
  enabled?: boolean; 
  saveInterval?: number; 
}

/**

 * Tự động lưu tiến trình mỗi N giây (mặc định 5 giây)
 */
export const useLessonProgress = ({
  lessonId,
  enabled = true,
  saveInterval = 5,
}: UseLessonProgressOptions) => {
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  /**
   * Xử lý playback status update và tự động lưu tiến trình
   */
  const handlePlaybackStatusUpdate = useCallback(
    async (
      status: AVPlaybackStatus,
      callback?: (status: AVPlaybackStatus) => void | Promise<void>
    ) => {
      if (!status.isLoaded) {
        await callback?.(status);
        return;
      }

      // Lưu tiến trình nếu được bật và có lessonId
      if (enabled && lessonId && status.positionMillis !== undefined) {
        const currentTime = Date.now();
        const timeSinceLastSave = (currentTime - lastSaveTimeRef.current) / 1000;
        const currentTimeInSeconds = Math.round(status.positionMillis / 1000);
        const durationInSeconds = status.durationMillis 
          ? Math.round(status.durationMillis / 1000) 
          : null;

        // Nếu video vừa kết thúc, lưu ngay với duration để đánh dấu completed
        const isVideoFinished = status.didJustFinish && durationInSeconds;
        // Nếu video gần kết thúc (>= 95% hoặc đã kết thúc), cũng coi như completed
        const isNearEnd = durationInSeconds && currentTimeInSeconds >= durationInSeconds * 0.95;
        const shouldSave = isVideoFinished || isNearEnd || (timeSinceLastSave >= saveInterval && !isSavingRef.current);

        if (shouldSave && !isSavingRef.current) {
          isSavingRef.current = true;
          
          try {
            // Nếu video kết thúc hoặc gần kết thúc, gửi duration để đánh dấu completed
            let lastWatchedSecond = currentTimeInSeconds;
            if (isVideoFinished && durationInSeconds) {
              lastWatchedSecond = durationInSeconds;
            } else if (isNearEnd && durationInSeconds) {
              // Nếu gần kết thúc, gửi duration để đảm bảo được đánh dấu completed
              lastWatchedSecond = durationInSeconds;
            }

            await LessonService.saveLessonProgress(lessonId, lastWatchedSecond);
            lastSaveTimeRef.current = currentTime;
          } catch (error) {
            // Silently handle error to not interrupt video playback
          } finally {
            isSavingRef.current = false;
          }
        }
      }

      // Gọi callback gốc nếu có
      await callback?.(status);
    },
    [lessonId, enabled, saveInterval]
  );

  /**
   * Reset thời gian lưu (dùng khi chuyển lesson)
   */
  const resetSaveTime = useCallback(() => {
    lastSaveTimeRef.current = 0;
  }, []);

  return {
    handlePlaybackStatusUpdate,
    resetSaveTime,
  };
};

