require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {
  getDatabase,
  connectDatabaseEmulator,
  goOffline,
} from 'firebase/database';
import {initializeApp, deleteApp, FirebaseApp} from 'firebase/app';
import {Database} from 'firebase/database';
import * as firebaseJson from '../../../firebase.json';
import {createMockDatabase} from '../mockDatabase';
import {ref, set} from 'firebase/database';

export function setupRealtimeDatabaseTestEnv(): {
  testApp: FirebaseApp;
  db: Database;
} {
  const databaseURL = process.env.TEST_DATABASE_URL;
  const projectId = process.env.TEST_PROJECT_ID;

  if (!databaseURL) {
    throw new Error(
      `Missing environment variable TEST_DATABASE_URL for storage emulator`,
    );
  }

  if (!projectId) {
    throw new Error(
      `Missing environment variable TEST_PROJECT_ID for storage emulator`,
    );
  }

  const testApp: FirebaseApp = initializeApp({
    databaseURL: databaseURL,
    projectId: projectId,
  });

  // Initialize the database
  let db: Database = getDatabase(testApp);
  const dbPort = parseInt(firebaseJson.emulators.database.port);
  connectDatabaseEmulator(db, 'localhost', dbPort);

  return {testApp, db};
}

export async function teardownRealtimeDatabaseTestEnv(
  testApp: FirebaseApp,
  db: Database,
): Promise<void> {
  goOffline(db); // Close database connection
  await deleteApp(testApp); // Delete the app
}

/** Given a database object, fill it with mock data.
 *
 * @param db Firebase Database object.
 * @param noFriends If set to true, no friends or friend requests will be created.
 * @returns The updated Database object.
 */
export async function fillDatabaseWithMockData(db: any, noFriends: boolean = false): Promise<void> {
  let mockDatabase = createMockDatabase(noFriends);
  await set(ref(db), mockDatabase);
  return db;
}
