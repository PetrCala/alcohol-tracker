import ERRORS from '@src/ERRORS';
import {ErrorMapping} from './types';

/**
 * A mapping of known error keys to short titles and descriptive messages.
 * Update or extend this mapping as needed.
 *
 * If ever more data has to be kept about each error, the values here can be extended into a full-fledged object.
 */
const ERROR_MAPPING: ErrorMapping = {
  [ERRORS.STORAGE.OBJECT_NOT_FOUND]: 'errors.storage.objectNotFound',
  [ERRORS.STORAGE.UNAUTHORIZED]: 'errors.storage.unauthorized',
  [ERRORS.AUTH.MISSING_EMAIL]: 'errors.auth.missingEmail',
  [ERRORS.AUTH.INVALID_EMAIL]: 'errors.auth.invalidEmail',
  [ERRORS.AUTH.VERIFY_EMAIL]: 'errors.auth.verifyEmail',
  [ERRORS.AUTH.MISSING_PASSWORD]: 'errors.auth.missingPassword',
  [ERRORS.AUTH.INVALID_CREDENTIAL]: 'errors.auth.invalidCredential',
  [ERRORS.AUTH.WEAK_PASSWORD]: 'errors.auth.weakPassword',
  [ERRORS.AUTH.EMAIL_ALREADY_IN_USE]: 'errors.auth.emailAlreadyInUse',
  [ERRORS.AUTH.USER_NOT_FOUND]: 'errors.auth.userNotFound',
  [ERRORS.AUTH.WRONG_PASSWORD]: 'errors.auth.wrongPassword',
  [ERRORS.AUTH.NETWORK_REQUEST_FAILED]: 'errors.auth.networkRequestFailed',
  [ERRORS.AUTH.REQUIRES_RECENT_LOGIN]: 'errors.auth.requiresRecentLogin',
  [ERRORS.AUTH.API_KEY_NOT_VALID]: 'errors.auth.apiKeyNotValid',
  [ERRORS.AUTH.TOO_MANY_REQUESTS]: 'errors.auth.tooManyRequests',
  [ERRORS.PERMISSION_DENIED]: 'errors.permissionDenied',
  [ERRORS.DATABASE.DATA_FETCH_FAILED]: 'errors.database.dataFetchFailed',
  [ERRORS.DATABASE.OUTDATED_APP_VERSION]: 'errors.database.outdatedAppVersion',
  [ERRORS.DATABASE.ACCOUNT_CREATION_LIMIT_EXCEEDED]:
    'errors.database.accountCreationLimitExceeded',
  [ERRORS.DATABASE.USER_CREATION_FAILED]: 'errors.database.userCreationFailed',
  [ERRORS.ONYX.GENERIC]: 'errors.onxy.generic',
  [ERRORS.USER.COULD_NOT_UNFRIEND]: 'errors.user.couldNotUnfriend',
  [ERRORS.UNKNOWN]: 'errors.unknown',
};

export default ERROR_MAPPING;
