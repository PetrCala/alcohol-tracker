import { initializeApp, FirebaseOptions } from "firebase/app";
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { isConnectedToAuthEmulator } from './firebaseUtils';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';


const isTestEnv = process.env.NODE_ENV === 'test'|| CONFIG.APP_ENVIRONMENT === CONST.ENVIRONMENT.TEST;

const firebaseConfig:FirebaseOptions = isTestEnv ? CONFIG.DB_CONFIG_TEST : CONFIG.DB_CONFIG_PROD;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Connect to auth emulator if in development environment
if (isTestEnv) {
  const authUrl = firebaseConfig.authDomain;
  if (!authUrl) throw new Error('Auth URL not defined in firebaseConfig');

  if (!isConnectedToAuthEmulator(auth)){
    connectAuthEmulator(auth, authUrl);
  }
}

export { app, auth, firebaseConfig };
