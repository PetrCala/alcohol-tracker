import { ref, child, update, push } from "firebase/database";
import { DrinkingSessionData, UnitTypesProps, CurrentSessionData, DrinkingSessionArrayItem, UnitsObject } from "../types/database";
import { Alert } from "react-native";


/** Write drinking session data into the database
 *
 * Throw an error in case the database writing fails.
 * 
 * @return The session key associated with that session
 *  */ 
export async function saveDrinkingSessionData(
  db: any, 
  userId: string, 
  newSessionData: DrinkingSessionArrayItem,
  sessionKey?: string,
  ): Promise<string> {
  if (!sessionKey){
    // Generate a new automatic key for the a drinking session
    let newSessionKey: string | null = null; 
    try {
      newSessionKey = await push(child(ref(db), `/user_drinking_sessions/${userId}/`)).key 
    } catch (error:any) {
      throw new Error('Failed to create a new session reference point: ' + error.message);
    }
    if (!newSessionKey) throw new Error('Failed to create a new session reference point');
    sessionKey = newSessionKey;
  };
  // Update the database with this new key
  var updates: { [key: string]: DrinkingSessionArrayItem } = {};
  updates[`user_drinking_sessions/${userId}/` + sessionKey] = newSessionData;
  try {
    await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to save drinking session data: ' + error.message);
  };
  return sessionKey;
};

/** Update the current session key info in the database. If there is no key,
 * store one. If there is one, remove it.
 * @param db Database
 * @param userId User ID
 */
export async function updateCurrentSessionKey(
  db: any,
  userId: string,
  key: string | null,
) {
  let newCurrentSessionData:CurrentSessionData = {
    current_session_id: key, // Add or remove current session id
  }
  var updates: { [key: string]: CurrentSessionData} = {};
  updates[`user_current_session/${userId}`] = newCurrentSessionData;
  try {
      await update(ref(db), updates);
  } catch (error: any) {
      throw new Error('Failed to update the current session data: ' + error.message);
  }
};


/** Remove drinking session data from the database
 *
 * Throw an error in case the database removal fails.
 *  */ 
export async function removeDrinkingSessionData(
  db: any, 
  userId: string,
  sessionKey: string,
) {
  var updates: {[key: string]: any} = {};
  updates['/user_drinking_sessions/' + userId + '/' + sessionKey] = null;

  try {
    return await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to remove drinking session data: ' + error.message);
  }
};

/** Edit an existing drinking session data in database,
 * or add a new one in case the user wishes to add a new
 * session data without starting a new session
 *
 * Throw an error in case the database writing fails.
 *  */ 
export async function editDrinkingSessionData(
  db: any, 
  userId: string, 
  session: DrinkingSessionArrayItem,
  sessionKey: string,
  newSession: boolean,
  ) {
  var updates: { [key: string]: DrinkingSessionArrayItem } = {};
  let newDrinkingSessionKey = sessionKey;
  if (newSession){
    // Handle the case of an unexisting session
    try {
      let newlyGeneratedKey = await push(child(ref(db), `/user_drinking_sessions/${userId}/`)).key 
      if (newlyGeneratedKey == null) {
        throw new Error('Failed to create a new session reference point');
      }
      newDrinkingSessionKey = newlyGeneratedKey; // Assign if not null
    } catch (error:any) {
      throw new Error('Failed to create a new session reference point: ' + error.message);
    }
  }
  updates[`/user_drinking_sessions/${userId}/` + newDrinkingSessionKey] = session;

  try {
    return await update(ref(db), updates);
  } catch (error:any) {
    Alert.alert('Session edit failed', 'Failed to edit drinking session data: ' + error.message);
  }
};

/** Access the database reference point of a user's drinking session
 * and update the units of that session.
 * 
 * @param db Database object
 * @param userId User ID
 * @param sessionKey Key of the session
 * @param newUnits UnitsObject containing the new units
 */
export async function updateSessionUnits(
  db: any, 
  userId: string, 
  sessionKey: string,
  newUnits: UnitsObject
  ) {

  var updates: { [key: string]: UnitsObject } = {};
  updates[`/user_drinking_sessions/${userId}/${sessionKey}/units`] = newUnits;

  try {
    return await update(ref(db), updates);
  } catch (error:any) {
    Alert.alert('Units consumed save failed', 'Could not save the current session units consumed data: ' + error.message);
  }
};

