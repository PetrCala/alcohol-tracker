import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONST from '@src/CONST';

/**
 * Custom hook for caching and retrieving profile images based on user ID.
 *
 * @param userId - The ID of the user.
 * @returns An object containing the cached URL, a function to cache an image, and a state indicating whether the cache state has been checked.
 */
const useProfileImageCache = (userId: string) => {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isCacheChecked, setIsCacheChecked] = useState(false);


  useEffect(() => {
    const fetchCachedImage = async (): Promise<void> => {
      const key = `users/${userId}/profile/photo_url`;
      const itemStr = await AsyncStorage.getItem(key);
      if (itemStr === null) {
        setCachedUrl(null);
        return;
      }

      const item = JSON.parse(itemStr);
      const now = new Date().getTime();
      const CACHE_LIFESPAN = 60 * 60 * 1000; // 1 hour

      if (now - item.timestamp > CACHE_LIFESPAN) {
        await AsyncStorage.removeItem(key);
        setCachedUrl(null);
      } else {
        setCachedUrl(item.url === CONST.NO_IMAGE ? CONST.NO_IMAGE : item.url);
      }
      setIsCacheChecked(true);
    };

    fetchCachedImage();
  }, [userId]);

  /**
   * Caches an image URL for the user.
   *
   * @param url - The URL of the image to cache.
   */
  const cacheImage = async (url: string | null) => {
    const key = `users/${userId}/profile/photo_url`; // Alternative: profileImage-${userId}
    const now = new Date().getTime();
    const item = {
      url: url === null ? CONST.NO_IMAGE : url,
      timestamp: now,
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
    setCachedUrl(url);
  };

  return {cachedUrl, cacheImage, isCacheChecked};
};

export default useProfileImageCache;
