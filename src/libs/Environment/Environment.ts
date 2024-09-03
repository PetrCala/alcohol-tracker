import Config from 'react-native-config';
import CONST from '@src/CONST';
import getEnvironment from './getEnvironment';

/**
 * Are we running the app in development?
 */
function isDevelopment(): boolean {
  return (
    (Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.DEV
  );
}

/**
 * Are we running the app in production?
 */
function isProduction(): Promise<boolean> {
  return getEnvironment().then(
    environment => environment === CONST.ENVIRONMENT.PROD,
  );
}

/**
 * Are we running an internal test build?
 */
function isInternalTestBuild(): boolean {
  return !!(
    (Config?.ENVIRONMENT ?? CONST.ENVIRONMENT.DEV) === CONST.ENVIRONMENT.TEST &&
    (Config?.PULL_REQUEST_NUMBER ?? '')
  );
}

export {getEnvironment, isInternalTestBuild, isDevelopment, isProduction};
