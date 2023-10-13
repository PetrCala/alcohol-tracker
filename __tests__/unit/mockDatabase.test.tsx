import {
    initializeEmptyMockDatabase,
    createMockConfig,
    createMockFeedback,
    createMockCurrentSession,
    createMockUnitsObject,
    createMockSession,
    createMockPreferences,
    createMockUnconfirmedDays,
    createMockUserData,
    createMockDatabase
  } from '../utils/mockDatabase';
import {
  DatabaseProps,
  ConfigProps,
  FeedbackProps,
  CurrentSessionData,
  DrinkingSessionData,
  UnitsObject,
  UnitTypesKeys,
  UnitTypesProps,
  PreferencesData,
  UnconfirmedDaysData,
  UserData,
  UnitsToColorsData,
} from '../../src/types/database'

/** Enter an object that is supposed to be of the ConfigProps type and validate it. Return true if it has that type, and false otherwise.
 * 
 * @param obj 
 * @returns 
 */
function validateConfig(obj:any): obj is ConfigProps {
  return(
    typeof obj.app_settings.min_supported_version === 'string'
  );
}


/** Using any object, validate that this object is of the FeedbackProps type. If yes, return true, otherwise return false.
 * 
 * @param obj Object to validate
 * @returns bool
 */
function isFeedback(obj: any): obj is FeedbackProps {
  return(
    typeof obj.submit_time === 'number' &&
    typeof obj.text === 'string' &&
    typeof obj.user_id === 'string'
    // obj.loginTime instanceof Date &&
  );
}

/** Using an object containing supposed FeedbackProps data, validate that all this data is indeed of the FeedbackProps type. Return true if all data is valid, and false otherwise.
 * 
 * @param feedbackData Data to validate
 * @returns bool
 */
function validateFeedback(feedbackData: { [feedbackId: string]: any}): boolean {

  for (const feedbackId in feedbackData) {
    if (!isFeedback(feedbackData[feedbackId])) {
      return false; 
    }
  }
  return true; 
}

/** Input an object of supposed current session data and validate that the object is indeed of the CurrentSessionData type. Return true if yes, and false otherwise.
 * 
 * @param obj Object to validate.
 * @returns bool
 */
function isCurrentSessionData(obj: any): obj is CurrentSessionData {
  return (
    typeof obj.current_session_id === 'string'
  );
}

/** Enter a data object containing supposed current sessions, and validate that all objects (values) are indeed of the supposed type. If yes, return true, otherwise return false.
 * 
 * @param userSessions Data to validate
 * @returns bool
 */
function validateUserCurrentSession(userSessions: { [userId: string]: any }): boolean {
  for (const userId in userSessions) {
    if (!isCurrentSessionData(userSessions[userId])) {
      return false;  // If any value is not a valid CurrentSessionData, return false
    }
  }
  return true;  // All values are valid
}



/** Type guard for UnitTypesProps. Return true if an object is of UnitTypesProps type, and false otherwise.
 * 
 * @param obj Object to check
 * @returns bool
 */
function isUnitTypesProps(obj: any): obj is UnitTypesProps {
  for (const key of Object.keys(obj)) {
    if (!UnitTypesKeys.includes(key as any)) {
      return false;  // Unexpected key
    }

    if (typeof obj[key] !== 'number') {
      return false;  // Value is not a number
    }
  }
  return true;
}

/** Input an object of supposed current drinking data and validate that the object is indeed of the DrinkingSessionData type. Return true if yes, and false otherwise.
 * 
 * @param obj Object to validate.
 * @returns bool
 */
function isDrinkingSessionData(obj: any): obj is DrinkingSessionData {
  for (const sessionId in obj) {
    const session = obj[sessionId];

    if (
      typeof session.start_time !== 'number' ||
      typeof session.end_time !== 'number' ||
      !isUnitsObject(session.units) ||
      typeof session.blackout !== 'boolean' ||
      typeof session.note !== 'string' ||
      (session.ongoing !== undefined && typeof session.ongoing !== 'boolean' && session.ongoing !== null)
    ) {
      return false;
    }
  }
  return true;
}

/** Enter a data object containing supposed drinking sessions, and validate that all objects (values) are indeed of the supposed type. If yes, return true, otherwise return false.
 * 
 * @param userSessions Data to validate
 * @returns bool
 */
function validateUserDrinkingSessions(userSessions: { [userId: string]: any }): boolean {
  for (const userId in userSessions) {
    if (!isDrinkingSessionData(userSessions[userId])) {
      return false;
    }
  }
  return true;
}


/** Check that an object is of type UnitsObject. If yes, return true, otherwise return false.
 * 
 * @param obj Object to check
 * @returns bool
 */
function isUnitsObject(obj: any): obj is UnitsObject {
  for (const timestamp of Object.keys(obj)) {
    if (isNaN(Number(timestamp))) {
      return false;  // Key is not a valid timestamp (not a number)
    }

    if (!isUnitTypesProps(obj[timestamp])) {
      return false;  // Value does not match the UnitTypesProps structure
    }
  }
  return true;
}


/** Type guard for UnitsObject. Return true if an object is of UnitTypesProps type, and false otherwise.
 * 
 * @param obj Object to check
 * @returns bool
 */
function isUnitsToColorsData(obj: any): obj is UnitsToColorsData {
  return (
    typeof obj.yellow === 'string' &&
    typeof obj.red === 'string'
  );
}

/** Using any object, validate that this object is of the FeedbackProps type. If yes, return true, otherwise return false.
 * 
 * @param obj Object to validate
 * @returns bool
 */
