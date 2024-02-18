// Taken and modified form the Expensify GitHub
// Source: https://github.com/Expensify/App/blob/main/src/CONFIG.ts

import Config, {NativeConfig} from 'react-native-config';
import CONST from './CONST';
import {Platform} from 'react-native';

// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to prevent headaches
const get = (config: NativeConfig, key: string, defaultValue: string): string =>
  (config?.[key] ?? defaultValue).trim();

// Set default values to contributor friendly values to make development work out of the box without an .env file
const ENVIRONMENT = get(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV);

// Throw errors on dev if config variables are not set correctly
if (ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
  // throw errors if necessary
}

export default {
  APP_NAME: 'Kiroku',
  COMPONENT_NAME: Platform.OS === 'ios' ? 'kiroku' : 'alcohol_tracker',
  APP_ENVIRONMENT: get(Config, 'APP_ENVIRONMENT', CONST.ENVIRONMENT.DEV),
  ADMIN_SDK: {
    PROD: get(Config, 'ADMIN_SDK_PROD', ''),
    DEV: get(Config, 'ADMIN_SDK_DEV', ''),
  },
  DB_CONFIG_PROD: {
    // The keys have to be camelcase for firebase to work
    apiKey: get(Config, 'PROD_API_KEY', ''),
    authDomain: get(Config, 'PROD_AUTH_DOMAIN', ''),
    databaseURL: get(Config, 'PROD_DATABASE_URL', ''),
    projectId: get(Config, 'PROD_PROJECT_ID', ''),
    storageBucket: get(Config, 'PROD_STORAGE_BUCKET', ''),
    messagineSenderId: get(Config, 'PROD_MESSAGING_SENDER_ID', ''),
    appId: get(Config, 'PROD_APP_ID', ''),
    measurementId: get(Config, 'PROD_MEASUREMENT_ID', ''),
  },
  DB_CONFIG_DEV: {
    apiKey: get(Config, 'DEV_API_KEY', ''),
    authDomain: get(Config, 'DEV_AUTH_DOMAIN', ''),
    databaseURL: get(Config, 'DEV_DATABASE_URL', ''),
    projectId: get(Config, 'DEV_PROJECT_ID', ''),
    storageBucket: get(Config, 'DEV_STORAGE_BUCKET', ''),
    messagineSenderId: get(Config, 'DEV_MESSAGING_SENDER_ID', ''),
    appId: get(Config, 'DEV_APP_ID', ''),
    measurementId: get(Config, 'DEV_MEASUREMENT_ID', ''),
  },
  DB_CONFIG_TEST: {
    apiKey: get(Config, 'TEST_API_KEY', ''),
    authDomain: get(Config, 'TEST_AUTH_DOMAIN', ''),
    databaseURL: get(Config, 'TEST_DATABASE_URL', ''),
    projectId: get(Config, 'TEST_PROJECT_ID', ''),
    storageBucket: get(Config, 'TEST_STORAGE_BUCKET', ''),
    messagineSenderId: get(Config, 'TEST_MESSAGING_SENDER_ID', ''),
    appId: get(Config, 'TEST_APP_ID', ''),
    measurementId: get(Config, 'TEST_MEASUREMENT_ID', ''),
  },
  GOOGLE_SIGN_KEY: {
    MYAPP_RELEASE_STORE_FILE: get(Config, 'MYAPP_RELEASE_STORE_FILE', ''),
    MYAPP_RELEASE_KEY_ALIAS: get(Config, 'MYAPP_RELEASE_KEY_ALIAS', ''),
    MYAPP_RELEASE_STORE_PASSWORD: get(
      Config,
      'MYAPP_RELEASE_STORE_PASSWORD',
      '',
    ),
    MYAPP_RELEASE_KEY_PASSWORD: get(Config, 'MYAPP_RELEASE_KEY_PASSWORD', ''),
  },
  SITE_TITLE: 'Kiroku',
} as const;
