import Config from 'react-native-config';
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { isConnectedToAuthEmulator } from './firebaseUtils';

const isTestEnv = process.env.NODE_ENV === 'test'|| Config.USE_EMULATORS === 'true';
const envPrefix = isTestEnv ? 'TEST_' : '';

const firebaseConfig = {
  apiKey: Config[`${envPrefix}API_KEY`],
  authDomain: Config[`${envPrefix}AUTH_DOMAIN`],
  databaseURL: Config[`${envPrefix}DATABASE_URL`],
  projectId: Config[`${envPrefix}PROJECT_ID`],
  storageBucket: Config[`${envPrefix}STORAGE_BUCKET`],
  messagingSenderId: Config[`${envPrefix}MESSAGING_SENDER_ID`],
  appId: Config[`${envPrefix}APP_ID`],
  measurementId: Config[`${envPrefix}MEASUREMENT_ID`]
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Connect to auth emulator if in development environment
if (isTestEnv) {
  const authUrl = Config[`${envPrefix}AUTH_DOMAIN`];

  if (!isConnectedToAuthEmulator(auth)){
    connectAuthEmulator(auth, authUrl);
  }
}

export { app, auth, firebaseConfig };
