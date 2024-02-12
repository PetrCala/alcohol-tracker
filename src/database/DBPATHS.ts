import {BetaKeyId, FeedbackId} from '@src/types/database';
import {UserId} from '@src/types/database/DatabaseCommon';
import {NicknameKey} from '@src/types/database/NicknameToId';
import type {IsEqual} from 'type-fest';

const DBPATHS = {
  ROOT: '',

  BETA_KEYS: 'beta_keys',
  BETA_KEYS_BETA_KEY: {
    route: '/beta_keys/:beta_key',
    getRoute: (betaKey: BetaKeyId) => `beta_keys/${betaKey}` as const,
  },
  CONFIG: 'config',
  CONFIG_APP_SETTINGS: 'config/app_settings',
  CONFIG_MAINTENANCE: 'config/maintenance',
  FEEDBACK: 'feedback',
  FEEDBACK_FEEDBACK_ID: {
    route: '/feedback/:feedback_id',
    getRoute: (feedbackId: FeedbackId) => `feedback/${feedbackId}` as const,
  },
  NICKNAME_TO_ID: 'nickname_to_id',
  NICKNAME_TO_ID_NICKNAME_KEY: {
    route: '/nickname_to_id/:nickname_key',
    getRoute: (nicknameKey: NicknameKey) =>
      `nickname_to_id/${nicknameKey}` as const,
  },
  NICKNAME_TO_ID_NICKNAME_KEY_USER_ID: {
    route: '/nickname_to_id/:key/:user_id',
    getRoute: (key: NicknameKey, user_id: UserId) =>
      `nickname_to_id/${key}/${user_id}` as const,
  },
  USER_DRINKING_SESSIONS: 'user_drinking_sessions',
  USER_DRINKING_SESSIONS_USER_ID: {
    route: '/user_drinking_sessions/:user_id',
    getRoute: (user_id: UserId) => `user_drinking_sessions/${user_id}` as const,
  },
  USER_DRINKING_SESSIONS_USER_ID_SESSION_ID: {
    route: '/user_drinking_sessions/:user_id/:session_id',
    getRoute: (user_id: UserId, session_id: string) =>
      `user_drinking_sessions/${user_id}/${session_id}` as const,
  },
  USER_PREFERENCES: 'user_preferences',
  USER_PREFERENCES_USER_ID: {
    route: '/user_preferences/:user_id',
    getRoute: (user_id: UserId) => `user_preferences/${user_id}` as const,
  },
  USER_PREFERENCES_USER_ID_FIRST_DAY_OF_WEEK: {
    route: '/user_preferences/:user_id/first_day_of_week',
    getRoute: (user_id: UserId) =>
      `user_preferences/${user_id}/first_day_of_week` as const,
  },
  USER_PREFERENCES_USER_ID_UNITS_TO_COLORS: {
    route: '/user_preferences/:user_id/units_to_colors',
    getRoute: (user_id: UserId) =>
      `user_preferences/${user_id}/units_to_colors` as const,
  },
  USER_PREFERENCES_USER_ID_UNITS_TO_POINTS: {
    route: '/user_preferences/:user_id/units_to_points',
    getRoute: (user_id: UserId) =>
      `user_preferences/${user_id}/units_to_points` as const,
  },
  USER_STATUS: 'user_status',
  USER_STATUS_USER_ID: {
    route: '/user_status/:user_id',
    getRoute: (user_id: UserId) => `user_status/${user_id}` as const,
  },
  USER_STATUS_USER_ID_LAST_ONLINE: {
    route: 'user_status/:user_id/last_online',
    getRoute: (user_id: UserId) =>
      `user_status/${user_id}/last_online` as const,
  },
  USER_STATUS_USER_ID_LATEST_SESSION: {
    route: 'user_status/:user_id/latest_session',
    getRoute: (user_id: UserId) =>
      `user_status/${user_id}/latest_session` as const,
  },
  USER_STATUS_USER_ID_LATEST_SESSION_ID: {
    route: 'user_status/:user_id/latest_session_id',
    getRoute: (user_id: UserId) =>
      `user_status/${user_id}/latest_session_id` as const,
  },
  USER_UNCONFIRMED_DAYS: 'user_unconfirmed_days',
  USER_UNCONFIRMED_DAYS_USER_ID: {
    route: '/user_unconfirmed_days/:user_id',
    getRoute: (user_id: UserId) => `user_unconfirmed_days/${user_id}` as const,
  },
  USERS: 'users',
  USERS_USER_ID: {
    route: '/users/:user_id',
    getRoute: (user_id: UserId) => `users/${user_id}` as const,
  },
  USERS_USER_ID_FRIENDS: {
    route: '/users/:user_id/friends',
    getRoute: (user_id: UserId) => `users/${user_id}/friends` as const,
  },
  USERS_USER_ID_FRIENDS_FRIEND_ID: {
    route: '/users/:user_id/friends/:friend_id',
    getRoute: (user_id: UserId, friend_id: UserId) =>
      `users/${user_id}/friends/${friend_id}` as const,
  },
  USERS_USER_ID_FRIEND_REQUESTS: {
    route: '/users/:user_id/friend_requests',
    getRoute: (user_id: UserId) => `users/${user_id}/friend_requests` as const,
  },
  USERS_USER_ID_FRIEND_REQUESTS_REQUEST_ID: {
    route: '/users/:user_id/friend_requests/:request_id',
    getRoute: (user_id: UserId, request_id: string) =>
      `users/${user_id}/friend_requests/${request_id}` as const,
  },
  USERS_USER_ID_PROFILE: {
    route: '/users/:user_id/profile',
    getRoute: (user_id: UserId) => `users/${user_id}/profile` as const,
  },
  USERS_USER_ID_PROFILE_PHOTO_URL: {
    route: '/users/:user_id/profile/photo_url',
    getRoute: (user_id: UserId) =>
      `users/${user_id}/profile/photo_url` as const,
  },
  USERS_USER_ID_PROFILE_DISPLAY_NAME: {
    route: '/users/:user_id/profile/display_name',
    getRoute: (user_id: UserId) =>
      `users/${user_id}/profile/display_name` as const,
  },
} as const;

export default DBPATHS;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractPathName<TRoute> = TRoute extends {
  getRoute: (...args: any[]) => infer TRouteName;
}
  ? TRouteName
  : TRoute;

type AllPaths = {
  [K in keyof typeof DBPATHS]: ExtractPathName<(typeof DBPATHS)[K]>;
}[keyof typeof DBPATHS];

type PathIsPlainString = IsEqual<AllPaths, string>;

/**
 * Represents all database routes in the app as a union of literal strings.
 *
 * If this type resolves to `never`, it implies that one or more routes defined within `PATHS` have not correctly used
 * `as const` in their `getPath` function return value.
 */
type Path = PathIsPlainString extends true ? never : AllPaths;

export type {Path};
