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
import ONYXKEYS, {OnyxKey} from '@src/ONYXKEYS';

let liveSessionData: DrinkingSession | undefined;
Onyx.connect({
  key: ONYXKEYS.LIVE_SESSION_DATA,
  callback: value => {
    if (value) {
      liveSessionData = value;
    }
  },
});

let editSessionData: DrinkingSession | undefined;
Onyx.connect({
  key: ONYXKEYS.EDIT_SESSION_DATA,
  callback: value => {
    if (value) {
      editSessionData = value;
    }
  },
});

const drinkingSessionRef = DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID;
const drinkingSessionDrinksRef =
  DBPATHS.USER_DRINKING_SESSIONS_USER_ID_SESSION_ID_DRINKS;
const userStatusRef = DBPATHS.USER_STATUS_USER_ID;

/**
 * Based on the session ID, get the drinking session data.
 *
 * @param sessionId The ID of the session.
 * @returns The drinking session data.
 */
function getDrinkingSessionData(
  sessionId: DrinkingSessionId,
): DrinkingSession | undefined {
  if (liveSessionData && liveSessionData.id === sessionId) {
    return liveSessionData;
  }
  if (editSessionData && editSessionData.id === sessionId) {
    return editSessionData;
  }
  return undefined;
}

function getDrinkingSessionOnyxKey(
  sessionId: DrinkingSessionId | undefined,
): OnyxKey | null {
  if (!sessionId) {
    return null;
  }
  if (liveSessionData && liveSessionData.id === sessionId) {
    return ONYXKEYS.LIVE_SESSION_DATA;
  }
  if (editSessionData && editSessionData.id === sessionId) {
    return ONYXKEYS.EDIT_SESSION_DATA;
  }
  return null;
}

/**
 * Set the edit session data object in Onyx so that it can be modified. This function should be called only if the relevant object already exists in the onyx database.
 *
 * @param sessionId The ID of the session
 * @param newData The new data to set
 */
function updateLocalData(
  sessionId: DrinkingSessionId,
  newData: DrinkingSession | null,
  onyxKey: OnyxKey,
): void {
  let dataToSet = newData ? {id: sessionId, ...newData} : null;
  Onyx.set(onyxKey, dataToSet);
}

/** Write drinking session data into the database
 *
 * @param db Firebase Database object
 * @param string userID User ID
 * @param newSessionData Data to save the new drinking session with
 * @param updateStatus Whether to update the user status data or not
 * @param updateLocal Whether to update the local data or not. This means removing the data from the Onyx store.
 * @returnsPromise void.
 *  */
async function saveDrinkingSessionData(
  db: Database,
  userID: UserID,
  newSessionData: DrinkingSession,
  sessionKey: string,
  updateStatus?: boolean,
  updateLocal?: boolean,
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
  if (updateLocal) {
    Onyx.set(ONYXKEYS.EDIT_SESSION_DATA, null);
  }
}

/**
 * Check if the current live session data is the same as the one in the database. If not, update the local data.
 *
 * @param ongoingSessionId  The ID of the ongoing session.
 * @param drinkingSessionData  The drinking session data.
 */
function syncLocalLiveSessionData(
  ongoingSessionId: DrinkingSessionId | undefined,
  drinkingSessionData: DrinkingSessionList | undefined,
) {
  if (ongoingSessionId && drinkingSessionData) {
    const ongoingSessionData = drinkingSessionData[ongoingSessionId];
    if (ongoingSessionData) {
      updateLocalData(
        ongoingSessionId,
        ongoingSessionData,
        ONYXKEYS.LIVE_SESSION_DATA,
      );
    }
  } else {
    Onyx.set(ONYXKEYS.LIVE_SESSION_DATA, null);
  }
}

/** Start a live drinking session
 *
 * Assume that if a session is ongoing, it is a live session and its data is stored in the local database.
 *
 * @param db Firebase Database object
 * @param user User object
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
  updateLocalData(newSessionId, newSessionData, ONYXKEYS.LIVE_SESSION_DATA);

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
  Onyx.set(ONYXKEYS.LIVE_SESSION_DATA, null);
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

function updateDrinks(
  session: DrinkingSession | undefined,
  newDrinks: DrinksList | undefined,
) {
  const onyxKey = getDrinkingSessionOnyxKey(session?.id);
  if (onyxKey) {
    // The drinks are a complex object, so Onyx.set must be called
    // TODO try to rewrite the drinks object into a collection
    Onyx.set(onyxKey, {
      ...session,
      drinks: newDrinks,
    });
  }
}

/**
 * Update a drinking session note
 *
 * @param session The session to update
 * @param newNote The new note
 * @returns void
 */
function updateNote(
  session: DrinkingSession | undefined,
  newNote: string,
): void {
  const onyxKey = getDrinkingSessionOnyxKey(session?.id);
  if (onyxKey) {
    Onyx.merge(onyxKey, {
      note: newNote,
    });
  }
}

function updateBlackout(
  session: DrinkingSession | undefined,
  blackout: boolean,
): void {
  const onyxKey = getDrinkingSessionOnyxKey(session?.id);
  if (onyxKey) {
    Onyx.merge(onyxKey, {
      blackout,
    });
  }
}

function getNewSessionToEdit(
  db: Database,
  user: User | null,
  currentDate: Date,
): DrinkingSessionId {
  if (!user) {
    throw new Error(Localize.translateLocal('dayOverviewScreen.error.open'));
  }
  const newSessionId = generateDatabaseKey(
    db,
    DBPATHS.USER_DRINKING_SESSIONS_USER_ID.getRoute(user.uid),
  );
  if (!newSessionId) {
    throw new Error(Localize.translateLocal('dayOverviewScreen.error.open'));
  }
  const timestamp = currentDate.getTime();
  const newSession: DrinkingSession = DSUtils.getEmptySession(
    CONST.SESSION_TYPES.EDIT,
    true,
    false,
  );
  newSession.start_time = timestamp;
  newSession.end_time = timestamp;

  updateLocalData(newSessionId, newSession, ONYXKEYS.EDIT_SESSION_DATA);

  return newSessionId;
}

export {
  getDrinkingSessionData,
  getDrinkingSessionOnyxKey,
  discardLiveDrinkingSession,
  endLiveDrinkingSession,
  removeDrinkingSessionData,
  saveDrinkingSessionData,
  startLiveDrinkingSession,
  syncLocalLiveSessionData,
  updateBlackout,
  updateDrinks,
  updateNote,
  updateLocalData,
  getNewSessionToEdit,
};
