import { useState, useCallback } from 'react';
import MaterialService from '../services/materialService';

export const useMaterialRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const registerMaterial = useCallback(async (learningMaterialId: string) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      await MaterialService.registerMaterial(learningMaterialId);
      setIsSuccess(true);
      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Không thể đăng ký học liệu. Vui lòng thử lại.';
      setError(message);
      setIsSuccess(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    registerMaterial,
    isLoading,
    error,
    isSuccess,
    reset,
  };
};

export default useMaterialRegister;

