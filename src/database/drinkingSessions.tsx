import {Database, ref, update} from 'firebase/database';
import {
  UserStatusData,
  DrinkingSessionArrayItem,
  UnitsObject,
} from '../types/database';

/** Write drinking session data into the database
 *
 * @param db Firebase Database object
 * @param string userId User ID
 * @param newSessionData Data to save the new drinking session with
 * @param updateStatus Whether to update the user status data or not
 * @return Promise void.
 *  */
export async function saveDrinkingSessionData(
  db: Database,
  userId: string,
  newSessionData: DrinkingSessionArrayItem,
  sessionKey: string,
  updateStatus?: boolean,
): Promise<void> {
  var updates: {[key: string]: any} = {};
  updates[`user_drinking_sessions/${userId}/` + sessionKey] = newSessionData;
  if (updateStatus) {
    const userStatusData: UserStatusData = {
      last_online: new Date().getTime(),
      latest_session_id: sessionKey,
      latest_session: newSessionData,
    };
    updates[`user_status/${userId}`] = userStatusData;
  }
  await update(ref(db), updates);
}

/** Start a live drinking session
 *
 * @param db Firebase Database object
 * @param string userId User ID
 * @param newSessionData Data to save the new drinking session with
 * @param sesisonKey ID of the session to edit (can be null in case of finishing the session)
 * @return Promise void.
 *  */
export async function startLiveDrinkingSession(
  db: Database,
  userId: string,
  newSessionData: DrinkingSessionArrayItem,
  sessionKey: string,
): Promise<void> {
  var updates: {[key: string]: any} = {};
  const userStatusData: UserStatusData = {
    last_online: new Date().getTime(),
    latest_session_id: sessionKey,
    latest_session: newSessionData,
  };
  updates[`user_status/${userId}`] = userStatusData;
  updates[`user_drinking_sessions/${userId}/` + sessionKey] = newSessionData;
  await update(ref(db), updates);
}

/** End a live drinking session
 *
 * @param db Firebase Database object
 * @param string userId User ID
 * @param newSessionData Data to save the new drinking session with
 * @param sesisonKey ID of the session to edit (can be null in case of finishing the session)
 * @return Promise void.
 *  */
export async function endLiveDrinkingSession(
  db: Database,
  userId: string,
  newSessionData: DrinkingSessionArrayItem,
  sessionKey: string,
): Promise<void> {
  var updates: {[key: string]: any} = {};
  const userStatusData: UserStatusData = {
    // ETC - 1
    last_online: new Date().getTime(),
    latest_session_id: sessionKey,
    latest_session: newSessionData,
  };
  updates[`user_status/${userId}`] = userStatusData;
  updates[`user_drinking_sessions/${userId}/` + sessionKey] = newSessionData;
  await update(ref(db), updates);
}

/** Remove drinking session data from the database
 *
 * Should only be used to edit non-live sessions.
 *
 * @param db Firebase Database object
 * @param userId User ID
 * @param sessionKey ID of the session to remove
 * @returns
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

/**
 * Discards a drinking session for a specific user.
 *
 * @param db - The database instance.
 * @param userId - The ID of the user.
 * @param sessionKey - The key of the session to be discarded.
 * @returns A Promise that resolves when the session is discarded.
 */
export async function discardLiveDrinkingSession(
  db: Database,
  userId: string,
  sessionKey: string,
): Promise<void> {
  var updates: {[key: string]: any} = {};
  const userStatusData: UserStatusData = {last_online: new Date().getTime()}; // No session info
  updates['/user_drinking_sessions/' + userId + '/' + sessionKey] = null;
  updates[`/user_status/${userId}`] = userStatusData;
  await update(ref(db), updates);
}

/** Access the database reference point of a user's drinking session
 * and update the units of that session.
 *
 * @param db Firebase Database object
 * @param userId User ID
 * @param sessionKey ID of the session to edit
 * @param UnitsObject containing the new units
 * @returns A promise.
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
