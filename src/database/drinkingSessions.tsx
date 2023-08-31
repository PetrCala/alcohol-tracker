import { ref, child, update, push } from "firebase/database";
import { DrinkingSessionData, UnitTypesProps, CurrentSessionData } from "../types/database";
import { getZeroUnitsObject } from "../utils/dataHandling";


/** Write drinking session data into the database
 *
 * Throw an error in case the database writing fails.
 *  */ 
export async function saveDrinkingSessionData(
  db: any, 
  userId: string, 
  newSessionData: DrinkingSessionData,
  ) {
  let newDrinkingSessionKey: string | null = null;
  let newUnits = getZeroUnitsObject();
  let newCurrentSessionData: CurrentSessionData = {
    current_units: newUnits,
    in_session: false,
    last_session_started: newSessionData.start_time, // Otherwise gets deleted
    last_unit_added: newSessionData.last_unit_added_time, // Otherwise gets deleted
  };
  var updates: { [key: string]: DrinkingSessionData | CurrentSessionData} = {};
  // Generate a new automatic key for the new drinking session
  try {
    newDrinkingSessionKey = await push(child(ref(db), `/user_drinking_sessions/${userId}/`)).key 
  } catch (error:any) {
    throw new Error('Failed to create a new session reference point: ' + error.message);
  }
  if (!newDrinkingSessionKey) throw new Error('Failed to create a new session reference point');
  newSessionData.session_id = newDrinkingSessionKey; // Update the key
  // Update the database with this new key
  updates[`user_drinking_sessions/${userId}/` + newDrinkingSessionKey] = newSessionData;
  updates[`user_current_session/${userId}`] = newCurrentSessionData;

  try {
    await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to save drinking session data: ' + error.message);
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
  editedSession: DrinkingSessionData
  ) {
  var updates: { [key: string]: DrinkingSessionData } = {};
  let newDrinkingSessionKey = editedSession.session_id;
  // Handle the case of an unexisting session
  if (editedSession.session_id == 'edit-session-id'){
    try {
      // Generate a new key
      let newlyGeneratedKey = await push(child(ref(db), `/user_drinking_sessions/${userId}/`)).key 
      if (newlyGeneratedKey == null) {
        throw new Error('Failed to create a new session reference point');
      }
      newDrinkingSessionKey = newlyGeneratedKey; // Assign if not null
    } catch (error:any) {
      throw new Error('Failed to create a new session reference point: ' + error.message);
    }
  }
  editedSession.session_id = newDrinkingSessionKey; // Update the key
  updates[`/user_drinking_sessions/${userId}/` + newDrinkingSessionKey] = editedSession;

  try {
    return await update(ref(db), updates);
  } catch (error:any) {
    throw new Error('Failed to remove drinking session data: ' + error.message);
  }
};


export async function updateDrinkingSessionUserData(
  db: any,
  updates: {[key: string]: any},
) {
  try {
      await update(ref(db), updates);
  } catch (error: any) {
      throw new Error('Failed to update user data: ' + error.message);
  }
};