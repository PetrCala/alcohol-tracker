import {Database, ref, update} from 'firebase/database';
import {removeZeroObjectsFromSession} from '@src/utils/dataHandling';
import {DrinkingSession, UnitsList, UserStatus} from '@src/types/database';
import DBPATHS from './DBPATHS';

const drinkingSessionRef = DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID;
const drinkingSessionUnitsRef =
  DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID_UNITS;
const userStatusRef = DBPATHS.USER_STATUS_USER_ID;

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
  newSessionData: DrinkingSession,
  sessionKey: string,
  updateStatus?: boolean,
): Promise<void> {
  newSessionData = removeZeroObjectsFromSession(newSessionData); // Delete the initial log of zero units that was used as a placeholder
  var updates: {[key: string]: any} = {};
  updates[drinkingSessionRef.getRoute(userId, sessionKey)] = newSessionData;
  if (updateStatus) {
    const userStatusData: UserStatus = {
      last_online: new Date().getTime(),
      latest_session_id: sessionKey,
      latest_session: newSessionData,
    };
    updates[userStatusRef.getRoute(userId)] = userStatusData;
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
  newSessionData: DrinkingSession,
  sessionKey: string,
): Promise<void> {
  var updates: {[key: string]: any} = {};
  const userStatusData: UserStatus = {
    last_online: new Date().getTime(),
    latest_session_id: sessionKey,
    latest_session: newSessionData,
  };
  updates[userStatusRef.getRoute(userId)] = userStatusData;
  updates[drinkingSessionRef.getRoute(userId, sessionKey)] = newSessionData;
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
  newSessionData: DrinkingSession,
  sessionKey: string,
): Promise<void> {
  newSessionData = removeZeroObjectsFromSession(newSessionData);
  var updates: {[key: string]: any} = {};
  const userStatusData: UserStatus = {
    // ETC - 1
    last_online: new Date().getTime(),
    latest_session_id: sessionKey,
    latest_session: newSessionData,
  };
  updates[userStatusRef.getRoute(userId)] = userStatusData;
  updates[drinkingSessionRef.getRoute(userId, sessionKey)] = newSessionData;
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
  updates[drinkingSessionRef.getRoute(userId, sessionKey)] = null;
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
  const userStatusData: UserStatus = {last_online: new Date().getTime()}; // No session info
  updates[drinkingSessionRef.getRoute(userId, sessionKey)] = null;
  updates[userStatusRef.getRoute(userId)] = userStatusData;
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
  newUnits: UnitsList,
): Promise<void> {
  var updates: {[key: string]: UnitsList} = {};
  updates[drinkingSessionUnitsRef.getRoute(userId, sessionKey)] = newUnits;
  await update(ref(db), updates);
}
