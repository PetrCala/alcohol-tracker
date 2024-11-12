import CONST from '@src/CONST';
import type {
  DrinkKey,
  DrinkingSession,
  DrinkingSessionId,
  DrinkingSessionList,
  DrinkingSessionType,
  DrinksList,
} from '@src/types/onyx';
import {ref, update, type Database} from 'firebase/database';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {numberToVerboseString} from './TimeUtils';
import type {UserID} from '@src/types/onyx/OnyxCommon';
import {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import DBPATHS from '@database/DBPATHS';
import {
  addMilliseconds,
  differenceInDays,
  subDays,
  subMilliseconds,
} from 'date-fns';

const PlaceholderDrinks: DrinksList = {[Date.now()]: {other: 0}};

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
    timezone: Intl.DateTimeFormat().resolvedOptions()
      .timeZone as SelectedTimezone,
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

  // const personalDetails = getPersonalDetailsForUserID(userID);
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

  // const longName = PersonalDetailsUtils.getDisplayNameOrDefault(
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

/**
 * Change all timestamps in a session so that its start time corresponds to a new date.
 *
 * Shift the timestamps by whole days, keeping the hour:minute times as they are.
 *
 * @param session The session to modify
 * @param newDate The new date to modify the session's timestamps to
 * @returns The modified session
 */
function shiftSessionDate(
  session: DrinkingSession,
  newDate: Date,
): DrinkingSession {
  const currentDate = new Date(session.start_time);
  const daysDelta = differenceInDays(currentDate, newDate);
  const millisecondsToSub = daysDelta * 24 * 60 * 60 * 1000;
  const modifiedSession = shiftSessionTimestamps(session, millisecondsToSub);
  return modifiedSession;
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
  const timezoneRef = DBPATHS.USERS_USER_ID_PRIVATE_DATA_TIMEZONE;

  const updates: Record<string, DrinkingSessionList | Timezone> = {};
  updates[sessionsRef.getRoute(userID)] = convertedSessions;
  updates[timezoneRef.getRoute(userID)] = userTimezone;

  await update(ref(db), updates);
}

export {
  PlaceholderDrinks,
  allSessionsContainTimezone,
  calculateSessionLength,
  determineSessionMostCommonDrink,
  extractSessionOrEmpty,
  getDisplayNameForParticipant,
  getEmptySession,
  getUserDetailTooltipText,
  isEmptySession,
  sessionIsExpired,
  fixTimezoneSessions,
  shiftSessionTimestamps,
  shiftSessionDate,
};
