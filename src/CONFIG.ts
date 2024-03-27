// Taken and modified form the Expensify GitHub
// Source: https://github.com/Expensify/App/blob/main/src/CONFIG.ts

import Config, {NativeConfig} from 'react-native-config';
import CONST from './CONST';
import getPlatform from '@libs/getPlatform';

// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to prevent headaches
const get = (config: NativeConfig, key: string, defaultValue: string): string =>
  (config?.[key] ?? defaultValue).trim();

// Set default values to contributor friendly values to make development work out of the box without an .env file
const ENVIRONMENT = get(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV);

export default {
  APP_NAME: 'Kiroku',
  COMPONENT_NAME:
    getPlatform() === CONST.PLATFORM.IOS ? 'kiroku' : 'alcohol_tracker',
  ENVIRONMENT,
  FIREBASE_CONFIG: {
    apiKey: get(Config, 'API_KEY', ''),
    authDomain: get(Config, 'AUTH_DOMAIN', ''),
    databaseURL: get(Config, 'DATABASE_URL', ''),
    projectId: get(Config, 'PROJECT_ID', ''),
    storageBucket: get(Config, 'STORAGE_BUCKET', ''),
    messagingSenderId: get(Config, 'MESSAGING_SENDER_ID', ''),
    appId: get(Config, 'APP_ID', ''),
    measurementId: get(Config, 'MEASUREMENT_ID', ''),
  },
  IS_IN_PRODUCTION:
    // Platform.OS === 'web' ? process.env.NODE_ENV === 'production' : !__DEV__,
    process.env.NODE_ENV === 'production' && !__DEV__,
  IS_IN_STAGING: ENVIRONMENT === CONST.ENVIRONMENT.STAGING,
  IS_IN_DEVELOPMENT: ENVIRONMENT === CONST.ENVIRONMENT.DEV,
  IS_IN_TEST:
    process.env.NODE_ENV === 'test' || ENVIRONMENT === CONST.ENVIRONMENT.TEST,
  TEST_PROJECT_ID: 'alcohol-tracker-db',
  TEST_HOST: 'localhost',
  TEST_AUTH_PORT: 9099,
  TEST_REALTIME_DATABASE_PORT: 9001,
  TEST_STORAGE_BUCKET_PORT: 9199,
  SITE_TITLE: 'Kiroku',
} as const;
