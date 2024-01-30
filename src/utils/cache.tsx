import AsyncStorage from '@react-native-async-storage/async-storage';
import CONST from '@src/CONST';


/**
 * Caches the profile image URL for a user.
 * @param userId - The ID of the user.
 * @param url - The URL of the profile image. Can be null.
 */
export const cacheProfileImage = async (userId: string, url: string | null) => {
    const key = CONST.CACHE.PROFILE_PICTURE_KEY + userId;
    const now = new Date().getTime();
    const item = {
        url: url === null ? CONST.NO_IMAGE : url,
        timestamp: now,
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
};
