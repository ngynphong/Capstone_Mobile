import { useEffect, useState, useRef } from 'react';
import { ImageSourcePropType, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialService from '../services/materialService';

const PLACEHOLDER_SOURCE: ImageSourcePropType = {
  uri: MaterialService.getMaterialAssetUrl(undefined),
};

export const useMaterialImageSource = (
  fileName?: string,
): { source: ImageSourcePropType; isLoading: boolean } => {
  const [source, setSource] = useState<ImageSourcePropType>(PLACEHOLDER_SOURCE);
  const [isLoading, setIsLoading] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const cleanupBlob = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

    const loadImage = async () => {
      if (!fileName) {
        cleanupBlob();
        setSource(PLACEHOLDER_SOURCE);
        return;
      }

      const uri = MaterialService.getMaterialAssetUrl(fileName);

      if (Platform.OS !== 'web') {
        const token = await AsyncStorage.getItem('accessToken');
        if (!isMounted) return;
        cleanupBlob();
        if (token) {
          setSource({
            uri,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          setSource({ uri });
        }
        return;
      }

      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await fetch(uri, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch material image: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        if (!isMounted) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        cleanupBlob();
        objectUrlRef.current = blobUrl;
        setSource({ uri: blobUrl });
      } catch (error) {
        console.error('Failed to load material image on web:', error);
        if (isMounted) {
          cleanupBlob();
          setSource(PLACEHOLDER_SOURCE);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      cleanupBlob();
    };
  }, [fileName]);

  return { source, isLoading };
};

export default useMaterialImageSource;


