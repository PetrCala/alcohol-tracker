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
import {isConnectedToDatabaseEmulator} from '@src/libs/Firebase/FirebaseUtils';
import {FriendRequestList, Profile, Drinks} from '@src/types/database';
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
import {cleanStringForFirebaseKey} from '@libs/StringUtils';
import {
  acceptFriendRequest,
  deleteFriendRequest,
  isFriend,
  sendFriendRequest,
  unfriend,
} from '@database/friends';
import DBPATHS from '@database/DBPATHS';
import CONST from '@src/CONST';

const testUserId: string = MOCK_USER_IDS[0];
const testUserDisplayName: string = 'mock-user';
const testUserId2: string = MOCK_USER_IDS[1];

const mockSessionKey = `${testUserId}-mock-session-999`;
const mockSessionDrinks: Drinks = {
  beer: 2,
  wine: 1,
  other: 3,
};
const mockDrinkingSession = createMockSession(
  new Date(),
  undefined,
  mockSessionDrinks,
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
    const config = await readDataOnce(db, DBPATHS.CONFIG);
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
    const dbRef = DBPATHS.USER_STATUS_USER_ID.getRoute(testUserId);
    await set(ref(db, dbRef), mockUserStatus);
    const newSessionInfo = await readDataOnce(db, dbRef);
    expect(newSessionInfo).toEqual(newSessionInfo);
  });

  it('should save drinking session data', async () => {
    await saveDrinkingSessionData(
      db,
      testUserId,
      mockDrinkingSession,
      mockSessionKey,
    );

    const userSessionRef =
      DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID.getRoute(
        testUserId,
        mockSessionKey,
      );
    const userSession = await readDataOnce(db, userSessionRef);

    expect(userSession).not.toBeNull();
    expect(userSession).toMatchObject(mockDrinkingSession);
  });
});

