import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialService from '../services/materialService';
import type { Material, MaterialResponse } from '../types/material';

interface FetchParams {
  queryParams?: Record<string, unknown>;
}

export const useMaterial = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('accessToken')
      .then(token => setAuthToken(token))
      .catch(() => setAuthToken(null));
  }, []);

  const fetchMaterials = useCallback(
    async ({ queryParams }: FetchParams = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await MaterialService.getPublicMaterials(queryParams);
        const payload: MaterialResponse = response.data;
        setMaterials(payload.data.items);
        return payload;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch materials';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const refreshMaterials = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchMaterials();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchMaterials]);

  const getMaterialImageUrl = useCallback((fileName?: string) => {
    return MaterialService.getMaterialAssetUrl(fileName);
  }, []);

  const getMaterialImageSource = useCallback(
    (fileName?: string) => {
      const uri = MaterialService.getMaterialAssetUrl(fileName);
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

  const getMaterialAsset = useCallback(async (fileName: string) => {
    try {
      const response = await MaterialService.getMaterialAsset(fileName);
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải file học liệu';
      setError(message);
      throw err;
    }
  }, []);

  return {
    materials,
    isLoading,
    isRefreshing,
    error,
    fetchMaterials,
    refreshMaterials,
    getMaterialImageUrl,
    getMaterialAsset,
    getMaterialImageSource,
  };
};

export default useMaterial;

