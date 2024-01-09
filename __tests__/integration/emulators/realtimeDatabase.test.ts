// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {ref, get, set} from 'firebase/database';
import {FirebaseApp} from 'firebase/app';
import {createMockDatabase, createMockSession} from '../../utils/mockDatabase';
import {isConnectedToDatabaseEmulator} from '@src/services/firebaseUtils';
import {
  BetaKeyProps,
  BetaKeysProps,
  DatabaseProps,
  UnitTypesProps,
} from '@src/types/database';
import {Database} from 'firebase/database';
import {describeWithEmulator} from '../../utils/emulators/emulatorTools';
import {saveDrinkingSessionData} from '@database/drinkingSessions';

import {MOCK_USER_IDS} from '../../utils/testsStatic';
import {readDataOnce} from '@database/baseFunctions';
import {setupGlobalMocks} from '../../utils/testUtils';
import {
  setupRealtimeDatabaseTestEnv,
  teardownRealtimeDatabaseTestEnv,
} from '../../utils/emulators/realtimeDatabaseSetup';
import {deleteUserInfo} from '@database/users';
import {cleanStringForFirebaseKey} from '@src/utils/strings';

const mockDatabase: DatabaseProps = createMockDatabase();
const testUserId: string = MOCK_USER_IDS[0];
const testUserDisplayName: string = 'mock-user';
const testUserBetaKey: string = 'beta-key-1';

describeWithEmulator(
  'Test connecting to the realtime database emulator',
  () => {
    let testApp: FirebaseApp;
    let db: Database;
    setupGlobalMocks();

    beforeAll(async () => {
      ({testApp, db} = setupRealtimeDatabaseTestEnv());
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
  },
);

describeWithEmulator('Test saving a drinking session', () => {
  let testApp: FirebaseApp;
  let db: Database;
  setupGlobalMocks();

  beforeAll(async () => {
    ({testApp, db} = setupRealtimeDatabaseTestEnv());
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

describeWithEmulator('Pushes all new user info into the database', () => {
  let testApp: FirebaseApp;
  let db: Database;
  setupGlobalMocks();

  beforeAll(async () => {
    ({testApp, db} = setupRealtimeDatabaseTestEnv());
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

});

describeWithEmulator('Test deleting data from the database', () => {
  let testApp: FirebaseApp;
  let db: Database;
  setupGlobalMocks();

  beforeAll(async () => {
    ({testApp, db} = setupRealtimeDatabaseTestEnv());
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

  it('deletes the beta keys data from the database', async () => {
    await deleteUserInfo(db, testUserId, testUserDisplayName, 1); // beta feature
    const dbBetaKey: BetaKeyProps = await readDataOnce(db, `beta_keys/1`);
    expect(dbBetaKey).toMatchObject({
      in_usage: false,
      key: testUserBetaKey,
    });
  });

  it('deletes the user nickname ID data from the database', async () => {
    await deleteUserInfo(db, testUserId, testUserDisplayName, 1); // beta feature
    const nicknameKey = cleanStringForFirebaseKey(testUserDisplayName);
    const dbNickname = await readDataOnce(
      db,
      `nickname_to_id/${nicknameKey}/${testUserId}`,
    );
    expect(dbNickname).toBeNull();
  });

  it('deletes the user data from the database', async () => {
    await deleteUserInfo(db, testUserId, testUserDisplayName, 1); // beta feature
    const dbData = await readDataOnce(db, `users/${testUserId}`);
    expect(dbData).toBeNull();
  });

  it('deletes the current session data from the database', async () => {
    await deleteUserInfo(db, testUserId, testUserDisplayName, 1); // beta feature
    const dbSessionData = await readDataOnce(db, `sessions/${testUserId}`);
    expect(dbSessionData).toBeNull();
  });

  it('deletes the user preferences from the database', async () => {
    await deleteUserInfo(db, testUserId, testUserDisplayName, 1); // beta feature
    const dbPreferencesData = await readDataOnce(db, `user_preferences/${testUserId}`);
    expect(dbPreferencesData).toBeNull();
  });

  it('deletes the user drinking sessions from the database', async () => {
    await deleteUserInfo(db, testUserId, testUserDisplayName, 1); // beta feature
    const dbSessionsData = await readDataOnce(db, `user_drinking_sessions/${testUserId}`);
    expect(dbSessionsData).toBeNull();
  });

  it('deletes the user unconfirmed days from the database', async () => {
    await deleteUserInfo(db, testUserId, testUserDisplayName, 1); // beta feature
    const dbUnconfirmedDays = await readDataOnce(db, `user_unconfirmed_days/${testUserId}`);
    expect(dbUnconfirmedDays).toBeNull();
  });
});