describeWithEmulator('Test pushing new user info into the database', () => {
  let testApp: FirebaseApp;
  let db: Database;
  let newUserDisplayName = 'mock-user-6';
  let newUserProfileData: Profile = {
    display_name: newUserDisplayName,
    photo_url: '',
  };
  let newUserId = 'mock-user-6'; // This user should not be created in the mock database
  setupGlobalMocks();

  beforeAll(async () => {
    ({testApp, db} = setupRealtimeDatabaseTestEnv());
  });

  beforeEach(async () => {
    await fillDatabaseWithMockData(db);

    let userList = await readDataOnce(db, DBPATHS.USER_STATUS); // Arbitrary node with all user ids in top level
    const userKeys = Object.keys(userList);
    expect(userKeys).not.toContain(newUserId); // Check that the user does not exist in the mock database

    await pushNewUserInfo(db, newUserId, newUserProfileData);
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  it('pushes the nickname to id data into the database', async () => {
    const expectedNickname = newUserDisplayName;
    const nicknameKey = cleanStringForFirebaseKey(
      newUserProfileData.display_name,
    );
    const dbRef = DBPATHS.NICKNAME_TO_ID_NICKNAME_KEY_USER_ID.getRoute(
      nicknameKey,
      newUserId,
    );
    const dbNickname: string = await readDataOnce(db, dbRef);
    expect(dbNickname).toEqual(expectedNickname);
  });

  it('pushes the user preferences into the database', async () => {
    const expectedPreferences = getDefaultPreferences();
    const dbRef = DBPATHS.USER_PREFERENCES_USER_ID.getRoute(newUserId);
    const dbPreferencesData = await readDataOnce(db, dbRef);
    expect(dbPreferencesData).toMatchObject(expectedPreferences);
  });

  it('pushes the user data into the database', async () => {
    const expectedData = getDefaultUserData(newUserProfileData);
    const dbRef = DBPATHS.USERS_USER_ID.getRoute(newUserId);
    const dbUserData = await readDataOnce(db, dbRef);
    expect(dbUserData).toMatchObject(expectedData);
  });

  it('pushes the user status into the database', async () => {
    const expectedStatus = getDefaultUserStatus();
    const dbRef = DBPATHS.USER_STATUS_USER_ID.getRoute(newUserId);
    const dbStatusData = await readDataOnce(db, dbRef);
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
      undefined,
      undefined,
    ); // TODO: Add friend requests, friends
  });

  afterEach(async () => {
    await set(ref(db), null);
  });

  afterAll(async () => {
    await teardownRealtimeDatabaseTestEnv(testApp, db);
  });

  it('deletes the user nickname ID data from the database', async () => {
    const nicknameKey = cleanStringForFirebaseKey(testUserDisplayName);
    const dbRef = DBPATHS.NICKNAME_TO_ID_NICKNAME_KEY_USER_ID.getRoute(
      nicknameKey,
      testUserId,
    );
    const dbNickname = await readDataOnce(db, dbRef);
    expect(dbNickname).toBeNull();
  });

  it('deletes the user data from the database', async () => {
    const dbRef = DBPATHS.USERS_USER_ID.getRoute(testUserId);
    const dbData = await readDataOnce(db, dbRef);
    expect(dbData).toBeNull();
  });

  it('deletes the user status data from the database', async () => {
    const dbRef = DBPATHS.USER_STATUS_USER_ID.getRoute(testUserId);
    const dbSessionData = await readDataOnce(db, dbRef);
    expect(dbSessionData).toBeNull();
  });

  it('deletes the user preferences from the database', async () => {
    const dbRef = DBPATHS.USER_PREFERENCES_USER_ID.getRoute(testUserId);
    const dbPreferencesData = await readDataOnce(db, dbRef);
    expect(dbPreferencesData).toBeNull();
  });

  it('deletes the user drinking sessions from the database', async () => {
    const dbRef = DBPATHS.USER_DRINKING_SESSIONS_USER_ID.getRoute(testUserId);
    const dbSessionsData = await readDataOnce(db, dbRef);
    expect(dbSessionsData).toBeNull();
  });

  it('deletes the user unconfirmed days from the database', async () => {
    const dbRef = DBPATHS.USER_UNCONFIRMED_DAYS_USER_ID.getRoute(testUserId);
    const dbUnconfirmedDays = await readDataOnce(db, dbRef);
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
      undefined,
      undefined,
    );
    const user1FriendsRef = DBPATHS.USERS_USER_ID_FRIENDS.getRoute(testUserId);
    const friendRequestsRef =
      DBPATHS.USERS_USER_ID_FRIEND_REQUESTS.getRoute(testUserId);
    const friends = await readDataOnce(db, user1FriendsRef);
    const friendRequests = await readDataOnce(db, friendRequestsRef);
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
    const friend1Ref = DBPATHS.USERS_USER_ID_FRIENDS_FRIEND_ID.getRoute(
      testUserId,
      testUserId2,
    );
    const friend2Ref = DBPATHS.USERS_USER_ID_FRIENDS_FRIEND_ID.getRoute(
      testUserId2,
      testUserId,
    );
    await set(ref(db, friend1Ref), true);
    await set(ref(db, friend2Ref), true);
    const usersAreFriends = await isFriend(db, testUserId, testUserId2);
    expect(usersAreFriends).toBe(true);
  });

  it('should send a friend request', async () => {
    const user1Ref = DBPATHS.USERS_USER_ID_FRIEND_REQUESTS.getRoute(testUserId);
    const user2Ref =
      DBPATHS.USERS_USER_ID_FRIEND_REQUESTS.getRoute(testUserId2);
    const expectedRequestsUser1: FriendRequestList = {
      [testUserId2]: CONST.FRIEND_REQUEST_STATUS.SENT,
    };
    const expectedRequestsUser2: FriendRequestList = {
      [testUserId]: CONST.FRIEND_REQUEST_STATUS.RECEIVED,
    };
    await sendFriendRequest(db, testUserId, testUserId2);
    const user1FriendRequests = await readDataOnce(db, user1Ref);
    const user2FriendRequests = await readDataOnce(db, user2Ref);
    expect(user1FriendRequests).toMatchObject(expectedRequestsUser1);
    expect(user2FriendRequests).toMatchObject(expectedRequestsUser2);
  });

  it('should delete a friend request', async () => {
    const user1Ref = DBPATHS.USERS_USER_ID_FRIEND_REQUESTS_REQUEST_ID.getRoute(
      testUserId,
      testUserId2,
    );
    const user2Ref = DBPATHS.USERS_USER_ID_FRIEND_REQUESTS_REQUEST_ID.getRoute(
      testUserId2,
      testUserId,
    );
    await set(ref(db, user1Ref), CONST.FRIEND_REQUEST_STATUS.SENT);
    await set(ref(db, user2Ref), CONST.FRIEND_REQUEST_STATUS.RECEIVED);
    await deleteFriendRequest(db, testUserId, testUserId2);
    const user1FriendRequestsRef =
      DBPATHS.USERS_USER_ID_FRIEND_REQUESTS.getRoute(testUserId);
    const user2FriendRequestsRef =
      DBPATHS.USERS_USER_ID_FRIEND_REQUESTS.getRoute(testUserId2);
    const user1FriendRequests = await readDataOnce(db, user1FriendRequestsRef);
    const user2FriendRequests = await readDataOnce(db, user2FriendRequestsRef);
    expect(user1FriendRequests).toBeNull();
    expect(user2FriendRequests).toBeNull();
  });

  it('should accept a friend request', async () => {
    const user1Ref = DBPATHS.USERS_USER_ID_FRIEND_REQUESTS_REQUEST_ID.getRoute(
      testUserId,
      testUserId2,
    );
    const user2Ref = DBPATHS.USERS_USER_ID_FRIEND_REQUESTS_REQUEST_ID.getRoute(
      testUserId2,
      testUserId,
    );
    const user1FriendRequestsRef =
      DBPATHS.USERS_USER_ID_FRIEND_REQUESTS.getRoute(testUserId);
    const user2FriendRequestsRef =
      DBPATHS.USERS_USER_ID_FRIEND_REQUESTS.getRoute(testUserId2);
    const user1FriendsRef = DBPATHS.USERS_USER_ID_FRIENDS.getRoute(testUserId);
    const user2FriendsRef = DBPATHS.USERS_USER_ID_FRIENDS.getRoute(testUserId2);

    await set(ref(db, user1Ref), CONST.FRIEND_REQUEST_STATUS.SENT);
    await set(ref(db, user2Ref), CONST.FRIEND_REQUEST_STATUS.RECEIVED);
    await acceptFriendRequest(db, testUserId, testUserId2);
    const user1FriendRequests = await readDataOnce(db, user1FriendRequestsRef);
    const user2FriendRequests = await readDataOnce(db, user2FriendRequestsRef);
    expect(user1FriendRequests).toBeNull();
    expect(user2FriendRequests).toBeNull();

    const user1Friends = await readDataOnce(db, user1FriendsRef);
    const user2Friends = await readDataOnce(db, user2FriendsRef);
    expect(user1Friends).toMatchObject({[testUserId2]: true});
    expect(user2Friends).toMatchObject({[testUserId]: true});
  });

  it('should unfriend a user', async () => {
    const user1Ref = DBPATHS.USERS_USER_ID_FRIENDS_FRIEND_ID.getRoute(
      testUserId,
      testUserId2,
    );
    const user2Ref = DBPATHS.USERS_USER_ID_FRIENDS_FRIEND_ID.getRoute(
      testUserId2,
      testUserId,
    );
    const user1FriendsRef = DBPATHS.USERS_USER_ID_FRIENDS.getRoute(testUserId);
    const user2FriendsRef = DBPATHS.USERS_USER_ID_FRIENDS.getRoute(testUserId2);
    await set(ref(db, user1Ref), true);
    await set(ref(db, user2Ref), true);
    await unfriend(db, testUserId, testUserId2);
    const user1Friends = await readDataOnce(db, user1FriendsRef);
    const user2Friends = await readDataOnce(db, user2FriendsRef);
    expect(user1Friends).toBeNull();
    expect(user2Friends).toBeNull();

    const usersAreFriends = await isFriend(db, testUserId, testUserId2); // Extra check
    expect(usersAreFriends).toBe(false);
  });
});
