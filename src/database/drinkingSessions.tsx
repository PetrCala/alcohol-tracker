import { ref, child, update, push } from "firebase/database";
import { DrinkingSessionData } from "../utils/types";



/** Write drinking session data into the database
 *
 * Throw an error in case the database writing fails.
 *  */ 
export async function saveDrinkingSessionData(
  db: any, 
  userId: string, 
  units: number,
  timestamp: number
  ) {
  let newDrinkingSessionKey: string | null = null;
  var updates: {
    [key: string]: DrinkingSessionData | {
      current_timestamp: number;
      current_units: number;
      in_session: boolean;
    }} = {};
  // Generate a new automatic key for the new drinking session
  try {
    newDrinkingSessionKey = await push(child(ref(db), `/user_drinking_sessions/${userId}/`)).key 
  } catch (error:any) {
    throw new Error('Failed to create a new session reference point: ' + error.message);
  }
  if (newDrinkingSessionKey == null) {
    throw new Error('Failed to create a new session reference point');
  }
  // Update the database with this new key
  updates[`/user_drinking_sessions/${userId}/` + newDrinkingSessionKey] = {
    session_id: newDrinkingSessionKey,
    timestamp: timestamp,
    units: units,
  };
  updates[`users/${userId}`] = {
    current_timestamp: timestamp, // Otherwise gets deleted from DB
    current_units: 0,
    in_session: false,
  };

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
  updates[`/user_drinking_sessions/${userId}/` + newDrinkingSessionKey] = {
    session_id: newDrinkingSessionKey,
    timestamp: editedSession.timestamp,
    units: editedSession.units,
  };

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