import {Platform} from 'react-native';
import CONST from '@src/CONST';

/**
 * Check that the current platform is valid.
 */
export const platformIsValid = (): boolean => {
  return CONST.AVAILABLE_PLATFORMS.includes(Platform.OS as any);
};
