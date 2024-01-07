// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

// TODO - remaining an error where 'getReactNativePersistence' is not a function
jest.mock('@react-native-async-storage/async-storage', () => ({}));

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator,
  Auth,
} from 'firebase/auth';
import {initializeApp, deleteApp, FirebaseApp} from 'firebase/app';
import {isConnectedToAuthEmulator} from '@src/services/firebaseUtils';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {describeWithEmulator} from '../../utils/emulators/emulatorTools';

const authDomain = process.env.TEST_AUTH_DOMAIN;
const projectId = process.env.TEST_PROJECT_ID;
if (!authDomain || !projectId) {
  throw new Error(
    `Missing environment variables ${authDomain} or ${projectId} for storage emulator`,
  );
}

describeWithEmulator('Connect to the storage emulator', () => {
  let testApp: FirebaseApp;
  let auth: Auth;

  beforeAll(async () => {
    testApp = initializeApp({
      authDomain: authDomain,
      projectId: projectId,
    });

    auth = initializeAuth(testApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
    connectAuthEmulator(auth, authDomain);
  });

  beforeEach(async () => {
    // do something
  });

  afterEach(async () => {
    // do something
  });

  afterAll(async () => {
    await deleteApp(testApp); // Delete the app
  });

  xit('should connect to the auth emulator', async () => {
    expect(auth).not.toBeNull();
    expect(isConnectedToAuthEmulator(auth)).toBe(true);
  });
});
