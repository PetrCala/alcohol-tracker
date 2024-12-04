import type {FirebaseApp as FirebaseAppProps} from 'firebase/app';
import {initializeApp, getApp, getApps} from 'firebase/app';
import type {Auth} from 'firebase/auth';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FirebaseConfig from './FirebaseConfig';

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
