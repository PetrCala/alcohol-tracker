import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook for caching and retrieving profile images based on user ID.
 *
 * @param userId - The ID of the user.
 * @returns An object containing the cached URL and a function to cache an image.
 */
const useProfileImageCache = (userId: string) => {
    const [cachedUrl, setCachedUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchCachedImage = async (): Promise<void> => {
            const key = `users/${userId}/profile/photo_url`;
            const itemStr = await AsyncStorage.getItem(key);
            if (!itemStr) return;

            const item = JSON.parse(itemStr);
            const now = new Date().getTime();
            const CACHE_LIFESPAN = 24 * 60 * 60 * 1000; // 24 hours

            if (now - item.timestamp > CACHE_LIFESPAN) {
                await AsyncStorage.removeItem(key);
            } else {
                setCachedUrl(item.url);
            }
        };

        fetchCachedImage();
    }, [userId]);

    /**
     * Caches an image URL for the user.
     *
     * @param url - The URL of the image to cache.
     */
    const cacheImage = async (url: string) => {
        const key = `users/${userId}/profile/photo_url`; // Alternative: profileImage-${userId}
        const now = new Date().getTime();
        const item = {
            url,
            timestamp: now,
        };
        await AsyncStorage.setItem(key, JSON.stringify(item));
        setCachedUrl(url);
    };

    return {cachedUrl, cacheImage};
};

export default useProfileImageCache;