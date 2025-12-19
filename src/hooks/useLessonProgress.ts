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

        // Chỉ lưu nếu đã qua đủ thời gian và không đang trong quá trình lưu
        if (timeSinceLastSave >= saveInterval && !isSavingRef.current) {
          isSavingRef.current = true;
          
          try {
            const currentTimeInSeconds = Math.round(status.positionMillis / 1000);

            await LessonService.saveLessonProgress(lessonId, currentTimeInSeconds);

            lastSaveTimeRef.current = currentTime;
            console.log('Progress saved:', {
              lessonId,
              lastWatchedSecond: currentTimeInSeconds,
            });
          } catch (error) {
            console.error('Error saving lesson progress:', error);
            // Không hiển thị lỗi cho user để không làm gián đoạn việc xem video
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

