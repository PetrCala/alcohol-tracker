// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {
  ref,
  get,
  set,
} from 'firebase/database';
import {FirebaseApp} from 'firebase/app';
import {createMockDatabase, createMockSession} from '../../utils/mockDatabase';
import {isConnectedToDatabaseEmulator} from '@src/services/firebaseUtils';
import {DatabaseProps, UnitTypesProps} from '@src/types/database';
import {Database} from 'firebase/database';
import {describeWithEmulator} from '../../utils/emulators/emulatorTools';
import {saveDrinkingSessionData} from '@database/drinkingSessions';

import {MOCK_USER_IDS} from '../../utils/testsStatic';
import {readDataOnce} from '@database/baseFunctions';
import {setupGlobalMocks} from '../../utils/testUtils';
import { setupRealtimeDatabaseTestEnv, teardownRealtimeDatabaseTestEnv } from '../../utils/emulators/realtimeDatabaseSetup';
import { deleteUserInfo } from '@database/users';

const mockDatabase: DatabaseProps = createMockDatabase();
const testUserId: string = MOCK_USER_IDS[0];

describeWithEmulator('Test connecting to the realtime database emulator', () => {
  let testApp: FirebaseApp;
  let db: Database;
  setupGlobalMocks();

  beforeAll(async () => {
    ({ testApp, db } = setupRealtimeDatabaseTestEnv());
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
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  it('should connect to the emulator realtime database', async () => {
    expect(db).not.toBeNull();
    expect(isConnectedToDatabaseEmulator(db)).toBe(true);
  });

});

describeWithEmulator('Test saving a drinking session', () => {
  let testApp: FirebaseApp;
  let db: Database;
  setupGlobalMocks();

  beforeAll(async () => {
    ({ testApp, db } = setupRealtimeDatabaseTestEnv());
  });

  beforeEach(async () => {
    await set(ref(db), mockDatabase);
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
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

describeWithEmulator('Test saving and deleting user\'s data from the database', () => {
  let testApp: FirebaseApp;
  let db: Database;
  setupGlobalMocks();

  beforeAll(async () => {
    ({ testApp, db } = setupRealtimeDatabaseTestEnv());
  });

  beforeEach(async () => {
    await set(ref(db), mockDatabase);
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  it('pushes all new user info into the database', async () => {
  });

  it('deletes all user info from the database', async () => {

    const userBetaKey = `${testUserId}-beta`;
    const betaKeyData = await readDataOnce(db, `beta_keys`);
    console.log('hello-world')
    // let userNickname = userData.profile.display_name;
    // await deleteUserInfo(db, testUserId, userNickname); // beta feature
  });

  it('updates user last online in the database', async () => {
    expect(true).toBe(true);
  });

});