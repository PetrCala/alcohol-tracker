import fs from 'fs';

import {
  AppSettings,
  Config,
  DatabaseProps,
  DrinkingSession,
  Feedback,
  FriendRequestList,
  FriendRequestStatus,
  Maintenance,
  NicknameToId,
  Preferences,
  Profile,
  UnconfirmedDays,
  Drinks,
  UnitsToColors,
  UserProps,
  UserStatus,
  DrinksList,
  DrinkingSessionList,
  DrinkingSessionId,
  DrinksToUnits,
} from '../../src/types/database';
import {getRandomChoice, getRandomInt} from '../../src/libs/Choice';
import {
  formatDate,
  getRandomDrinksList,
  getZeroDrinksList,
} from '../../src/libs/DataHandling';
import {cleanStringForFirebaseKey} from '../../src/libs/StringUtils';
import {MOCK_SESSION_IDS, MOCK_USER_IDS} from './testsStatic';
import CONST from '@src/CONST';

/**
 * Creates a mock app settings object.
 * @returns The mock app settings object.
 */
export function createMockAppSettings(
  minSupportedVersion: string = '0.0.1',
  minUserCreationPossibleVersion: string = '0.0.1',
): AppSettings {
  return {
    min_supported_version: minSupportedVersion,
    min_user_creation_possible_version: minUserCreationPossibleVersion,
  };
}

/**
 * Creates a mock maintenance object.
 * @returns The mock maintenance object.
 */
export function createMockMaintenance(
  maintenanceModeOn: boolean = false,
  startTime: number = 0,
  endTime: number = 0,
): Maintenance {
  return {
    maintenance_mode: maintenanceModeOn,
    start_time: startTime,
    end_time: endTime,
  };
}

/** Initialize an empty database object to be
 * used for easier populating
 *
 * @returns Databse type object
 */
export function initializeEmptyMockDatabase(): DatabaseProps {
  return {
    config: {
      app_settings: createMockAppSettings(),
      maintenance: createMockMaintenance(),
    },
    feedback: {},
    nickname_to_id: {},
    user_status: {},
    user_drinking_sessions: {},
    user_preferences: {},
    user_session_placeholder: {},
    user_unconfirmed_days: {},
    users: {},
  };
}

/** Create a mock configuration data record
 *
 * @param min_supported_version Minimum supported
 * version of the app. Defaults to 0.0.1.
 * @returns Mock configuration data record
 */
export function createMockConfig(): Config {
  let mockConfig: Config = {
    app_settings: createMockAppSettings(),
    maintenance: createMockMaintenance(),
  };
  return mockConfig;
}

/** Create a mock feedback object
 *
 * @returns Feedback object.
 */
export function createMockFeedback(): Feedback {
  return {
    submit_time: Date.now(),
    text: 'Mock feedback',
    user_id: 'mock-user-id',
  };
}

export function createMockUserStatus(
  latest_session_id?: string,
  latest_session?: DrinkingSession,
): UserStatus {
  const mockUserStatus: UserStatus = {
    last_online: Date.now(),
  };
  if (latest_session_id && latest_session) {
    mockUserStatus.latest_session_id = latest_session_id;
    mockUserStatus.latest_session = latest_session;
  }
  return mockUserStatus;
}

/** Create a mock nicknames to user IDs data object.
 *
 * @returns The mock object.
 */
export function createMockNicknameToId(userId: string): NicknameToId {
  const returnObject: NicknameToId = {
    [userId]: 'mock nickname',
  };
  return returnObject;
}

/** Generate a mock object of drinks
 *
 * @usage const onlyWine = generateMockDrinksList({ wine: 5 });
 */
export function createMockDrinksList(drinks: Drinks = {}): DrinksList {
  if (Object.keys(drinks).length === 0) {
    // If drinks are unspecified
    return getRandomDrinksList();
  }
  let timestampNow = new Date().getTime();
  return {
    [timestampNow]: drinks,
  };
}

/**
 * Generates a DrinkingSession for a specified offset relative to a given date.
 *
 * @param baseDate Date around which sessions are created.
 * @param offsetDays Number of days to offset from baseDate. If not provided, a random offset between -7 and 7 days is used.
 * @param drinks Drinks consumed during the session
 * @param ongoing Whether the session is ongoing or not
 * @returns A DrinkingSession object.
 */
export function createMockSession(
  baseDate: Date,
  offsetDays?: number,
  drinks?: DrinksList,
  ongoing?: boolean,
): DrinkingSession {
  if (!drinks) {
    drinks = getZeroDrinksList();
  }
  const sessionDate = new Date(baseDate);

  // If offsetDays is not provided, randomize between -7 and 7 days.
  const daysOffset =
    offsetDays !== undefined ? offsetDays : Math.floor(Math.random() * 15) - 7;

  sessionDate.setDate(sessionDate.getDate() + daysOffset);

  const startHour = 3; // you can randomize this or make it configurable

  sessionDate.setHours(startHour, 0, 0, 0);

  const newSession: DrinkingSession = {
    start_time: sessionDate.getTime(),
    end_time: sessionDate.getTime() + 2 * 60 * 60 * 1000, // +2 hours
    blackout: false,
    note: '',
    drinks: drinks,
    type: getRandomChoice(Object.values(CONST.SESSION_TYPES)),
  };
  if (ongoing) newSession.ongoing = true;

  return newSession;
}

