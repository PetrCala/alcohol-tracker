// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {ref, get, set} from 'firebase/database';
import {FirebaseApp} from 'firebase/app';
import {createMockDatabase, createMockSession} from '../../utils/mockDatabase';
import {isConnectedToDatabaseEmulator} from '@src/services/firebaseUtils';
import {
  BetaKeyProps,
  DatabaseProps,
  ProfileData,
  UnitTypesProps,
} from '@src/types/database';
import {Database} from 'firebase/database';
import {describeWithEmulator} from '../../utils/emulators/emulatorTools';
import {
  saveDrinkingSessionData,
} from '@database/drinkingSessions';

import {MOCK_USER_IDS} from '../../utils/testsStatic';
import {readDataOnce} from '@database/baseFunctions';
import {setupGlobalMocks} from '../../utils/testUtils';
import {
  setupRealtimeDatabaseTestEnv,
  teardownRealtimeDatabaseTestEnv,
} from '../../utils/emulators/realtimeDatabaseSetup';
import {
  deleteUserInfo,
  getDefaultPreferences,
  getDefaultUserData,
  pushNewUserInfo,
} from '@database/users';
import {cleanStringForFirebaseKey} from '@src/utils/strings';
import { sendFriendRequest } from '@database/friends';

const mockDatabase: DatabaseProps = createMockDatabase();
const testUserId: string = MOCK_USER_IDS[0];
const testUserDisplayName: string = 'mock-user';
const testUserBetaKey: string = 'beta-key-1';
const testUserId2: string = MOCK_USER_IDS[1];

const mockSessionKey = `${testUserId}-mock-session-999`;
const mockSessionUnits: UnitTypesProps = {
  beer: 2,
  wine: 1,
  other: 3,
};
const mockDrinkingSession = createMockSession(
  new Date(),
  undefined,
  mockSessionUnits,
  undefined,
);

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

describeWithEmulator('Test realtime database emulator', () => {
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
});

describeWithEmulator('Test drinking session functionality', () => {
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

  it('should correctly save current session id', async () => {
    await set(ref(db, `user_current_session/${testUserId}`), mockSessionKey);
    const newSessionKey = await readDataOnce(db, `user_current_session/${testUserId}/current_session_id`);
    const expectedSessionKey = mockSessionKey;
    expect(newSessionKey).toEqual(expectedSessionKey);
  });

  it('should save drinking session data', async () => {
    await saveDrinkingSessionData(
      db,
      testUserId,
      mockDrinkingSession,
      mockSessionKey,
    );

    const userSessionRef = `user_drinking_sessions/${testUserId}/${mockSessionKey}`;
    const userSession = await readDataOnce(db, userSessionRef);

    expect(userSession).not.toBeNull();
    expect(userSession).toMatchObject(mockDrinkingSession);
  });
});

describeWithEmulator('Test pushing new user info into the database', () => {
  let testApp: FirebaseApp;
  let db: Database;
  let newUserDisplayName = 'mock-user-6';
  let newUserProfileData: ProfileData = {
    display_name: newUserDisplayName,
    photo_url: '',
  };
  let newUserId = 'mock-user-6'; // This user should not be created in the mock database
  let newUserBetaKeyId = 6;
  setupGlobalMocks();

  beforeAll(async () => {
    ({testApp, db} = setupRealtimeDatabaseTestEnv());
  });

  beforeEach(async () => {
    await set(ref(db), mockDatabase);

    let userList = await readDataOnce(db, 'user_current_session'); // Arbitrary node with all user ids in top level
    const userKeys = Object.keys(userList);
    expect(userKeys).not.toContain(newUserId); // Check that the user does not exist in the mock database

    await pushNewUserInfo(db, newUserId, newUserProfileData, newUserBetaKeyId);
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  it('pushes the beta keys data into the database', async () => {
    const expectedBetaKey = {
      in_usage: true,
      key: expect.anything(),
      user_id: newUserId,
    };
    const dbBetaKey: BetaKeyProps = await readDataOnce(
      db,
      `beta_keys/${newUserBetaKeyId}`,
    );
    expect(dbBetaKey).toMatchObject(expectedBetaKey);
  });

  it('pushes the nickname to id data into the database', async () => {
    const expectedNickname = newUserDisplayName;
    const nicknameKey = cleanStringForFirebaseKey(
      newUserProfileData.display_name,
    );
    const dbNickname: string = await readDataOnce(
      db,
      `nickname_to_id/${nicknameKey}/${newUserId}`,
    );
    expect(dbNickname).toEqual(expectedNickname);
  });

  it('pushes the user preferences into the database', async () => {
    const expectedPreferences = getDefaultPreferences();
    const dbPreferencesData = await readDataOnce(
      db,
      `user_preferences/${newUserId}`,
    );
    expect(dbPreferencesData).toMatchObject(expectedPreferences);
  });

  it('pushes the user data into the database', async () => {
    const expectedData = getDefaultUserData(
      newUserProfileData,
      newUserBetaKeyId,
    );
    const dbUserData = await readDataOnce(db, `users/${newUserId}`);
    expect(dbUserData).toMatchObject({
      ...expectedData,
      last_online: expect.any(Number),
    });
    expect(dbUserData.last_online).toBeCloseTo(expectedData.last_online, -1); // Within 10ms
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
    await deleteUserInfo(db, testUserId, testUserDisplayName, 1); // beta feature
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  it('deletes the beta keys data from the database', async () => {
    const expectedBetaKey = {
      in_usage: false,
      key: testUserBetaKey,
    };
    const dbBetaKey: BetaKeyProps = await readDataOnce(db, `beta_keys/1`);
    expect(dbBetaKey).toMatchObject(expectedBetaKey);
  });

  it('deletes the user nickname ID data from the database', async () => {
    const nicknameKey = cleanStringForFirebaseKey(testUserDisplayName);
    const dbNickname = await readDataOnce(
      db,
      `nickname_to_id/${nicknameKey}/${testUserId}`,
    );
    expect(dbNickname).toBeNull();
  });

  it('deletes the user data from the database', async () => {
    const dbData = await readDataOnce(db, `users/${testUserId}`);
    expect(dbData).toBeNull();
  });

  it('deletes the current session data from the database', async () => {
    const dbSessionData = await readDataOnce(db, `sessions/${testUserId}`);
    expect(dbSessionData).toBeNull();
  });

  it('deletes the user preferences from the database', async () => {
    const dbPreferencesData = await readDataOnce(
      db,
      `user_preferences/${testUserId}`,
    );
    expect(dbPreferencesData).toBeNull();
  });

  it('deletes the user drinking sessions from the database', async () => {
    const dbSessionsData = await readDataOnce(
      db,
      `user_drinking_sessions/${testUserId}`,
    );
    expect(dbSessionsData).toBeNull();
  });

  it('deletes the user unconfirmed days from the database', async () => {
    const dbUnconfirmedDays = await readDataOnce(
      db,
      `user_unconfirmed_days/${testUserId}`,
    );
    expect(dbUnconfirmedDays).toBeNull();
  });
});

describeWithEmulator('Test friend request functionality', () => {
  let testApp: FirebaseApp;
  let db: Database;
  setupGlobalMocks();

  beforeAll(async () => {
    ({testApp, db} = setupRealtimeDatabaseTestEnv());
  });

  beforeEach(async () => {
    await set(ref(db), mockDatabase);
    await deleteUserInfo(db, testUserId, testUserDisplayName, 1); // beta feature
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  // TODO
  it('should send a friend request', async () => {
    // TODO
    expect(true).toBe(true);
    // await sendFriendRequest(db, testUserId, testUserId2);
  });

});
