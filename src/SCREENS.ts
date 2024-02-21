/**
 * This is a file containing constants for all of the screen names. In most cases, we should use the routes for
 * navigation. But there are situations where we may need to access screen names directly.
 */
import type DeepValueOf from './types/utils/DeepValueOf';

const PROTECTED_SCREENS = {
  HOME: 'Home',
} as const;

const SCREENS = {
  ...PROTECTED_SCREENS,
  NOT_FOUND: 'not-found',
  // Public screens
  SIGNUP: 'SignUp',
  LOGIN: 'Login',
  FORCE_UPDATE: 'ForceUpdate',
  RIGHT_MODAL: {
    MAIN_MENU: 'MainMenu',
    DRINKING_SESSION: 'DrinkingSession',
  },

  ACHIEVEMENTS: {
    ROOT: 'Achievements',
  },

  DAY_OVERVIEW: {
    ROOT: 'DayOverview',
  },

  DRINKING_SESSION: {
    ROOT: 'DrinkingSession',
    LIVE: 'DrinkingSession_Live',
    EDIT: 'DrinkingSession_Edit',
    SUMMARY: 'DrinkingSession_Summary',
  },

  MAIN_MENU: {
    ROOT: 'MainMenu_Root',
    PREFERENCES: 'MainMenu_Preferences',
    POLICIES: {
      TERMS_OF_SERVICE: 'MainMenu_Policies_TermsOfService',
      PRIVACY_POLICY: 'MainMenu_Policies_PrivacyPolicy',
    },
  },

  PROFILE: {
    ROOT: 'Profile',
    FRIENDS_FRIENDS: 'Profile_FriendsFriends',
  },

  SOCIAL: {
    ROOT: 'Social',
    FRIEND_LIST: 'Social_FriendList',
    SEARCH_FRIENDS: 'Social_SearchFriends',
    FRIEND_REQUESTS: 'Social_FriendRequests',
  },

  STATISTICS: {
    ROOT: 'Statistics',
  },

  SETTINGS: {
    ROOT: 'Settings',
  },
} as const;

type Screen = DeepValueOf<typeof SCREENS>;

export default SCREENS;
export {PROTECTED_SCREENS};
export type {Screen};