/** Create an object of mock preferences for a user.
 *
 * @returns User preferences type object
 */
export function createMockPreferences(): Preferences {
  let mockUnitsToColors: UnitsToColors = {
    yellow: getRandomInt(3, 6),
    orange: getRandomInt(7, 10),
  };
  let mockDrinksToUnitsData: DrinksToUnits = {
    small_beer: 0.5,
    beer: 1,
    cocktail: 1.5,
    other: 1,
    strong_shot: 1,
    weak_shot: 0.5,
    wine: 1,
  };
  let mockPreferences: Preferences = {
    first_day_of_week: getRandomChoice(['Monday', 'Sunday']),
    units_to_colors: mockUnitsToColors,
    drinks_to_units: mockDrinksToUnitsData,
  };
  return mockPreferences;
}

/** Create and return an unconfirmed days type object.
 *
 * @returns Unconfirmed days object
 */
export function createMockUnconfirmedDays(): UnconfirmedDays {
  const data: UnconfirmedDays = {};
  const today = new Date();

  // Randomly choose the number of entries to generate
  const numberOfEntries = getRandomInt(1, 10);

  for (let i = 0; i < numberOfEntries; i++) {
    // Get a random date between today and 365 days ago (1 year ago).
    const randomPastDate = new Date(
      today.getTime() - getRandomInt(0, 365) * 24 * 60 * 60 * 1000,
    );
    const dateKey = formatDate(randomPastDate);
    data[dateKey] = true;
  }

  return data;
}

/** Create and return mock friend request data. Is created at random.
 *  (possibly improve in the future)
 *
 * @param userId ID of the mock user
 * @returns Mock FriendRequest type data.
 */
export function createMockFriendRequests(userId: string): FriendRequestList {
  let mockRequestData: FriendRequestList = {};
  const statuses: FriendRequestStatus[] = Object.values(
    CONST.FRIEND_REQUEST_STATUS,
  );
  for (let mockId of MOCK_USER_IDS) {
    if (mockId === userId) {
      continue; // Skip self
    }
    let randomIndex = Math.floor(Math.random() * statuses.length);
    let mockStatus = statuses[randomIndex];
    mockRequestData[mockId] = mockStatus;
  }
  return mockRequestData;
}

/** Create and return a mock user data object
 * @param userId ID of the mock user
 * @param index Index of the mock user
 * @param noFriends If set to true, no friends or friend requests will be created.
 * @returns Mock user data
 */
export function createMockUserData(
  userId: string,
  noFriends: boolean = false,
): UserProps {
  let mockProfile: Profile = {
    display_name: 'mock-user',
    photo_url: '',
  };
  const mockUserData: UserProps = {
    profile: mockProfile,
    role: 'mock-user',
  };
  if (!noFriends) {
    // mockUserData['friends'] = // TODO
    mockUserData['friend_requests'] = createMockFriendRequests(userId);
  }
  return mockUserData;
}

/** Create and return an object that will mock
 * the firebase database. This object has the
 * type Database.
 *
 * @param noFriends If set to true, no friends or friend requests will be created.
 * @returns A mock object of the firebase database
 */
export function createMockDatabase(noFriends: boolean = false): DatabaseProps {
  const db = initializeEmptyMockDatabase();
  // Configuration
  db.config = createMockConfig();

  // Data that varies across users
  MOCK_USER_IDS.forEach((userId, index) => {
    // Feedback
    db.feedback[userId] = createMockFeedback();

    // Drinking sessions
    const mockSessionData: DrinkingSessionList = {};
    let latestSessionId: string = '';
    MOCK_SESSION_IDS.forEach(sessionId => {
      const fullSessionId: DrinkingSessionId = `${userId}-${sessionId}`;
      const mockSession = createMockSession(new Date());
      mockSessionData[fullSessionId] = mockSession;
      latestSessionId = fullSessionId;
    });
    mockSessionData[latestSessionId].ongoing = true;
    db.user_drinking_sessions[userId] = mockSessionData;

    // User status
    db.user_status[userId] = createMockUserStatus(
      latestSessionId,
      mockSessionData[latestSessionId],
    );

    // User preferences
    db.user_preferences[userId] = createMockPreferences();

    // User unconfirmed data
    db.user_unconfirmed_days[userId] = createMockUnconfirmedDays();

    // User data
    db.users[userId] = createMockUserData(userId, noFriends);

    // Nicknames to user ids
    let nickname = db.users[userId].profile.display_name;
    let nickname_key = cleanStringForFirebaseKey(nickname);
    db.nickname_to_id[nickname_key] = createMockNicknameToId(userId);
  });

  return db;
}

/**
 * Export the mock database as a JSON file at the current folder location.
 *
 * @returns The path of the exported JSON file.
 */
export function exportMockDatabase(verbose: boolean = false): string {
  const mockDatabase = createMockDatabase();
  const filePath = './mockDatabase.json';
  fs.writeFileSync(filePath, JSON.stringify(mockDatabase));
  if (verbose) {
    console.log('Mock database exported to: ' + filePath);
  }
  return filePath;
}
//
exportMockDatabase(); // Run script to export
