import CONST from '@src/CONST';
import type {
  DrinkKey,
  DrinkingSession,
  DrinkingSessionId,
  DrinkingSessionList,
  DrinkingSessionType,
  Drinks,
  DrinksList,
  DrinksToUnits,
} from '@src/types/onyx';
import {ref, update, type Database} from 'firebase/database';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {numberToVerboseString} from './TimeUtils';
import type {UserID} from '@src/types/onyx/OnyxCommon';
import {SelectedTimezone, Timezone} from '@src/types/onyx/UserData';
import DBPATHS from '@database/DBPATHS';
import {format, subMilliseconds} from 'date-fns';
import Onyx, {OnyxKey} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {auth} from './Firebase/FirebaseApp';
import {formatInTimeZone} from 'date-fns-tz';
import {
  AddDrinksOptions,
  RemoveDrinksOptions,
} from '@src/types/onyx/DrinkingSession';
import {roundToTwoDecimalPlaces} from './NumberUtils';
import _ from 'lodash';
import {ValueOf} from 'type-fest';
import Log from './Log';

const PlaceholderDrinks: DrinksList = {[Date.now()]: {other: 0}};

let timezone: Required<Timezone> = CONST.DEFAULT_TIME_ZONE;
Onyx.connect({
  key: ONYXKEYS.USER_DATA_LIST,
  callback: value => {
    if (!auth?.currentUser) {
      return;
    }
    const currentUserID = auth?.currentUser?.uid;
    const userDataTimezone = value?.[currentUserID]?.timezone;
    timezone = {
      selected: userDataTimezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected,
      automatic:
        userDataTimezone?.automatic ?? CONST.DEFAULT_TIME_ZONE.automatic,
    };
  },
});

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

/**
 * @returns An empty drinking session object.
 */
function getEmptySession(
  type?: DrinkingSessionType,
  ongoing?: boolean,
): DrinkingSession {
  const emptySession: DrinkingSession = {
    start_time: Date.now(),
    end_time: Date.now(),
    blackout: false,
    note: '',
    timezone: timezone.selected,
    type: type ?? CONST.SESSION_TYPES.EDIT,
    ...(ongoing && {ongoing: true}),
  };
  return emptySession;
}

/**
 * Check whether a drinking session is empty.
 */
function isEmptySession(session: DrinkingSession): boolean {
  return (
    session.start_time === 0 &&
    session.end_time === 0 &&
    isEmptyObject(session?.drinks) &&
    session.blackout === false &&
    session.note === ''
  );
}

/**
 * Based on the session ID, get the drinking session data.
 *
 * @param sessionId The ID of the session.
 * @returns The drinking session data.
 */
