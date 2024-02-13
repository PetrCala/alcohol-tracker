/**
 * This is a file containing constants for all of the screen names. In most cases, we should use the routes for
 * navigation. But there are situations where we may need to access screen names directly.
 */
import type DeepValueOf from './types/utils/DeepValueOf';

const PROTECTED_SCREENS = {
  // HOME: 'Home',
} as const;

const SCREENS = {
  ...PROTECTED_SCREENS,
  ALL_SETTINGS: 'AllSettings',
  //...
  SETTINGS: {
    ROOT: 'Settings_Root',
    SHARE_CODE: 'Settings_Share_Code',
  },
  //...
} as const;

type Screen = DeepValueOf<typeof SCREENS>;

export default SCREENS;
export {PROTECTED_SCREENS};
export type {Screen};
