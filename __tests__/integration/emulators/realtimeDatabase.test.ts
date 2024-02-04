// !! Run using npm test - to run using bun test, resolve first issue with Config -> mock react-native-config

require('dotenv').config(); // Use .env variables in this file - CONFIG does not work here
import {ref, get, set} from 'firebase/database';
import {FirebaseApp} from 'firebase/app';
import {
  createMockConfig,
  createMockMaintenance,
  createMockSession,
  createMockUserStatus,
} from '../../utils/mockDatabase';
import {isConnectedToDatabaseEmulator} from '@src/services/firebaseUtils';
import {
  BetaKeyProps,
  FriendRequestData,
  MaintenanceProps,
  ProfileData,
  UnitTypesProps,
} from '@src/types/database';
import {Database} from 'firebase/database';
import {describeWithEmulator} from '../../utils/emulators/emulatorTools';
import {saveDrinkingSessionData} from '@database/drinkingSessions';

import {MOCK_USER_IDS} from '../../utils/testsStatic';
import {readDataOnce} from '@database/baseFunctions';
import {setupGlobalMocks} from '../../utils/testUtils';
import {
  fillDatabaseWithMockData,
  setupRealtimeDatabaseTestEnv,
  teardownRealtimeDatabaseTestEnv,
} from '../../utils/emulators/realtimeDatabaseSetup';
import {
  deleteUserData,
  getDefaultPreferences,
  getDefaultUserData,
  getDefaultUserStatus,
  pushNewUserInfo,
} from '@database/users';
import {cleanStringForFirebaseKey} from '@src/utils/strings';
import {
  acceptFriendRequest,
  deleteFriendRequest,
  isFriend,
  sendFriendRequest,
  unfriend,
} from '@database/friends';

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
const mockUserStatus = createMockUserStatus(
  mockSessionKey,
  mockDrinkingSession,
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
      await fillDatabaseWithMockData(db);
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
    await fillDatabaseWithMockData(db);
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

describeWithEmulator('Test config functionality', () => {
  let testApp: FirebaseApp;
  let db: Database;
  setupGlobalMocks();

  beforeAll(async () => {
    ({testApp, db} = setupRealtimeDatabaseTestEnv());
  });

  beforeEach(async () => {
    await fillDatabaseWithMockData(db);
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  it('should correctly read the config', async () => {
    const expectedConfig = createMockConfig();
    const configRef = 'config';
    const config = await readDataOnce(db, configRef);
    expect(config).not.toBeNull();
    expect(config).toEqual(expectedConfig);
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
    await fillDatabaseWithMockData(db);
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  it('should correctly save user status info', async () => {
    await set(ref(db, `user_status/${testUserId}`), mockUserStatus);
    const newSessionInfo = await readDataOnce(db, `user_status/${testUserId}`);
    expect(newSessionInfo).toEqual(newSessionInfo);
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
    await fillDatabaseWithMockData(db);

    let userList = await readDataOnce(db, 'user_status'); // Arbitrary node with all user ids in top level
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
    expect(dbUserData).toMatchObject(expectedData);
  });

  it('pushes the user status into the database', async () => {
    const expectedStatus = getDefaultUserStatus();
    const dbStatusData = await readDataOnce(db, `user_status/${newUserId}`);
    expect(dbStatusData).toMatchObject({
      ...expectedStatus,
      last_online: expect.any(Number),
    });
    expect(dbStatusData.last_online).toBeCloseTo(
      expectedStatus.last_online,
      -2,
    ); // Within 100ms
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
    await fillDatabaseWithMockData(db);
    await deleteUserData(
      db,
      testUserId,
      testUserDisplayName,
      1,
      undefined,
      undefined,
    ); // beta feature // TODO: Add friend requests, friends
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

  it('deletes the user status data from the database', async () => {
    const dbSessionData = await readDataOnce(db, `user_status/${testUserId}`);
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
    await fillDatabaseWithMockData(db, true); // No friends
    await deleteUserData(
      db,
      testUserId,
      testUserDisplayName,
      1,
      undefined,
      undefined,
    ); // beta feature
    const friends = await readDataOnce(db, `users/${testUserId}/friends`);
    const friendRequests = await readDataOnce(
      db,
      `users/${testUserId}/friend_requests`,
    );
    expect(friends).toBeNull();
    expect(friendRequests).toBeNull();
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  it('should correctly determine friends', async () => {
    await set(ref(db, `users/${testUserId}/friends/${testUserId2}`), true);
    await set(ref(db, `users/${testUserId2}/friends/${testUserId}`), true);
    const usersAreFriends = await isFriend(db, testUserId, testUserId2);
    expect(usersAreFriends).toBe(true);
  });

  it('should send a friend request', async () => {
    const expectedRequestsUser1: FriendRequestData = {
      [testUserId2]: 'sent',
    };
    const expectedRequestsUser2: FriendRequestData = {
      [testUserId]: 'received',
    };
    await sendFriendRequest(db, testUserId, testUserId2);
    const user1FriendRequests = await readDataOnce(
      db,
      `users/${testUserId}/friend_requests`,
    );
    const user2FriendRequests = await readDataOnce(
      db,
      `users/${testUserId2}/friend_requests`,
    );
    expect(user1FriendRequests).toMatchObject(expectedRequestsUser1);
    expect(user2FriendRequests).toMatchObject(expectedRequestsUser2);
  });

  it('should delete a friend request', async () => {
    await set(
      ref(db, `users/${testUserId}/friend_requests/${testUserId2}`),
      'sent',
    );
    await set(
      ref(db, `users/${testUserId2}/friend_requests/${testUserId}`),
      'received',
    );
    await deleteFriendRequest(db, testUserId, testUserId2);
    const user1FriendRequests = await readDataOnce(
      db,
      `users/${testUserId}/friend_requests`,
    );
    const user2FriendRequests = await readDataOnce(
      db,
      `users/${testUserId2}/friend_requests`,
    );
    expect(user1FriendRequests).toBeNull();
    expect(user2FriendRequests).toBeNull();
  });

  it('should accept a friend request', async () => {
    await set(
      ref(db, `users/${testUserId}/friend_requests/${testUserId2}`),
      'sent',
    );
    await set(
      ref(db, `users/${testUserId2}/friend_requests/${testUserId}`),
      'received',
    );
    await acceptFriendRequest(db, testUserId, testUserId2);
    const user1FriendRequests = await readDataOnce(
      db,
      `users/${testUserId}/friend_requests`,
    );
    const user2FriendRequests = await readDataOnce(
      db,
      `users/${testUserId2}/friend_requests`,
    );
    expect(user1FriendRequests).toBeNull();
    expect(user2FriendRequests).toBeNull();

    const user1Friends = await readDataOnce(db, `users/${testUserId}/friends`);
    const user2Friends = await readDataOnce(db, `users/${testUserId2}/friends`);
    expect(user1Friends).toMatchObject({[testUserId2]: true});
    expect(user2Friends).toMatchObject({[testUserId]: true});
  });

  it('should unfriend a user', async () => {
    await set(ref(db, `users/${testUserId}/friends/${testUserId2}`), true);
    await set(ref(db, `users/${testUserId2}/friends/${testUserId}`), true);
    await unfriend(db, testUserId, testUserId2);
    const user1Friends = await readDataOnce(db, `users/${testUserId}/friends`);
    const user2Friends = await readDataOnce(db, `users/${testUserId2}/friends`);
    expect(user1Friends).toBeNull();
    expect(user2Friends).toBeNull();

    const usersAreFriends = await isFriend(db, testUserId, testUserId2); // Extra check
    expect(usersAreFriends).toBe(false);
  });
});
