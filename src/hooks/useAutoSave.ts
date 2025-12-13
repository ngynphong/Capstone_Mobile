import { useState, useEffect, useCallback, useRef } from 'react';
import type { SaveProgressPayload } from '../types/examTypes';

/**
 * Hook tự động lưu tiến độ làm bài khi user thay đổi đáp án
 * và cũng lưu theo interval như fallback
 */
export const useAutoSave = (
  attemptId: string | null,
  attemptSessionToken: string | null,
  saveProgress: (attemptId: string, payload: SaveProgressPayload) => Promise<boolean>,
  answers: Record<string, any>,
  isEnabled: boolean = true,
  debounceMs: number = 1000 // Debounce 1 second to prevent too many API calls
) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSavedAnswersRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

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

    return {
      answers: answersArray,
      attemptSessionToken: attemptSessionToken || ''
    };
  }, [answers, attemptSessionToken]);

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
    if (!attemptId || !attemptSessionToken || !isEnabled) return;

    if (!hasAnswersChanged()) {
      console.log('Auto-save: Không có thay đổi để lưu');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = createPayload();
      const success = await saveProgress(attemptId, payload);

      if (success && isMountedRef.current) {
        setLastSaved(new Date());
        lastSavedAnswersRef.current = JSON.stringify(answers);
        console.log('Auto-save: Đã lưu thành công lúc', new Date().toLocaleTimeString());
      } else if (isMountedRef.current) {
        setError('Không thể lưu tự động');
        console.error('Auto-save: Lỗi khi lưu');
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        setError(errorMessage);
        console.error('Auto-save error:', err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [attemptId, attemptSessionToken, isEnabled, hasAnswersChanged, createPayload, saveProgress, answers]);

  /**
   * Lưu ngay lập tức (manual trigger)
   */
  const saveNow = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    performSave();
  }, [performSave]);

  /**
   * Lưu với debounce khi answers thay đổi
   */
  const debouncedSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
  }, [performSave, debounceMs]);

  /**
   * Effect: Lưu khi answers thay đổi (có debounce)
   */
  useEffect(() => {
    if (attemptId && attemptSessionToken && isEnabled && hasAnswersChanged()) {
      debouncedSave();
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [answers, attemptId, attemptSessionToken, isEnabled, hasAnswersChanged, debouncedSave]);

  /**
   * Cleanup khi unmount
   */
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

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
  };
};

