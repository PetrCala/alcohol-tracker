import fs from 'fs';

import {
  AppSettings,
  BetaKeysProps,
  ConfigProps,
  CurrentSessionData,
  DatabaseProps,
  DrinkingSessionArrayItem,
  DrinkingSessionData,
  FeedbackData,
  FeedbackProps,
  FriendRequestData,
  FriendRequestStatus,
  FriendsData,
  NicknameToIdData,
  PreferencesData,
  ProfileData,
  UnconfirmedDaysData,
  UnitTypesProps,
  UnitsObject,
  UnitsToColorsData,
  UserData,
} from '../../src/types/database';
import {getRandomChoice, getRandomInt} from '../../src/utils/choice';
import {
  formatDate,
  getRandomUnitsObject,
  getZeroUnitsObject,
} from '../../src/utils/dataHandling';
import {cleanStringForFirebaseKey} from '../../src/utils/strings';
import {MOCK_SESSION_IDS, MOCK_USER_IDS} from './testsStatic';

/** Initialize an empty database object to be
 * used for easier populating
 *
 * @returns Databse type object
 */
export function initializeEmptyMockDatabase(): DatabaseProps {
  return {
    beta_keys: {},
    config: {
      app_settings: {
        min_supported_version: '0.0.1',
        min_user_creation_possible_version: '0.0.1',
      },
    },
    feedback: {},
    nickname_to_id: {},
    user_current_session: {},
    user_drinking_sessions: {},
    user_preferences: {},
    user_unconfirmed_days: {},
    users: {},
  };
}

export function createMockBetaKeys(number: number): BetaKeysProps {
  const betaKeys: BetaKeysProps = {};
  for (let i = 0; i < number; i++) {
    const idx = i + 1; // Start indexing from key 1
    const key = `beta-key-${idx}`;
    betaKeys[idx] = {
      key: key,
      in_usage: false,
    }
  }
  return betaKeys;
}

/** Create a mock configuration data record
 *
 * @param min_supported_version Minimum supported
 * version of the app. Defaults to 0.0.1.
 * @returns Mock configuration data record
 */
export function createMockConfig(
  min_supported_version: string = '0.0.1',
  min_user_creation_possible_version: string = '0.0.1',
): ConfigProps {
  let mockAppSettings: AppSettings = {
    min_supported_version: min_supported_version,
    min_user_creation_possible_version: min_user_creation_possible_version,
  };
  let mockConfig: ConfigProps = {
    app_settings: mockAppSettings,
  };
  return mockConfig;
}

/** Create a mock feedback object
 *
 * @returns Feedback object.
 */
export function createMockFeedback(): FeedbackProps {
  return {
    submit_time: Date.now(),
    text: 'Mock feedback',
    user_id: 'mock-user-id',
  };
}

/** Create a mock nicknames to user IDs data object.
 *
 * @returns {NicknameToIdData} The mock object.
 */
export function createMockNicknameToIdData(userId: string): NicknameToIdData {
  const returnObject: NicknameToIdData = {
    [userId]: 'mock nickname',
  };
  return returnObject;
}

/** Create and return a mock current session object.
 * This object will contain a random current live
 * session id.
 *
 * @param ongoingSessionId ID of the ongoing
 * mock session.
 * @returns Mock current session object
 */
export function createMockCurrentSession(
  ongoing_session_id: string,
): CurrentSessionData {
  return {
    current_session_id: ongoing_session_id,
  };
}

/** Generate a mock object of units
 *
 * @usage const onlyWine = generateMockUnitsObject({ wine: 5 });
 */
export function createMockUnitsObject(
  units: Partial<UnitTypesProps> = {},
): UnitsObject {
  if (Object.keys(units).length === 0) {
    // If units are unspecified
    return getRandomUnitsObject();
  }
  let timestampNow = new Date().getTime();
  return {
    [timestampNow]: units,
  };
}

/**
 * Generates a DrinkingSessionData for a specified offset relative to a given date.
 *
 * @param baseDate Date around which sessions are created.
 * @param offsetDays Number of days to offset from baseDate. If not provided, a random offset between -7 and 7 days is used.
 * @param units Units consumed during the session
 * @param ongoing Whether the session is ongoing or not
 * @returns A DrinkingSessionData object.
 */
export function createMockSession(
  baseDate: Date,
  offsetDays?: number,
  units?: UnitsObject,
  ongoing?: boolean,
): DrinkingSessionArrayItem {
  if (!units) {
    units = getZeroUnitsObject();
  }
  const sessionDate = new Date(baseDate);

  // If offsetDays is not provided, randomize between -7 and 7 days.
  const daysOffset =
    offsetDays !== undefined ? offsetDays : Math.floor(Math.random() * 15) - 7;

  sessionDate.setDate(sessionDate.getDate() + daysOffset);

  const startHour = 3; // you can randomize this or make it configurable

  sessionDate.setHours(startHour, 0, 0, 0);

  const newSession: DrinkingSessionArrayItem = {
    start_time: sessionDate.getTime(),
    end_time: sessionDate.getTime() + 2 * 60 * 60 * 1000, // +2 hours
    blackout: false,
    note: '',
    units: units,
  };
  if (ongoing) newSession.ongoing = true;

  return newSession;
}