function getDrinkingSessionData(
  sessionId: DrinkingSessionId | undefined,
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
 * Calculates the total units of a Drinks object based on a DrinksToUnits mapping.
 *
 * @param drinks - The Drinks object containing drink counts.
 * @param drinksToUnits - A mapping from DrinkKey to unit conversion factors.
 * @param roundUp?: boolean,
 * @returns The total units calculated.
 */
function calculateTotalUnits(
  drinks: DrinksList | undefined,
  drinksToUnits: DrinksToUnits,
  roundUp?: boolean,
): number {
  if (!drinks) {
    return 0;
  }

  let totalUnits = 0;

  _.forEach(Object.values(drinks), drink => {
    for (const [drinkKey, count] of Object.entries(drink)) {
      const conversionFactor = drinksToUnits[drinkKey as DrinkKey] || 0;
      totalUnits += (count || 0) * conversionFactor;
    }
  });

  if (roundUp) {
    return roundToTwoDecimalPlaces(totalUnits);
  }

  return totalUnits;
}

/**
 * Adds a Drinks object to an existing DrinksList object with a specified timestamp behavior.
 * It checks if the total units exceed the maximum allowed units before adding.
 *
 * @param drinkType - The type of drink to add.
 * @param amount - The amount of the drink to add.
 * @param drinksList - The existing DrinksList object.
 * @param drinksToUnits - A mapping from DrinkKey to unit conversion factors.
 * @param options - Options to specify the timestamp behavior.
 * @param maxUnits - The maximum allowed units. Defaults to CONST.MAX_ALLOWED_UNITS.
 * @returns The updated DrinksList object.
 */
function addDrinksToList(
  drinkKey: DrinkKey,
  amount: number,
  drinksList: DrinksList | undefined,
  drinksToUnits: DrinksToUnits,
  options: AddDrinksOptions,
  maxUnits: number = CONST.MAX_ALLOWED_UNITS,
): DrinksList {
  if (!drinksList) {
    drinksList = {};
  }

  if (amount <= 0) {
    Log.warn(`Invalid amount: ${amount}`);
    return drinksList;
  }

  if (!drinksToUnits[drinkKey]) {
    Log.warn(`Invalid drink key: ${drinkKey}`);
    return drinksList;
  }

  const conversion = drinksToUnits[drinkKey] || 0;

  const currentUnits = calculateTotalUnits(drinksList, drinksToUnits);
  const newUnits = amount * conversion;

  if (currentUnits + newUnits > maxUnits) {
    // TODO potentially show a warning message to the user
    Log.warn('Total units exceed the maximum allowed units. Drinks not added.');
    return drinksList;
  }

  let timestamp: number;

  if (options.timestampOption === 'now') {
    timestamp = Date.now();
  } else if (options.timestampOption === 'sessionStartTime') {
    timestamp = options.session.start_time;
  } else {
    throw new Error('Invalid timestampOption');
  }

  // Create a shallow copy of drinksList to avoid mutating the original
  const updatedDrinksList: DrinksList = {...drinksList};

  if (updatedDrinksList[timestamp]) {
    // Timestamp already exists, merge the drinks
    const existingDrinks = updatedDrinksList[timestamp];
    const mergedDrinks: Drinks = {...existingDrinks};

    mergedDrinks[drinkKey as DrinkKey] =
      (mergedDrinks[drinkKey as DrinkKey] || 0) + (amount || 0);

    updatedDrinksList[timestamp] = mergedDrinks;
  } else {
    // Timestamp does not exist, add the drinks
    updatedDrinksList[timestamp] = {[drinkKey]: amount};
  }

  return updatedDrinksList;
}

/**
 * Removes drinks from a DrinksList based on the specified behavior.
 *
 * @param drinkKey - The drink key to remove.
 * @param amount - The number of drinks to remove.
 * @param drinksList - The existing DrinksList from which to remove drinks.
 * @param options - The behavior for removal ('removeFromLatest' or 'removeFromEarliest').
 * @returns The updated DrinksList after removal.
 */
function removeDrinksFromList(
  drinkKey: DrinkKey,
  amount: number,
  drinksList: DrinksList | undefined,
  options: RemoveDrinksOptions,
): DrinksList {
  if (!drinksList) {
    return {};
  }

  if (amount <= 0) {
    Log.warn(`Invalid amount: ${amount}`);
    return drinksList;
  }

  const updatedDrinksList: DrinksList = JSON.parse(JSON.stringify(drinksList));

  let remainingAmountToRemove = amount || 0;

  for (const timestamp of Object.keys(updatedDrinksList).sort((a, b) =>
    options === 'removeFromLatest' ? +b - +a : +a - +b,
  )) {
    const drinksAtTimestamp = updatedDrinksList[+timestamp];
    const avaiableAmount = drinksAtTimestamp[drinkKey as DrinkKey] || 0;

    if (avaiableAmount > 0) {
      const amountRemoved = Math.min(remainingAmountToRemove, avaiableAmount);

      drinksAtTimestamp[drinkKey] = avaiableAmount - amountRemoved;
      remainingAmountToRemove -= amountRemoved;

      // Clean up if there are zero drinks left for this type at this timestamp
      if (drinksAtTimestamp[drinkKey] === 0) {
        delete drinksAtTimestamp[drinkKey];
      }

      // Clean up if there are zero drinks left at this timestamp
      if (Object.keys(drinksAtTimestamp).length === 0) {
        delete updatedDrinksList[+timestamp];
      }
    }

    if (remainingAmountToRemove <= 0) {
      break;
    }
  }
  return updatedDrinksList;
}

/**
 * Get the options for adding drinks to a session based on the session state.
 *
 * @param session The session to add drinks to
 * @returns The options for adding drinks
 */
function getSessionAddDrinksOptions(
  session: DrinkingSession,
): AddDrinksOptions {
  return session?.ongoing
    ? {
        timestampOption: 'now',
      }
    : {
        timestampOption: 'sessionStartTime',
        session: session,
      };
}

function getSessionRemoveDrinksOptions(): RemoveDrinksOptions {
  return 'removeFromLatest';
}

/**
 * Modify the drinks in a session based on the action.
 *
 * @param session The session to modify
 * @param drinkKey The key of the drink to modify
 * @param amount The amount of the drink to modify
 * @param drinksToUnits The mapping from drink keys to units
 * @param action The action to perform
 * @returns The updated drinks list
 */
function modifySessionDrinks(
  session: DrinkingSession,
  drinkKey: DrinkKey,
  amount: number,
  action: ValueOf<typeof CONST.DRINKS.ACTIONS>,
  drinksToUnits: DrinksToUnits,
): DrinksList | undefined {
  let drinksList = _.cloneDeep(session?.drinks);
  if (action === 'add') {
    const options: AddDrinksOptions = getSessionAddDrinksOptions(session);
    drinksList = addDrinksToList(
      drinkKey,
      amount,
      drinksList,
      drinksToUnits,
      options,
    );
  } else if (action === 'remove') {
    const options: RemoveDrinksOptions = 'removeFromLatest';
    drinksList = removeDrinksFromList(drinkKey, amount, drinksList, options);
  }

  return drinksList;
}

function sessionIsExpired(session: DrinkingSession | undefined): boolean {
  if (!session) {
    return false;
  }
  const expirationBoundary = Date.now() - CONST.SESSION_EXPIRY;
  return session.start_time < expirationBoundary;
}

/** Calculate a length of a sesison either as a number, or as a string */
function calculateSessionLength(
  session: DrinkingSession | undefined,
  returnString?: boolean,
): number | string {
  if (!session) {
    return returnString ? '0s' : 0;
  }
  const length = session?.end_time ? session.end_time - session.start_time : 0;
  if (returnString) {
    return numberToVerboseString(length, false);
  }
  return length;
}

/**
 * From a list of drinking sessions, extract a single session object.
 * If the list does not contain the session, return an empty session.
 */
function extractSessionOrEmpty(
  sessionId: DrinkingSessionId,
  drinkingSessionData: DrinkingSessionList | undefined,
): DrinkingSession {
  if (isEmptyObject(drinkingSessionData)) {
    return getEmptySession();
  }
  if (
    drinkingSessionData &&
    Object.keys(drinkingSessionData).includes(sessionId)
  ) {
    return drinkingSessionData[sessionId];
  }
  return getEmptySession();
}

/** Given a DrinkingSession object, determine its type (i.e.,
 *  the most number of units the user has in this session).
 *
 * If there are no drinks in the session, return null.
 * */
function determineSessionMostCommonDrink(
  session: DrinkingSession | undefined | null,
): DrinkKey | undefined | null {
  if (!session) {
    return null;
  }
  const drinks = session.drinks;
  if (!drinks) {
    return null;
  }
  const drinkCounts: Partial<Record<DrinkKey, number>> = {};

  Object.values(drinks).forEach(drinksAtTimestamp => {
    Object.entries(drinksAtTimestamp).forEach(([drinkKey, count]) => {
      if (count) {
        const key = drinkKey as DrinkKey; // Initialize safely
        // Increment the count, initializing to 0 if necessary
        drinkCounts[key] = (drinkCounts[key] || 0) + count;
      }
    });
  });

  // Find the drink with the highest count
  let mostCommonDrink: DrinkKey | null = null;
  let highestCount = 0;
  let isTie = false;
  Object.entries(drinkCounts).forEach(([drinkKey, count]) => {
    if (count) {
      if (count > highestCount) {
        highestCount = count;
        mostCommonDrink = drinkKey as DrinkKey;
        isTie = false; // Reset the tie flag as we have a new leader
      } else if (count === highestCount) {
        isTie = true; // A tie has occurred
      }
    }
  });

  // In case of no single winner, return 'other'
  if (isTie && highestCount > 0) {
    return CONST.DRINKS.KEYS.OTHER;
  }

  return mostCommonDrink;
}

/**
 * Get the displayName for a single session participant.
 */
function getDisplayNameForParticipant(
  userID?: UserID,
  shouldUseShortForm = false,
  shouldFallbackToHidden = true,
  shouldAddCurrentUserPostfix = false,
): string {
  if (!userID) {
    return '';
  }
  return 'not-yet-implemented'; // TODO implement this

  // const personalDetails = getUserDataForUserID(userID);
  // // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  // const formattedLogin = LocalePhoneNumber.formatPhoneNumber(
  //   personalDetails.login || '',
  // );
  // // This is to check if account is an invite/optimistically created one
  // // and prevent from falling back to 'Hidden', so a correct value is shown
  // // when searching for a new user
  // if (personalDetails.isOptimisticPersonalDetail === true) {
  //   return formattedLogin;
  // }

  // // For selfDM, we display the user's displayName followed by '(you)' as a postfix
  // const shouldAddPostfix =
  //   shouldAddCurrentUserPostfix && userID === currentUserID;

  // const longName = UserDataUtils.getDisplayNameOrDefault(
  //   personalDetails,
  //   formattedLogin,
  //   shouldFallbackToHidden,
  //   shouldAddPostfix,
  // );

  // // If the user's personal details (first name) should be hidden, make sure we return "hidden" instead of the short name
  // if (
  //   shouldFallbackToHidden &&
  //   longName === Localize.translateLocal('common.hidden')
  // ) {
  //   return longName;
  // }

  // const shortName = personalDetails.firstName
  //   ? personalDetails.firstName
  //   : longName;
  // return shouldUseShortForm ? shortName : longName;
}

/**
 * Determine whether the given session is on a different day when converted to the given timezone.
 *
 * @param session The session to check
 * @param timezone The timezone to convert the session to
 * @returns Whether the session is on a different day
 */
function isDifferentDay(
  session: DrinkingSession,
  timezone: SelectedTimezone,
): boolean {
  const stringFormat = 'yyyy-MM-dd';
  const start_time = session.start_time;
  let currentDay: string;
  if (session.timezone) {
    currentDay = formatInTimeZone(start_time, session.timezone, stringFormat);
  } else {
    currentDay = format(start_time, stringFormat);
  }
  const newDay = formatInTimeZone(session.start_time, timezone, stringFormat);
  return currentDay !== newDay;
}

/**
 * Returns the the display names of the given user userIDs
 */
function getUserDetailTooltipText(
  userID: UserID,
  fallbackUserDisplayName = '',
): string {
  const displayNameForParticipant = getDisplayNameForParticipant(userID);
  return displayNameForParticipant || fallbackUserDisplayName;
}

/**
 * Check if all sessions contain a timezone.
 *
 * @param sessions The list of drinking sessions to check
 * @returns Whether all sessions contain a timezone
 */
function allSessionsContainTimezone(sessions?: DrinkingSessionList): boolean {
  if (isEmptyObject(sessions)) {
    return true; // No session to fix
  }

  return Object.values(sessions).every(
    session => 'timezone' in session && session.timezone,
  );
}

/**
 * Modify all timestamps of a drinking session and return the updated session
 *
 * @param session The session to update
 * @param millisecondsToSub How many milliseconds to subtract the timestamps by
 */
function shiftSessionTimestamps(
  session: DrinkingSession,
  millisecondsToSub: number,
): DrinkingSession {
  if (millisecondsToSub === 0) {
    return session;
  }
  const convertedSession = {...session};
  convertedSession.start_time = subMilliseconds(
    session.start_time,
    millisecondsToSub,
  ).getTime();
  convertedSession.end_time = subMilliseconds(
    session.end_time,
    millisecondsToSub,
  ).getTime();

  const convertedDrinks: DrinksList = {};
  const existingTimestamps = new Set<number>();

  if (!isEmptyObject(session.drinks)) {
    Object.entries(session.drinks).forEach(([timestamp, drinksAtTimestamp]) => {
      let newTimestamp = subMilliseconds(
        Number(timestamp),
        millisecondsToSub,
      ).getTime();

      // Ensure the new timestamp is unique by checking for collisions
      while (existingTimestamps.has(newTimestamp)) {
        newTimestamp += 1; // Increment timestamp slightly to avoid collision
      }

      existingTimestamps.add(newTimestamp);
      convertedDrinks[newTimestamp] = drinksAtTimestamp;
    });

    convertedSession.drinks = convertedDrinks;
  }

  return convertedSession;
}

async function fixTimezoneSessions(
  db: Database,
  userID: UserID | undefined,
  sessions: DrinkingSessionList | undefined,
  timezone: SelectedTimezone,
) {
  if (!userID) {
    throw new Error('Invalid user. Try reloading the app.');
  }
  if (isEmptyObject(sessions)) {
    return;
  }
  const convertedSessions: DrinkingSessionList = {};
  Object.entries(sessions).forEach(([sessionId, session]) => {
    const convertedSession = {...session};
    if (!convertedSession.timezone) {
      convertedSession.timezone = timezone;
    }

    if ('session_type' in session) {
      convertedSession.type = session.session_type as DrinkingSessionType;
      delete convertedSession.session_type;
    }

    convertedSessions[sessionId] = convertedSession;
  });

  // We flag the sessions with the TZ the user chose, but for the app, we automatically assign the automatic timezone
  const userTimezone: Timezone = {
    selected: Intl.DateTimeFormat().resolvedOptions()
      .timeZone as SelectedTimezone,
    automatic: true,
  };

  const sessionsRef = DBPATHS.USER_DRINKING_SESSIONS_USER_ID;
  const timezoneRef = DBPATHS.USERS_USER_ID_TIMEZONE;

  const updates: Record<string, DrinkingSessionList | Timezone> = {};
  updates[sessionsRef.getRoute(userID)] = convertedSessions;
  updates[timezoneRef.getRoute(userID)] = userTimezone;

  await update(ref(db), updates);
}

export {
  PlaceholderDrinks,
  addDrinksToList,
  allSessionsContainTimezone,
  calculateSessionLength,
  calculateTotalUnits,
  determineSessionMostCommonDrink,
  extractSessionOrEmpty,
  fixTimezoneSessions,
  getDisplayNameForParticipant,
  getDrinkingSessionData,
  getDrinkingSessionOnyxKey,
  getEmptySession,
  getSessionAddDrinksOptions,
  getSessionRemoveDrinksOptions,
  getUserDetailTooltipText,
  isDifferentDay,
  isEmptySession,
  modifySessionDrinks,
  removeDrinksFromList,
  sessionIsExpired,
  shiftSessionTimestamps,
};