function isUserPreferencesData(obj: any): obj is PreferencesData {
  return(
    typeof obj.first_day_of_week === 'string' &&
    isUnitsToColorsData(obj.units_to_colors)
  );
}


/** Enter a data object containing supposed user preferences, and validate that all objects (values) are indeed of the supposed type. If yes, return true, otherwise return false.
 * 
 * @param userPreferences Data to validate
 * @returns bool
 */
function validateUserPreferences(userPreferences: { [userId: string]: any}): boolean {
  for (const userId in userPreferences) {
    if (!isUserPreferencesData(userPreferences[userId])) {
      return false;
    }
  }
  return true;
}


/** Using any object, validate that this object is of the UnconfirmedDaysData type. If yes, return true, otherwise return false.
 * 
 * @param obj Object to validate
 * @returns bool
 */
function isUserUnconfirmedDaysData(obj: any): obj is UnconfirmedDaysData {
  for (const dayString of Object.keys(obj)) {
    if (typeof dayString !== 'string') {
      return false;
    }

    if (typeof obj[dayString] !== 'boolean') {
      return false;
    }
  }
  return true;
}

/** Enter a data object containing supposed user unconfirmed days, and validate that all objects (values) are indeed of the supposed type. If yes, return true, otherwise return false.
 * 
 * @param userUnconfirmedDays Data to validate
 * @returns bool
 */
function validateUserUnconfirmedDaysData(userUnconfirmedDays: { [userId: string]: any}): boolean {
  for (const userId in userUnconfirmedDays) {
    if (!isUserUnconfirmedDaysData(userUnconfirmedDays[userId])) {
      return false;
    }
  }
  return true;
}


/** Using any object, validate that this object is of the UnconfirmedData type. If yes, return true, otherwise return false.
 * 
 * @param obj Object to validate
 * @returns bool
 */
function isUserData(obj: any): obj is UserData {
  return (
    typeof obj.role === 'string' &&
    typeof obj.last_online === 'number' &&
    typeof obj.beta_key_id === 'string'
  );
}

/** Enter a data object containing supposed user data, and validate that all objects (values) are indeed of the supposed type. If yes, return true, otherwise return false.
 * 
 * @param userData Data to validate
 * @returns bool
 */
function validateUserData(userData: { [userId: string]: any}): boolean {
  for (const userId in userData) {
    if (!isUserData(userData[userId])) {
      return false;
    }
  }
  return true;
}

describe('mockDatabase functions', () => {
  
    it('should initialize an empty mock database', () => {
      const db = initializeEmptyMockDatabase();
      expect(db).toBeDefined();
      expect(db.config.app_settings.min_supported_version).toBe('0.0.1');
      expect(db.config.app_settings.min_user_creation_possible_version).toBe('0.0.1');
    });
  
    it('should create a mock config', () => {
      const config = createMockConfig('0.0.2', '0.0.2');
      expect(config.app_settings.min_supported_version).toBe('0.0.2');
      expect(config.app_settings.min_user_creation_possible_version).toBe('0.0.2');
    });
  
    it('should create a mock feedback object', () => {
      const feedback = createMockFeedback();
      expect(feedback).toBeDefined();
      expect(feedback.text).toBe('Mock feedback');
    });
  
    it('should create a mock current session', () => {
      const session = createMockCurrentSession('mock-session-id');
      expect(session.current_session_id).toBe('mock-session-id');
    });
  
    it('should create a mock units object', () => {
      const units = createMockUnitsObject({ wine: 5 });
      expect(units).toBeDefined();
      expect(Object.values(units)[0].wine).toBe(5);
    });
  
    it('should create a mock session', () => {
      const session = createMockSession(new Date());
      expect(session).toBeDefined();
      expect(session.start_time).toBeLessThan(session.end_time);
    });
  
    it('should create mock preferences', () => {
      const preferences = createMockPreferences();
      expect(preferences).toBeDefined();
      expect(['Monday', 'Sunday']).toContain(preferences.first_day_of_week);
    });
  
    it('should create mock unconfirmed days', () => {
      const unconfirmedDays = createMockUnconfirmedDays();
      expect(unconfirmedDays).toBeDefined();
      expect(Object.keys(unconfirmedDays).length).toBeGreaterThanOrEqual(1);
    });
  
    it('should create mock user data', () => {
      const userData = createMockUserData('mock-user-id');
      expect(userData).toBeDefined();
      expect(userData.role).toBe('mock-user');
    });
  
    it('should create a mock database', () => {
      const db = createMockDatabase();
      expect(db).toBeDefined();
      expect(Object.keys(db.feedback).length).toBe(5);
    });
  
  });
  
describe('mockDatabase data structure', () => {
  let db:DatabaseProps = initializeEmptyMockDatabase();

  it('should have config data', () => {
    expect(validateConfig(db.config)).toBe(true);
  });

  it('should have feedback data', () => {
    expect(validateFeedback(db.feedback)).toBe(true);
  });

  it('should have user current session data', () => {
    expect(validateUserCurrentSession(db.user_current_session)).toBe(true);
  });

  it('should have user drinking session data', () => {
    expect(validateUserDrinkingSessions(db.user_drinking_sessions)).toBe(true);
  });

  it('should have user preferences data', () => {
    expect(validateUserPreferences(db.user_preferences)).toBe(true);
  });

  it('should have user unconfirmed days data', () => {
    expect(validateUserUnconfirmedDaysData(db.user_unconfirmed_days)).toBe(true);
  });

  it('should have user data', () => {
    expect(validateUserData(db.users)).toBe(true);
  });

});