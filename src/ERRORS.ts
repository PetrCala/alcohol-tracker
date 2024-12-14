import type DeepValueOf from './types/utils/DeepValueOf';

/**
 * A centralized object defining all known error keys used in the application.
 * This object categorizes errors based on their domain (e.g., STORAGE, AUTH, DATABASE)
 * and provides a consistent reference for error handling throughout the codebase.
 *
 * Usage:
 * - Use these constants in the application to avoid hardcoding error keys.
 * - Update or extend this object as new error categories or keys are introduced.
 */
const ERRORS = {
  STORAGE: {
    OBJECT_NOT_FOUND: 'storage/object-not-found',
    UNAUTHORIZED: 'storage/unauthorized',
  },
  AUTH: {
    MISSING_EMAIL: 'auth/missing-email',
    INVALID_EMAIL: 'auth/invalid-email',
    VERIFY_EMAIL: 'auth/verify-email',
    MISSING_PASSWORD: 'auth/missing-password',
    INVALID_CREDENTIAL: 'auth/invalid-credential',
    WEAK_PASSWORD: 'auth/weak-password',
    EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
    USER_NOT_FOUND: 'auth/user-not-found',
    WRONG_PASSWORD: 'auth/wrong-password',
    NETWORK_REQUEST_FAILED: 'auth/network-request-failed',
    REQUIRES_RECENT_LOGIN: 'auth/requires-recent-login',
    API_KEY_NOT_VALID: 'auth/api-key-not-valid',
    TOO_MANY_REQUESTS: 'auth/too-many-requests',
  },
  DATABASE: {
    DATA_FETCH_FAILED: 'database/data-fetch-failed',
    OUTDATED_APP_VERSION: 'database/outdated-app-version',
    ACCOUNT_CREATION_LIMIT_EXCEEDED: 'database/account-creation-limit-exceeded',
    USER_CREATION_FAILED: 'database/user-creation-failed',
  },
  HOME_SCREEN: {
    TITLE: 'home-screen/title',
    NO_LIVE_SESSION: 'home-screen/no-live-session',
  },
  IMAGE_UPLOAD: {
    FETCH: 'image-upload/fetch',
    UPLOAD: 'image-upload/upload',
    CHOICE: 'image-upload/choice',
  },
  ONYX: {
    GENERIC: 'onyx/generic',
  },
  SESSION: {
    SESSION_START: 'session/session-start',
  },
  USER: {
    COULD_NOT_UNFRIEND: 'user/could-not-unfriend',
  },
  PERMISSION_DENIED: 'error/PERMISSION_DENIED: Permission denied',
  UNKNOWN: 'error/unknown',
} as const;

type ErrorKey = DeepValueOf<typeof ERRORS>;

export default ERRORS;
export type {ErrorKey};
