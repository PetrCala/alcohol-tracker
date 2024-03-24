import {
  initializeApp,
  getApp,
  getApps,
  FirebaseApp as FirebaseAppProps,
} from 'firebase/app';
import FirebaseConfig from './FirebaseConfig';

const FirebaseApp: FirebaseAppProps =
  getApps().length === 0 ? initializeApp(FirebaseConfig) : getApp();

export {FirebaseApp};
export type {FirebaseAppProps};
