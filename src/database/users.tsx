import { update, runTransaction, ref } from "firebase/database";
import { UnitTypesProps, CurrentSessionData, PreferencesData, UserData, UnitsToColorsData } from "../types/database";
import { getZeroUnitsObject } from "../utils/dataHandling";

/** In the database, create base info for a user. This will
 * be stored under the "users" object in the database.
 * 
 * @param db The database object
 * @param userId The user ID
 */
export async function pushNewUserInfo(
 db: any,
 userId: string,
){
  // User current session
  let timestampNow = new Date().getTime();
  let newCurrentUnitsData:UnitTypesProps = getZeroUnitsObject();
  let newCurrentSessionData = {
    current_units: newCurrentUnitsData,
    in_session: false,
    last_session_started: timestampNow,
    last_unit_added: timestampNow,
  };
  // User preferences
  let newUnitsToColors:UnitsToColorsData = {
    orange: 10,
    yellow: 5,
  }
  let newPreferences:PreferencesData = {
    first_day_of_week: 'Monday',
    units_to_colors: newUnitsToColors,
  };
  // Users
  let newUserData:UserData = {
    role: 'user',
  };
  // Allowed types
  let updates: {
    [key:string]: UserData | CurrentSessionData | PreferencesData
  } = {};
  // User current session
  updates[`user_current_session/${userId}`] = newCurrentSessionData;
  // User preferences
  updates[`user_preferences/${userId}`] = newPreferences;
  // Users
  updates[`users/${userId}`] = newUserData;
  try {
    await update(ref(db), updates)
  } catch (error:any) {
    throw new Error('Failed to create new user info: ' + error.message);
  } ;
};


/** Delete all user info from the realtime database, including their 
 * user information, drinking sessions, etc.
 * 
 * @param db The database object
 * @param userId The user ID
 */
export async function deleteUserInfo(
 db: any,
 userId: string,
){
  let updates: {[key:string]: null} = {};
  updates[`users/${userId}`] = null;
  updates[`user_current_session/${userId}`] = null;
  updates[`user_drinking_sessions/${userId}`] = null;
  updates[`user_unconfirmed_days/${userId}`] = null;
  try {
    await update(ref(db), updates)
  } catch (error:any) {
    throw new Error('Failed to delete user info: ' + error.message);
  } ;
};

export async function updateLastSessionStarted(
  db: any, 
  userId: string, 
  timestamp: number,
  ) {
  let updates: {[key: string]: number} = {};
  updates[`user_current_session/${userId}/last_session_started`] = timestamp;

  try {
    await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to update session timestamp: ' + error.message);
  }
};


export async function updateCurrentUnits(
  db: any, 
  userId: string, 
  newUnits: UnitTypesProps
  ) {
  try {
    await runTransaction(ref(db, `user_current_session/${userId}`), (user) => {
      if (user) {
        user.current_units = newUnits;
      }
      return user;
    });
  } catch (error:any) {
    throw new Error('Failed to save drinking session data: ' + error.message);
  }
};

export async function updateSessionStatus(
  db: any, 
  userId: string, 
  status: boolean,
  ) {
  let updates: {[key: string]: boolean} = {};
  updates[`user_current_session/${userId}/in_session`] = status;

  try {
    await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to save drinking session data: ' + error.message);
  }
};

export async function discardDrinkingSessionData(
 db: any,
 userId: string,
){
  let newCurrentUnitsData:UnitTypesProps = getZeroUnitsObject();
  let updates: {[key:string]: UnitTypesProps | boolean} = {};
  updates[`user_current_session/${userId}/current_units`] = newCurrentUnitsData;
  updates[`user_current_session/${userId}/in_session`] = false;
  try {
    await update(ref(db), updates)
  } catch (error:any) {
    throw new Error('Failed to add a new unit: ' + error.message);
  } 
}
