import type {FirebaseApp as FirebaseAppProps} from 'firebase/app';
import {initializeApp, getApp, getApps} from 'firebase/app';
import FirebaseConfig from './FirebaseConfig';
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

let FirebaseApp: FirebaseAppProps;
let auth: Auth;

// Check for existing apps. Only initialize if none exist.
if (getApps().length === 0) {
  FirebaseApp = initializeApp(FirebaseConfig);
  auth = initializeAuth(FirebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  FirebaseApp = getApp();
  auth = getAuth();
}

export {FirebaseApp, auth};
export type {FirebaseAppProps};
