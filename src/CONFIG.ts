// Taken and modified form the Expensify GitHub
// Source: https://github.com/Expensify/App/blob/main/src/CONFIG.ts

import Config, {NativeConfig} from 'react-native-config';
import CONST from './CONST';

// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to prevent headaches
const get = (config: NativeConfig, key: string, defaultValue: string): string => (config?.[key] ?? defaultValue).trim();

// Set default values to contributor friendly values to make development work out of the box without an .env file
const ENVIRONMENT = get(Config, 'ENVIRONMENT', CONST.ENVIRONMENT.DEV);

// Throw errors on dev if config variables are not set correctly
if (ENVIRONMENT === CONST.ENVIRONMENT.DEV) {
    // throw errors if necessary
}

export default {
    APP_NAME: get(Config, 'APP_NAME', 'Kiroku'),
    APP_ENVIRONMENT: get(Config, 'APP_ENVIRONMENT', ''),
    DB_CONFIG_PROD: {
        API_KEY: get(Config, 'API_KEY', ''),
        AUTH_DOMAIN: get(Config, 'AUTH_DOMAIN', ''),
        DATABASE_URL: get(Config, 'DATABASE_URL', ''),
        PROJECT_ID: get(Config, 'PROJECT_ID', ''),
        STORAGE_BUCKET: get(Config, 'STORAGE_BUCKET', ''),
        MESSAGING_SENDER_ID: get(Config, 'MESSAGING_SENDER_ID', ''),
        APP_ID: get(Config, 'APP_ID', ''),
        MEASUREMENT_ID: get(Config, 'MEASUREMENT_ID', ''),
    },
    DB_CONFIG_TEST: {
        API_KEY: get(Config, 'TEST_API_KEY', ''),
        AUTH_DOMAIN: get(Config, 'TEST_AUTH_DOMAIN', ''),
        DATABASE_URL: get(Config, 'TEST_DATABASE_URL', ''),
        PROJECT_ID: get(Config, 'TEST_PROJECT_ID', ''),
        STORAGE_BUCKET: get(Config, 'TEST_STORAGE_BUCKET', ''),
        MESSAGING_SENDER_ID: get(Config, 'TEST_MESSAGING_SENDER_ID', ''),
        APP_ID: get(Config, 'TEST_APP_ID', ''),
        MEASUREMENT_ID: get(Config, 'TEST_MEASUREMENT_ID', ''),
    },
    GOOGLE_SIGN_KEY: {
        MYAPP_RELEASE_STORE_FILE: get(Config, 'MYAPP_RELEASE_STORE_FILE', ''),
        MYAPP_RELEASE_KEY_ALIAS: get(Config, 'MYAPP_RELEASE_KEY_ALIAS', ''),
        MYAPP_RELEASE_STORE_PASSWORD: get(Config, 'MYAPP_RELEASE_STORE_PASSWORD', ''),
        MYAPP_RELEASE_KEY_PASSWORD: get(Config, 'MYAPP_RELEASE_KEY_PASSWORD', ''),
    }
} as const;