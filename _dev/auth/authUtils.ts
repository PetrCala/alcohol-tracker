// Run the script using ts-node _dev/database/migration.tsx (install globally through npm install -g ts-node)

require('dotenv').config(); // for the process.env variables to read the .env file
import {connectAuthEmulator, getAuth, Auth} from 'firebase/auth';

// TODO delete later
import {MOCK_USER_IDS} from '../../__tests__/utils/testsStatic';
import {signUpUserWithEmailAndPassword} from '../../src/auth/auth';
import {deleteApp, initializeApp} from 'firebase/app';
import CONST from '../../src/CONST';

async function createMockAuthUsers(emulatorAuth: Auth): Promise<void> {
  MOCK_USER_IDS.forEach(userId => async () => {
    console.log('Creating user', userId, '...');
    let email = `${userId}@gmail.com`;
    let password = 'mock-password';

    try {
      await signUpUserWithEmailAndPassword(emulatorAuth, email, password);
    } catch (error) {
      throw new Error(`Error creating mock user ${userId}: ${error}`);
    }
  });
}

/** TODO rewrite */
export async function createAuthUsers() {
  if (process.env.APP_ENVIRONMENT != CONST.ENVIRONMENT.TEST) {
    console.error("Can not run this script outside the test environment")
    process.exit(1)
  }
  const authDomain = process.env.TEST_AUTH_DOMAIN;
  const projectId = process.env.TEST_PROJECT_ID;
  const apiKey = process.env.TEST_API_KEY;
  const testApp = initializeApp({
    authDomain: authDomain,
    projectId: projectId,
    apiKey: apiKey,
  });
  const auth = getAuth(testApp);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  await createMockAuthUsers(auth);
  await auth.signOut();
  await deleteApp(testApp); // Delete the app
}
