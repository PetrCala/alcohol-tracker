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
import {AddDrinksOptions} from '@src/types/onyx/DrinkingSession';
import {roundToTwoDecimalPlaces} from './NumberUtils';

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
  usePlaceholderDrinks?: boolean,
  ongoing?: boolean,
): DrinkingSession {
  const emptySession: DrinkingSession = {
    start_time: Date.now(),
    end_time: Date.now(),
    drinks: usePlaceholderDrinks ? PlaceholderDrinks : {},
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
  drinks: Drinks | undefined,
  drinksToUnits: DrinksToUnits,
  roundUp?: boolean,
): number {
  if (!drinks) {
    return 0;
  }

  let totalUnits = 0;

  for (const [drinkKey, count] of Object.entries(drinks)) {
    const conversionFactor = drinksToUnits[drinkKey as DrinkKey] || 0;
    totalUnits += (count || 0) * conversionFactor;
  }

  if (roundUp) {
    return roundToTwoDecimalPlaces(totalUnits);
  }

  return totalUnits;
}

/**
 * Adds a Drinks object to an existing DrinksList object with a specified timestamp behavior.
 *
 * @param drinks - The Drinks object to add.
 * @param drinksList - The existing DrinksList object.
 * @param options - Options to specify the timestamp behavior.
 * @returns The updated DrinksList object.
 */
function addDrinks(
  drinks: Drinks,
  drinksList: DrinksList,
  options: AddDrinksOptions,
): DrinksList {
  let timestamp: number;

  if (options.timestampOption === 'now') {
    timestamp = Date.now();
  } else if (options.timestampOption === 'sessionStartTime') {
    timestamp = options.session.start_time;
  } else {
    throw new Error('Invalid timestampOption');
  }

  return {
    ...drinksList,
    [timestamp]: drinks,
  };
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
  addDrinks,
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
  getUserDetailTooltipText,
  isDifferentDay,
  isEmptySession,
  sessionIsExpired,
  shiftSessionTimestamps,
};
