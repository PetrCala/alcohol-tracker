import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type NativeConfig = {
  ENVIRONMENT: DeepValueOf<typeof CONST.ENVIRONMENT>;
  API_KEY: string;
  AUTH_DOMAIN: string;
  DATABASE_URL: string;
  PROJECT_ID: string;
  STORAGE_BUCKET: string;
  MESSAGING_SENDER_ID: number;
  APP_ID: string;
  MEASUREMENT_ID: string;
  PUSHER_APP_KEY: string;
  PUSHER_DEV_SUFFIX: string;
  USE_WEB_PROXY?: string;
  SEND_CRASH_REPORTS?: string;
};

declare const Config: NativeConfig;

export default Config;
export type {NativeConfig};
