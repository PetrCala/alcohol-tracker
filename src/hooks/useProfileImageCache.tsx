import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONST from '@src/CONST';
import {cacheProfileImage} from '@libs/Cache';

/**
 * Custom hook for caching and retrieving profile images based on user ID.
 *
 * @param userID - The ID of the user.
 * @returns An object containing the cached URL, a function to cache an image, and a state indicating whether the cache state has been checked.
 */
const useProfileImageCache = (userID: string) => {
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isCacheChecked, setIsCacheChecked] = useState(false);

  useEffect(() => {
    const fetchCachedImage = async (): Promise<void> => {
      const key = CONST.CACHE.PROFILE_PICTURE_KEY + userID;
      const itemStr = await AsyncStorage.getItem(key);
      if (itemStr === null) {
        setCachedUrl(null);
        setIsCacheChecked(true);
        return;
      }

      const item = JSON.parse(itemStr);
      const now = new Date().getTime();
      const CACHE_LIFESPAN = 12 * 60 * 60 * 1000; // 12 hours

      if (now - item.timestamp > CACHE_LIFESPAN) {
        await AsyncStorage.removeItem(key);
        setCachedUrl(null);
      } else {
        setCachedUrl(item.url === CONST.NO_IMAGE ? CONST.NO_IMAGE : item.url);
      }
      setIsCacheChecked(true);
    };

    fetchCachedImage();
  }, [userID]);

  /**
   * Caches an image URL for the user.
   *
   * @param url - The URL of the image to cache.
   */
  const cacheImage = async (url: string | null) => {
    await cacheProfileImage(userID, url);
    setCachedUrl(url);
  };

  return {cachedUrl, cacheImage, isCacheChecked};
};

export default useProfileImageCache;
