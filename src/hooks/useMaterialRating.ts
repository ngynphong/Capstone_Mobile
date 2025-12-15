import { useState, useCallback } from 'react';
import MaterialService from '../services/materialService';
import type {
  MaterialRatingPayload,
  MaterialRating,
  MaterialRatingStatistics,
} from '../types/material';

export const useMaterialRating = () => {
  const [ratings, setRatings] = useState<MaterialRating[]>([]);
  const [statistics, setStatistics] = useState<MaterialRatingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Tạo đánh giá cho học liệu
   */
  const createRating = useCallback(
    async (payload: MaterialRatingPayload): Promise<MaterialRating> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await MaterialService.createMaterialRating(payload);
        const responseData = response.data.data;
        // Xử lý cả trường hợp data là object hoặc array
        const newRating = Array.isArray(responseData) 
          ? responseData[0] 
          : responseData;
        return newRating;
      } catch (err: any) {
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tạo đánh giá. Vui lòng thử lại.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Lấy tất cả đánh giá của một user
   */
  const fetchRatingsByUser = useCallback(
    async (userId: string): Promise<MaterialRating[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await MaterialService.getRatingsByUser(userId);
        const responseData = response.data.data;
        // Xử lý cả trường hợp data là object hoặc array
        const ratingsList = Array.isArray(responseData) 
          ? responseData 
          : [responseData];
        setRatings(ratingsList);
        return ratingsList;
      } catch (err: any) {
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tải đánh giá. Vui lòng thử lại.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Lấy tất cả đánh giá của một học liệu
   */
  const fetchRatingsByMaterial = useCallback(
    async (materialId: string): Promise<MaterialRating[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await MaterialService.getRatingsByMaterial(materialId);
        const responseData = response.data.data;

        // Backend có thể trả:
        // - Array<MaterialRating>
        // - 1 object MaterialRating
        // - Hoặc Page { content: MaterialRating[], ... }
        let ratingsList: MaterialRating[] = [];

        if (Array.isArray(responseData)) {
          ratingsList = responseData;
        } else if (responseData && Array.isArray((responseData as any).content)) {
          ratingsList = (responseData as any).content;
        } else if (responseData) {
          ratingsList = [responseData as MaterialRating];
        }

        setRatings(ratingsList);
        return ratingsList;
      } catch (err: any) {
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tải đánh giá. Vui lòng thử lại.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Lấy đánh giá của một user cho một học liệu cụ thể
   */
  const fetchRatingByMaterialAndUser = useCallback(
    async (
      materialId: string,
      userId: string,
    ): Promise<MaterialRating | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await MaterialService.getRatingByMaterialAndUser(
          materialId,
          userId,
        );
        const responseData = response.data.data;
        // Xử lý cả trường hợp data là object hoặc array
        if (Array.isArray(responseData)) {
          return responseData.length > 0 ? responseData[0] : null;
        }
        // Nếu là object thì trả về luôn
        return responseData || null;
      } catch (err: any) {
        // Nếu API trả về 404 hoặc không tìm thấy, coi như chưa đánh giá
        if (err?.response?.status === 404 || err?.response?.data?.code === 1001) {
          return null;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tải đánh giá. Vui lòng thử lại.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Lấy thống kê đánh giá của một học liệu
   */
  const fetchRatingStatistics = useCallback(
    async (materialId: string): Promise<MaterialRatingStatistics> => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await MaterialService.getMaterialRatingStatistics(materialId);
        const stats = response.data.data;
        setStatistics(stats);
        return stats;
      } catch (err: any) {
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tải thống kê đánh giá. Vui lòng thử lại.';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setRatings([]);
    setStatistics(null);
    setError(null);
  }, []);

  return {
    // State
    ratings,
    statistics,
    isLoading,
    error,

    // Actions
    createRating,
    fetchRatingsByUser,
    fetchRatingsByMaterial,
    fetchRatingByMaterialAndUser,
    fetchRatingStatistics,
    reset,
  };
};

export default useMaterialRating;

