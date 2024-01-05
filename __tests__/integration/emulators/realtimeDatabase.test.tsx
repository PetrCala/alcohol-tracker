// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {
  getDatabase,
  connectDatabaseEmulator,
  ref,
  get,
  set,
  goOffline,
} from 'firebase/database';
import {initializeApp, deleteApp, FirebaseApp} from 'firebase/app';
import {createMockDatabase, createMockSession} from '../../utils/mockDatabase';
import {isConnectedToDatabaseEmulator} from '@src/services/firebaseUtils';
import {DatabaseProps, UnitTypesProps} from '@src/types/database';
import {Database} from 'firebase/database';
import {describeWithEmulator} from '../../utils/emulatorTools';
import * as firebaseRules from '../../../firebase.json';
import {saveDrinkingSessionData} from '@database/drinkingSessions';

import {MOCK_SESSION_IDS, MOCK_USER_IDS} from '../../utils/testsStatic';
import {readDataOnce} from '@database/baseFunctions';

const databaseURL = process.env.TEST_DATABASE_URL;
const projectId = process.env.TEST_PROJECT_ID;
if (!databaseURL || !projectId) {
  throw new Error(
    `Missing environment variables ${databaseURL} or ${projectId} for storage emulator`,
  );
}

describeWithEmulator('Connect to the realtime database emulator', () => {
  let testApp: FirebaseApp;
  let db: Database;
  let mockDatabase: DatabaseProps;
  let testUserId: string = MOCK_USER_IDS[0];

  beforeAll(async () => {
    testApp = initializeApp({
      databaseURL: databaseURL,
      projectId: projectId,
    });

    // Initialize the database
    db = getDatabase(testApp);
    const dbPort = parseInt(firebaseRules.emulators.database.port);
    connectDatabaseEmulator(db, 'localhost', dbPort);

    // Fill the database with mock data
    mockDatabase = createMockDatabase();
  });

  // Set up the database before each test
  beforeEach(async () => {
    await set(ref(db), mockDatabase);
  });

  // Write null to clear the database.
  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    goOffline(db); // Close database connection
    await deleteApp(testApp); // Delete the app
  });

  it('should connect to the emulator realtime database', async () => {
    expect(db).not.toBeNull();
    expect(isConnectedToDatabaseEmulator(db)).toBe(true);
  });

  it('should write non-empty mock data', async () => {
    async function getDatabaseRef() {
      var tempRef = ref(db, 'config');
      const snapshot = await get(tempRef); // One-off fetch
      return snapshot;
    }
    const data = await getDatabaseRef();
    expect(data.exists()).toBe(true);
    expect(data.val()).not.toBeNull();
  });

  it('should save drinking session data', async () => {
    const sessionUnits: UnitTypesProps = {
      beer: 2,
    };
    const drinkingSession = createMockSession(
      new Date(),
      undefined,
      sessionUnits,
      undefined,
    );

    expect(drinkingSession).not.toBeNull();
    expect(drinkingSession.ongoing).toBe(undefined);

    const sessionKey = `${testUserId}-mock-session-0`;
    await saveDrinkingSessionData(db, testUserId, drinkingSession, sessionKey);
    const userSessionRef = `user_drinking_sessions/${testUserId}/${sessionKey}`;
    const userSession = await readDataOnce(db, userSessionRef);

    expect(userSession).not.toBeNull();
    expect(userSession).toMatchObject(drinkingSession);
    // To match only some attributes
    // expect(userSession).toMatchObject({
    //     ...drinkingSession,
    //     ongoing: undefined,
    //     end_time: expect.anything(),
    // });
  });
});
