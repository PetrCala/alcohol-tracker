import AsyncStorage from '@react-native-async-storage/async-storage';
import CONST from '@src/CONST';

/**
 * Caches the profile image URL for a user.
 * @param userID - The ID of the user.
 * @param url - The URL of the profile image. Can be null.
 */
const cacheProfileImage = async (userID: string, url: string | null) => {
  const key = CONST.CACHE.PROFILE_PICTURE_KEY + userID;
  const now = new Date().getTime();
  const item = {
    url: url ?? CONST.NO_IMAGE,
    timestamp: now,
  };
  await AsyncStorage.setItem(key, JSON.stringify(item));
};

// eslint-disable-next-line import/prefer-default-export
export {cacheProfileImage};
