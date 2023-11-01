import { initializeApp } from "firebase/app";
import { initializeAuth, connectAuthEmulator, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import 'dotenv/config';

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

if (process.env.NODE_ENV === 'test' || process.env.USE_EMULATORS === 'true') {
  const FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (FIREBASE_AUTH_EMULATOR_HOST) {
    const [authHost, authPort] = FIREBASE_AUTH_EMULATOR_HOST.split(':');
    connectAuthEmulator(auth, `http://${authHost}:${authPort}`);
  } else {
    throw new Error("Could not connect to the authentification emulator.")
  }
}

export { app, auth };
