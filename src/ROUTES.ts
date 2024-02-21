import type {IsEqual, ValueOf} from 'type-fest';
import type CONST from './CONST';
import {DrinkingSessionId, UserId} from './types/database';

const ROUTES = {
  // If the user opens this route, we'll redirect them to the path saved in the last visited path or to the home page if the last visited path is empty.
  ROOT: '',

  HOME: 'home',
  FORCE_UPDATE: 'force-update',
  LOGIN: 'login',
  SIGNUP: 'signup',

  ACHIEVEMENTS: 'achievements',

  DAY_OVERVIEW: {
    route: 'day-overview/:date',
    getRoute: (date: typeof CONST.DATE.FNS_FORMAT_STRING) =>
      `day-overview/${date}` as const,
  },

  DRINKING_SESSION: {
    route: 'drinking-session/:id',
    getRoute: (id: DrinkingSessionId) => `drinking-session/${id}` as const,
  },
  DRINKING_SESSION_LIVE: {
    route: 'drinking-session/:id/live',
    getRoute: (id: DrinkingSessionId) => `drinking-session/${id}/live` as const,
  },
  DRINKING_SESSION_EDIT: {
    route: 'drinking-session/:id/edit',
    getRoute: (id: DrinkingSessionId) => `drinking-session/${id}/edit` as const,
  },
  DRINKING_SESSION_SUMMARY: {
    route: 'drinking-session/:id/summary',
    getRoute: (id: DrinkingSessionId) =>
      `drinking-session/${id}/summary` as const,
  },

  MAIN_MENU: 'main-menu',
  MAIN_MENU_PREFERENCES: 'main-menu/preferences',
  MAIN_MENU_POLICIES_TERMS_OF_SERVICE: 'main-menu/policies/terms-of-service',
  MAIN_MENU_POLICIES_PRIVACY_POLICY: 'main-menu/policies/privacy-policy',

  PROFILE: {
    route: 'profile/:id',
    getRoute: (id: UserId) => `profile/${id}` as const,
  },
  PROFILE_FRIENDS_FRIENDS: {
    route: 'profile/:id/friends',
    getRoute: (id: UserId) => `profile/${id}/friends` as const,
  },

  SETTINGS: 'settings',

  SOCIAL: 'social',
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
