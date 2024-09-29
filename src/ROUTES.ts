import type {IsEqual, ValueOf} from 'type-fest';
import type CONST from './CONST';
import type {DrinkingSessionId} from './types/onyx';
import type {UserID} from './types/onyx/OnyxCommon';
import {timestampToDate, timestampToDateString} from '@libs/DataHandling';
import DeepValueOf from './types/utils/DeepValueOf';
import SCREENS from './SCREENS';
import type {DateString} from './types/time';

const ROUTES = {
  // If the user opens this route, we'll redirect them to the path saved in the last visited path or to the home page if the last visited path is empty.
  ROOT: '',

  HOME: 'home',
  FORCE_UPDATE: 'force-update',
  LOGIN: 'login',
  SIGNUP: 'signup',
  DESKTOP_SIGN_IN_REDIRECT: 'desktop-signin-redirect',
  APPLE_SIGN_IN: 'sign-in-with-apple',
  GOOGLE_SIGN_IN: 'sign-in-with-google',
  TRANSITION_BETWEEN_APPS: 'transition',

  ACHIEVEMENTS: 'achievements',

  DAY_OVERVIEW: {
    route: 'day-overview/:date',
    getRoute: (date: DateString) => `day-overview/${date}` as const,
  },

  DRINKING_SESSION: {
    route: 'drinking-session/:sessionId',
    getRoute: (sessionId: DrinkingSessionId) =>
      `drinking-session/${sessionId}` as const,
  },
  DRINKING_SESSION_LIVE: {
    route: 'drinking-session/:sessionId/live',
    getRoute: (sessionId: DrinkingSessionId) =>
      `drinking-session/${sessionId}/live` as const,
  },
  DRINKING_SESSION_SUMMARY: {
    route: 'drinking-session/:sessionId/summary',
    getRoute: (sessionId: DrinkingSessionId) =>
      `drinking-session/${sessionId}/summary` as const,
  },

  SETTINGS: 'settings',

  SETTINGS_ACCOUNT: 'settings/account',
  SETTINGS_DISPLAY_NAME: 'settings/display-name',
  SETTINGS_TIMEZONE: 'settings/timezone',
  SETTINGS_TIMEZONE_SELECT: 'settings/timezone-select',

  SETTINGS_APP_SHARE: 'settings/app-share',
  SETTINGS_PREFERENCES: 'settings/preferences',
  SETTINGS_LANGUAGE: 'settings/preferences/language',
  SETTINGS_THEME: 'settings/preferences/theme',

  SETTINGS_DELETE: 'settings/delete',
  SETTINGS_TERMS_OF_SERVICE: 'settings/terms-of-service',
  SETTINGS_PRIVACY_POLICY: 'settings/privacy-policy',

  PROFILE: {
    route: 'profile/:userID',
    getRoute: (userID: UserID) => `profile/${userID}` as const,
  },
  PROFILE_FRIENDS_FRIENDS: {
    route: 'profile/:userID/friends',
    getRoute: (userID: UserID) => `profile/${userID}/friends` as const,
  },

  SOCIAL: 'social',

  // Causes an error
  // SOCIAL: {
  //   route: 'social/:screen',
  //   getRoute: (screen: DeepValueOf<typeof SCREENS.SOCIAL>) =>
  //     `social/${screen}` as const,
  // },
  SOCIAL_FRIEND_LIST: 'social/friend-list',
  SOCIAL_FRIEND_REQUESTS: 'social/friend-requests',
  SOCIAL_FRIEND_SEARCH: 'social/friend-search',

  STATISTICS: 'statistics',
} as const;

export default ROUTES;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractRouteName<TRoute> = TRoute extends {
  getRoute: (...args: any[]) => infer TRouteName;
}
  ? TRouteName
  : TRoute;

type AllRoutes = {
  [K in keyof typeof ROUTES]: ExtractRouteName<(typeof ROUTES)[K]>;
}[keyof typeof ROUTES];

type RouteIsPlainString = IsEqual<AllRoutes, string>;

/**
 * Represents all routes in the app as a union of literal strings.
 *
 * If this type resolves to `never`, it implies that one or more routes defined within `ROUTES` have not correctly used
 * `as const` in their `getRoute` function return value.
 */
type Route = RouteIsPlainString extends true ? never : AllRoutes;

export type {Route};
