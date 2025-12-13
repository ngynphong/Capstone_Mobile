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
        const newRating = response.data.data[0];
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
        const ratingsList = response.data.data;
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
        const ratingsList = response.data.data;
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
        const ratingsList = response.data.data;
        return ratingsList.length > 0 ? ratingsList[0] : null;
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

