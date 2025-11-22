import { useState, useEffect, useCallback, useRef } from 'react';
import type { SaveProgressPayload } from '../types/examTypes';

/**
 * Hook tự động lưu tiến độ làm bài sau mỗi 30 giây
 */
export const useAutoSave = (
  attemptId: string | null,
  saveProgress: (attemptId: string, payload: SaveProgressPayload) => Promise<boolean>,
  answers: Record<string, any>,
  isEnabled: boolean = true,
  interval: number = 30000 // 30 seconds
) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedAnswersRef = useRef<string>('');

  /**
   * Tạo payload từ answers hiện tại
   */
  const createPayload = useCallback((): SaveProgressPayload => {
    const answersArray = Object.entries(answers).map(([examQuestionId, answer]) => {
      // Nếu answer là object có selectedAnswerId thì là MCQ
      if (typeof answer === 'object' && answer?.selectedAnswerId !== undefined) {
        return {
          examQuestionId,
          selectedAnswerId: answer.selectedAnswerId || null,
        };
      }
      
      // Nếu answer là string thì là FRQ hoặc selectedAnswerId
      if (typeof answer === 'string') {
        return {
          examQuestionId,
          selectedAnswerId: answer,
        };
      }
      
      // Nếu answer là object có frqAnswerText thì là FRQ
      if (typeof answer === 'object' && answer?.frqAnswerText !== undefined) {
        return {
          examQuestionId,
          frqAnswerText: answer.frqAnswerText || null,
        };
      }
      
      // Default fallback
      return {
        examQuestionId,
        selectedAnswerId: null,
      };
    });

    return { answers: answersArray };
  }, [answers]);

  /**
   * Kiểm tra xem answers có thay đổi từ lần lưu cuối không
   */
  const hasAnswersChanged = useCallback(() => {
    const currentAnswersStr = JSON.stringify(answers);
    return currentAnswersStr !== lastSavedAnswersRef.current;
  }, [answers]);

  /**
   * Thực hiện lưu tiến độ
   */
  const performSave = useCallback(async () => {
    if (!attemptId || !isEnabled) return;
    
    if (!hasAnswersChanged()) {
      console.log('Auto-save: Không có thay đổi để lưu');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = createPayload();
      const success = await saveProgress(attemptId, payload);
      
      if (success) {
        setLastSaved(new Date());
        lastSavedAnswersRef.current = JSON.stringify(answers);
        console.log('Auto-save: Đã lưu thành công lúc', new Date().toLocaleTimeString());
      } else {
        setError('Không thể lưu tự động');
        console.error('Auto-save: Lỗi khi lưu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      console.error('Auto-save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [attemptId, isEnabled, hasAnswersChanged, createPayload, saveProgress, answers]);

  /**
   * Lưu ngay lập tức (manual trigger)
   */
  const saveNow = useCallback(() => {
    performSave();
  }, [performSave]);

  /**
   * Bắt đầu auto-save
   */
  const startAutoSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (isEnabled && attemptId) {
      intervalRef.current = setInterval(() => {
        performSave();
      }, interval);
      
      console.log('Auto-save: Đã bắt đầu (mỗi', interval / 1000, 'giây)');
    }
  }, [isEnabled, attemptId, interval, performSave]);

  /**
   * Dừng auto-save
   */
  const stopAutoSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Auto-save: Đã dừng');
    }
  }, []);

  /**
   * Setup effect
   */
  useEffect(() => {
    startAutoSave();

    return () => {
      stopAutoSave();
    };
  }, [startAutoSave, stopAutoSave]);

  /**
   * Cleanup khi unmount
   */
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  /**
   * Reset state khi attemptId thay đổi
   */
  useEffect(() => {
    setLastSaved(null);
    setError(null);
    lastSavedAnswersRef.current = '';
  }, [attemptId]);

  return {
    lastSaved,
    isSaving,
    error,
    saveNow,
    startAutoSave,
    stopAutoSave,
  };
};
