import CONST from '@src/CONST';
import DeepValueOf from './utils/DeepValueOf';

declare module 'react-native-config' {
  export interface NativeConfig {
    ENVIRONMENT: DeepValueOf<typeof CONST.ENVIRONMENT>;
    API_KEY: string;
    AUTH_DOMAIN: string;
    DATABASE_URL: string;
    PROJECT_ID: string;
    STORAGE_BUCKET: string;
    MESSAGING_SENDER_ID: number;
    APP_ID: string;
    MEASUREMENT_ID: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
