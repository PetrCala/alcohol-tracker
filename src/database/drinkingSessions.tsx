import {Database, ref, child, update, push} from 'firebase/database';
import {
  DrinkingSessionData,
  UnitTypesProps,
  CurrentSessionData,
  DrinkingSessionArrayItem,
  UnitsObject,
} from '../types/database';

/** Write drinking session data into the database
 *
 * @param {Database} db Firebase Database object
 * @param {string} userId User ID
 * @param {DrinkingSessionArrayItem} newSessionData Data to save the new drinking session with
 * @return {Promise<string>} ID of the saved session
 *  */
export async function saveDrinkingSessionData(
  db: Database,
  userId: string,
  newSessionData: DrinkingSessionArrayItem,
  sessionKey?: string,
): Promise<string> {
  if (!sessionKey) {
    // Generate a new automatic key for the a drinking session
    let newSessionKey = await push(
      child(ref(db), `/user_drinking_sessions/${userId}/`),
    ).key;
    if (!newSessionKey) {
      throw new Error('Failed to create a new session reference point');
    }
    sessionKey = newSessionKey;
  }
  // Update the database with this new key
  var updates: {[key: string]: DrinkingSessionArrayItem} = {};
  updates[`user_drinking_sessions/${userId}/` + sessionKey] = newSessionData;
  await update(ref(db), updates);
  return sessionKey;
}

/** Update the current session key info in the database. If there is no key, store one. If there is one, remove it.
 *
 * @param {Database} db Database
 * @param {string} userId User ID
 * @param {string|null} key Current session data key
 * @returns {Promise<void>}
 */
export async function updateCurrentSessionKey(
  db: Database,
  userId: string,
  key: string | null,
): Promise<void> {
  let newCurrentSessionData: CurrentSessionData = {
    current_session_id: key, // Add or remove current session id
  };
  var updates: {[key: string]: CurrentSessionData} = {};
  updates[`user_current_session/${userId}`] = newCurrentSessionData;
  await update(ref(db), updates);
}

/** Remove drinking session data from the database
 *
 * @param {Database} db Firebase Database object
 * @param {string} userId User ID
 * @param {string} sessionKey ID of the session to remove
 * @returns {Promise<void>}
 *  */
export async function removeDrinkingSessionData(
  db: Database,
  userId: string,
  sessionKey: string,
): Promise<void> {
  var updates: {[key: string]: any} = {};
  updates['/user_drinking_sessions/' + userId + '/' + sessionKey] = null;
  await update(ref(db), updates);
}

/** Edit an existing drinking session data in database,
 * or add a new one in case the user wishes to add a new
 * session data without starting a new session
 *
 * @param {Database} db Database Database object
 * @param {string} userId User ID
 * @param {DrinkingSessionArrayItem} session Session to edit
 * @param {string} sessionKey ID of the session to edit
 * @param {boolean} newSession True if the session has not existed up to this function call, false otherwise.
 * @returns {Promise<void>}
 *  */
export async function editDrinkingSessionData(
  db: Database,
  userId: string,
  session: DrinkingSessionArrayItem,
  sessionKey: string,
  newSession: boolean,
): Promise<void> {
  var updates: {[key: string]: DrinkingSessionArrayItem} = {};
  let newKey = sessionKey;
  if (newSession) {
    // Handle the case of an unexisting session
    let generatedKey = await push(
      child(ref(db), `/user_drinking_sessions/${userId}/`),
    ).key;
    if (!generatedKey) {
      throw new Error('Failed to create a new session reference point');
    }
    newKey = generatedKey;
  }
  updates[`/user_drinking_sessions/${userId}/` + newKey] = session;
  await update(ref(db), updates);
}

/** Access the database reference point of a user's drinking session
 * and update the units of that session.
 *
 * @param {Database} db Firebase Database object
 * @param {string} userId User ID
 * @param {string} sessionKey ID of the session to edit
 * @param {UnitsObject} newUnits UnitsObject containing the new units
 * @returns {Promise<void>}
 */
export async function updateSessionUnits(
  db: Database,
  userId: string,
  sessionKey: string,
  newUnits: UnitsObject,
): Promise<void> {
  var updates: {[key: string]: UnitsObject} = {};
  updates[`/user_drinking_sessions/${userId}/${sessionKey}/units`] = newUnits;
  await update(ref(db), updates);
}
