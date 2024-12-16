// for the process.env variables to read the .env file
import type {Auth} from 'firebase/auth';
import {
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator,
  updateProfile,
} from 'firebase/auth';
import type {FirebaseApp} from 'firebase/app';
import {initializeApp, deleteApp} from 'firebase/app';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {isConnectedToAuthEmulator} from '@src/libs/Firebase/FirebaseUtils';
import {signUpUserWithEmailAndPassword} from '@src/libs/auth/auth';
import CONFIG from '@src/CONFIG';
import {MOCK_USER_IDS} from '../utils/testsStatic';
import {getTestAuthDomain} from './utils';

require('dotenv').config();

function setup(): {
  testApp: FirebaseApp;
  auth: Auth;
} {
  const authDomain = getTestAuthDomain();
  const projectId = CONFIG.TEST_PROJECT_ID;

  const testApp = initializeApp({
    authDomain,
    projectId,
  });

  const auth = initializeAuth(testApp, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  connectAuthEmulator(auth, authDomain);

  return {testApp, auth};
}

async function teardown(testApp: FirebaseApp): Promise<void> {
  await deleteApp(testApp); // Delete the app
}

const AuthEmulator = {setup, teardown};

export default AuthEmulator;