/** Create an object of mock preferences for a user.
 *
 * @returns User preferences type object
 */
export function createMockPreferences(): PreferencesData {
  let mockUnitsToColorsData: UnitsToColorsData = {
    yellow: getRandomInt(3, 6),
    orange: getRandomInt(7, 10),
  };
  let mockUnitsToPointsData: UnitTypesProps = {
    beer: 1,
    cocktail: 1.5,
    other: 1,
    strong_shot: 1,
    weak_shot: 0.5,
    wine: 1,
  };
  let mockPreferencesData: PreferencesData = {
    first_day_of_week: getRandomChoice(['Monday', 'Sunday']),
    units_to_colors: mockUnitsToColorsData,
    units_to_points: mockUnitsToPointsData,
  };
  return mockPreferencesData;
}

/** Create and return an unconfirmed days type object.
 *
 * @returns Unconfirmed days object
 */
export function createMockUnconfirmedDays(): UnconfirmedDaysData {
  const data: UnconfirmedDaysData = {};
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
 * @param {string} userId ID of the mock user
 * @returns {FriendRequestData} Mock FriendRequest type data.
 */
export function createMockFriendRequests(userId: string): FriendRequestData {
  let mockRequestData: FriendRequestData = {};
  const statuses: FriendRequestStatus[] = ['sent', 'received'];
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
 * @param {string} userId ID of the mock user
 * @param {number} index Index of the mock user
 *
 * @returns {UserData} Mock user data
 */
export function createMockUserData(userId: string, index: number): UserData {
  let mockProfileData: ProfileData = {
    display_name: 'mock-user',
    photo_url: '',
  };
  // let mockFriendsData: FriendsData | undefined = undefined;
  let mockFriendRequests: FriendRequestData = createMockFriendRequests(userId);
  return {
    profile: mockProfileData,
    // friends: mockFriendsData,
    friend_requests: mockFriendRequests,
    role: 'mock-user',
    last_online: Date.now(),
    beta_key_id: index + 1,
  };
}

/** Create and return an object that will mock
 * the firebase database. This object has the
 * type DatabaseProps.
 *
 * @returns A mock object of the firebase database
 */
export function createMockDatabase(): DatabaseProps {
  const db = initializeEmptyMockDatabase();
  // Beta keys
  db.beta_keys = createMockBetaKeys(10); // beta feature
  // Configuration
  db.config = createMockConfig();

  // Data that varies across users
  MOCK_USER_IDS.forEach((userId, index) => {

    // Choose beta key for the user - beta feature
    db.beta_keys[index + 1].in_usage = true;
    db.beta_keys[index + 1].user_id = userId;

    // Feedback
    db.feedback[userId] = createMockFeedback();

    // Drinking sessions
    const mockSessionData: DrinkingSessionData = {};
    let latestSessionId: string = '';
    MOCK_SESSION_IDS.forEach(sessionId => {
      const fullSessionId = `${userId}-${sessionId}`;
      const mockSession = createMockSession(new Date());
      mockSessionData[fullSessionId] = mockSession;
      latestSessionId = fullSessionId;
    });
    mockSessionData[latestSessionId].ongoing = true;
    db.user_drinking_sessions[userId] = mockSessionData;

    // Set the ongoing session id to the current session data
    db.user_current_session[userId] = {current_session_id: latestSessionId};

    // User preferences
    db.user_preferences[userId] = createMockPreferences();

    // User unconfirmed data
    db.user_unconfirmed_days[userId] = createMockUnconfirmedDays();

    // User data
    db.users[userId] = createMockUserData(userId, index);

    // Nicknames to user ids
    let nickname = db.users[userId].profile.display_name;
    let nickname_key = cleanStringForFirebaseKey(nickname);
    db.nickname_to_id[nickname_key] = createMockNicknameToIdData(userId);
  });

  return db;
}

/**
 * Export the mock database as a JSON file at the current folder location.
 *
 * @returns {string} The path of the exported JSON file.
 */
export function exportMockDatabase(): string {
  const mockDatabase = createMockDatabase();
  const filePath = './mockDatabase.json';
  fs.writeFileSync(filePath, JSON.stringify(mockDatabase));
  console.log("Mock database exported to: " + filePath)
  return filePath;
}
// 
exportMockDatabase() // Run script to export
