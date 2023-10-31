declare module '@env' {
    export const USE_EMULATORS: string;
    export const FIREBASE_DATABASE_EMULATOR_HOST: string;
    export const FIREBASE_STORAGE_EMULATOR_HOST: string;

    export const API_KEY: string;
    export const AUTH_DOMAIN: string;
    export const DATABASE_URL: string;
    export const PROJECT_ID: string;
    export const STORAGE_BUCKET: string;
    export const MESSAGING_SENDER_ID: string;
    export const APP_ID: string;
    export const MEASUREMENT_ID: string;

    export const MYAPP_RELEASE_STORE_FILE: string;
    export const MYAPP_RELEASE_KEY_ALIAS: string;
    export const MYAPP_RELEASE_STORE_PASSWORD: string;
    export const MYAPP_RELEASE_KEY_PASSWORD: string;
  }