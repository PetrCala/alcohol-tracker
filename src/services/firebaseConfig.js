import Config from 'react-native-config';
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: Config.API_KEY,
    authDomain: Config.AUTH_DOMAIN,
    databaseURL: Config.DATABASE_URL,
    projectId: Config.PROJECT_ID,
    storageBucket: Config.STORAGE_BUCKET,
    messagingSenderId: Config.MESSAGING_SENDER_ID,
    appId: Config.APP_ID,
    measurementId: Config.MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Connect to auth emulator if in development environment
if (process.env.NODE_ENV === 'test' || Config.USE_EMULATORS === 'true') {
  const emulatorHost = Config.FIREBASE_AUTH_EMULATOR_HOST;
  const [authHost, authPort] = emulatorHost.split(':');

  connectAuthEmulator(auth, authHost, parseInt(authPort));
}

export { app, auth, firebaseConfig };
