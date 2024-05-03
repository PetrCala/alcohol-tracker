import type {Database} from 'firebase/database';
import {ref, update} from 'firebase/database';
import {removeZeroObjectsFromSession} from '@libs/DataHandling';
import type {DrinkingSession, DrinksList, UserStatus} from '@src/types/onyx';
import type {UserID} from '@src/types/onyx/OnyxCommon';
import DBPATHS from './DBPATHS';

const drinkingSessionRef = DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID;
const drinkingSessionDrinksRef =
  DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID_DRINKS;
const userStatusRef = DBPATHS.USER_STATUS_USER_ID;
const placeholderSessionRef = DBPATHS.USER_SESSION_PLACEHOLDER_USER_ID;

/** Write drinking session data into the database
 *
 * @param db Firebase Database object
 * @param string userID User ID
 * @param newSessionData Data to save the new drinking session with
 * @param updateStatus Whether to update the user status data or not
 * @returnsPromise void.
 *  */
export async function saveDrinkingSessionData(
  db: Database,
  userID: UserID,
  newSessionData: DrinkingSession,
  sessionKey: string,
  updateStatus?: boolean,
): Promise<void> {
  newSessionData = removeZeroObjectsFromSession(newSessionData); // Delete the initial log of zero drinks that was used as a placeholder
  newSessionData.drinks = newSessionData.drinks || {}; // Can not send undefined
  const updates: Record<string, any> = {};
  updates[drinkingSessionRef.getRoute(userID, sessionKey)] = newSessionData;
  if (updateStatus) {
    const userStatusData: UserStatus = {
      last_online: new Date().getTime(),
      latest_session_id: sessionKey,
      latest_session: newSessionData,
    };
    updates[userStatusRef.getRoute(userID)] = userStatusData;
  }
  await update(ref(db), updates);
}

/** Save a placeholder session in the database. Update only the placeholder session node.
 */
export async function savePlaceholderSessionData(
  db: Database,
  userID: UserID,
  newSessionData: DrinkingSession,
): Promise<void> {
  newSessionData = removeZeroObjectsFromSession(newSessionData);
  newSessionData.drinks = newSessionData.drinks || {}; // Can not send undefined
  const updates: Record<string, any> = {};
  updates[placeholderSessionRef.getRoute(userID)] = newSessionData;
  await update(ref(db), updates);
}

/** Remove any potentially existing placeholder session data from the database.
 */
export async function removePlaceholderSessionData(
  db: Database,
  userID: UserID,
): Promise<void> {
  const updates: Record<string, any> = {};
  updates[placeholderSessionRef.getRoute(userID)] = null;
  await update(ref(db), updates);
}

/** Start a live drinking session
 *
 * @param db Firebase Database object
 * @param string userID User ID
 * @param newSessionData Data to save the new drinking session with
 * @param sesisonKey ID of the session to edit (can be null in case of finishing the session)
 * @returnsPromise void.
 *  */
export async function startLiveDrinkingSession(
  db: Database,
  userID: string,
  newSessionData: DrinkingSession,
  sessionKey: string,
): Promise<void> {
  newSessionData.drinks = newSessionData.drinks || {}; // Can not send undefined
  const updates: Record<string, any> = {};
  const userStatusData: UserStatus = {
    last_online: new Date().getTime(),
    latest_session_id: sessionKey,
    latest_session: newSessionData,
  };
  updates[userStatusRef.getRoute(userID)] = userStatusData;
  updates[drinkingSessionRef.getRoute(userID, sessionKey)] = newSessionData;
  await update(ref(db), updates);
}

/** End a live drinking session
 *
 * @param db Firebase Database object
 * @param string userID User ID
 * @param newSessionData Data to save the new drinking session with
 * @param sesisonKey ID of the session to edit (can be null in case of finishing the session)
 * @returnsPromise void.
 *  */
export async function endLiveDrinkingSession(
  db: Database,
  userID: string,
  newSessionData: DrinkingSession,
  sessionKey: string,
): Promise<void> {
  newSessionData = removeZeroObjectsFromSession(newSessionData);
  newSessionData.drinks = newSessionData.drinks || {}; // Can not send undefined
  const updates: Record<string, any> = {};
  const userStatusData: UserStatus = {
    // ETC - 1
    last_online: new Date().getTime(),
    latest_session_id: sessionKey,
    latest_session: newSessionData,
  };
  updates[userStatusRef.getRoute(userID)] = userStatusData;
  updates[drinkingSessionRef.getRoute(userID, sessionKey)] = newSessionData;
  await update(ref(db), updates);
}

/** Remove drinking session data from the database
 *
 * Should only be used to edit non-live sessions.
 *
 * @param db Firebase Database object
 * @param userID User ID
 * @param sessionKey ID of the session to remove
 * @returns
 *  */
export async function removeDrinkingSessionData(
  db: Database,
  userID: string,
  sessionKey: string,
): Promise<void> {
  const updates: Record<string, any> = {};
  updates[drinkingSessionRef.getRoute(userID, sessionKey)] = null;
  await update(ref(db), updates);
}

/**
 * Discards a drinking session for a specific user.
 *
 * @param db - The database instance.
 * @param userID - The ID of the user.
 * @param sessionKey - The key of the session to be discarded.
 * @returns A Promise that resolves when the session is discarded.
 */
export async function discardLiveDrinkingSession(
  db: Database,
  userID: string,
  sessionKey: string,
): Promise<void> {
  const updates: Record<string, any> = {};
  const userStatusData: UserStatus = {last_online: new Date().getTime()}; // No session info
  updates[drinkingSessionRef.getRoute(userID, sessionKey)] = null;
  updates[userStatusRef.getRoute(userID)] = userStatusData;
  await update(ref(db), updates);
}

/** Access the database reference point of a user's drinking session
 * and update the drinks of that session.
 *
 * @param db Firebase Database object
 * @param userID User ID
 * @param sessionKey ID of the session to edit
 * @param newDrinks An object containing the new drinks
 * @returns A promise.
 */
export async function updateSessionDrinks(
  db: Database,
  userID: string,
  sessionKey: string,
  newDrinks: DrinksList | undefined,
): Promise<void> {
  const updates: Record<string, DrinksList> = {};
  updates[drinkingSessionDrinksRef.getRoute(userID, sessionKey)] =
    newDrinks || {}; // Can not send undefined
  await update(ref(db), updates);
}
