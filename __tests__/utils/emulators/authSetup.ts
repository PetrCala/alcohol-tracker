require('dotenv').config(); // for the process.env variables to read the .env file
import {MOCK_USER_IDS} from '../testsStatic';
import {signUpUserWithEmailAndPassword} from '../../../src/libs/auth/auth';
import {
  initializeAuth,
  getReactNativePersistence,
  connectAuthEmulator,
  Auth,
} from 'firebase/auth';
import {initializeApp, deleteApp, FirebaseApp} from 'firebase/app';
import {isConnectedToAuthEmulator} from '../../../src/libs/Firebase/FirebaseUtils';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

export function setupAuthTestEnv(): {
  testApp: FirebaseApp;
  auth: Auth;
} {
  const authDomain = process.env.TEST_AUTH_DOMAIN;
  const projectId = process.env.TEST_PROJECT_ID;
  if (!authDomain || !projectId) {
    throw new Error(
      `Missing environment variables ${authDomain} or ${projectId} for storage emulator`,
    );
  }
  const testApp = initializeApp({
    authDomain: authDomain,
    projectId: projectId,
  });

  let auth = initializeAuth(testApp, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  connectAuthEmulator(auth, authDomain);

  return {testApp, auth};
}

export async function teardownAuthTestEnv(testApp: FirebaseApp): Promise<void> {
  await deleteApp(testApp); // Delete the app
}

/** Using an emulator authentication object, create authenticated users
 * in the authentication emulator.
 *
 * @param emulatorAuth Auth object from the emulator.
 * @returns Promise<void>
 */
export async function createMockAuthUsers(emulatorAuth: Auth): Promise<void> {
  if (!isConnectedToAuthEmulator) {
    throw new Error('Not connected to the auth emulator');
  }
  MOCK_USER_IDS.forEach(userId => async () => {
    let email = `${userId}@gmail.com`;
    let password = 'mock-password';

    try {
      await signUpUserWithEmailAndPassword(emulatorAuth, email, password);
    } catch (error) {
      throw new Error(`Error creating mock user ${userId}: ${error}`);
    }
  });
}
