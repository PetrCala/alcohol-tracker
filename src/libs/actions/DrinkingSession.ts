import type {Database} from 'firebase/database';
import {ref, update} from 'firebase/database';
import {removeZeroObjectsFromSession} from '@libs/DataHandling';
import type {
  DrinkingSession,
  DrinkingSessionId,
  DrinkingSessionList,
  DrinksList,
  UserStatus,
} from '@src/types/onyx';
import * as Localize from '@src/libs/Localize';
import * as DSUtils from '@src/libs/DrinkingSessionUtils';
import type {UserID} from '@src/types/onyx/OnyxCommon';
import DBPATHS from '../../database/DBPATHS';
import {User} from 'firebase/auth';
import CONST from '@src/CONST';
import {generateDatabaseKey} from '@database/baseFunctions';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

let currentLiveSessionData: DrinkingSession | undefined;
Onyx.connect({
  key: ONYXKEYS.LIVE_SESSION_DATA,
  callback: value => {
    if (value) {
      currentLiveSessionData = value;
    }
  },
});

let currentEditSessionData: DrinkingSession | undefined;
Onyx.connect({
  key: ONYXKEYS.EDIT_SESSION_DATA,
  callback: value => {
    if (value) {
      currentEditSessionData = value;
    }
  },
});

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
async function saveDrinkingSessionData(
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
async function savePlaceholderSessionData(
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
async function removePlaceholderSessionData(
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
 * @returnsPromise newSessionId Id of the newly started session.
 *  */
async function startLiveDrinkingSession(
  db: Database,
  user: User | null,
): Promise<string> {
  if (!user) {
    throw new Error(Localize.translateLocal('homeScreen.error.sessionStart'));
  }

  // The user is not in an active session
  const newSessionData: DrinkingSession = DSUtils.getEmptySession(
    CONST.SESSION_TYPES.LIVE,
    true,
    true,
  );

  const newSessionId = generateDatabaseKey(
    db,
    DBPATHS.USER_DRINKING_SESSIONS_USER_ID.getRoute(user.uid),
  );
  if (!newSessionId) {
    throw new Error(Localize.translateLocal('homeScreen.error.sessionStart'));
  }

  // Update Firebase
  newSessionData.drinks = newSessionData.drinks || {}; // Can not send undefined
  const updates: Record<string, any> = {};
  const userStatusData: UserStatus = {
    last_online: new Date().getTime(),
    latest_session_id: newSessionId,
    latest_session: newSessionData,
  };
  updates[userStatusRef.getRoute(user.uid)] = userStatusData;
  updates[drinkingSessionRef.getRoute(user.uid, newSessionId)] = newSessionData;
  await update(ref(db), updates);

  // Update Onyx
  Onyx.set(ONYXKEYS.LIVE_SESSION_DATA, {
    id: newSessionId,
    ...newSessionData,
  });

  return newSessionId;
}

/** End a live drinking session
 *
 * @param db Firebase Database object
 * @param string userID User ID
 * @param newSessionData Data to save the new drinking session with
 * @param sesisonKey ID of the session to edit (can be null in case of finishing the session)
 * @returnsPromise void.
 *  */
async function endLiveDrinkingSession(
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

/**
 * Retrieve data for a drinking session based on its ID.
 *
 * @param sessionKey
 */
function openDrinkingSession(
  sessionKey: DrinkingSessionId,
  drinkingSessionData?: DrinkingSessionList | undefined,
): DrinkingSession {
  if (sessionKey === currentLiveSessionData?.id) {
    return currentLiveSessionData;
  } else if (sessionKey === currentEditSessionData?.id) {
    return currentEditSessionData;
  } else {
    if (drinkingSessionData) {
      return drinkingSessionData[sessionKey];
    }
    throw new Error(
      Localize.translateLocal('drinkingSession.error.sessionOpen'),
    );
  }
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
async function removeDrinkingSessionData(
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
async function discardLiveDrinkingSession(
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
async function updateSessionDrinks(
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

async function openSession() {}

export {
  saveDrinkingSessionData,
  savePlaceholderSessionData,
  removePlaceholderSessionData,
  startLiveDrinkingSession,
  endLiveDrinkingSession,
  openDrinkingSession,
  removeDrinkingSessionData,
  discardLiveDrinkingSession,
  updateSessionDrinks,
};
