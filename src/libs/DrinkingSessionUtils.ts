import CONST from '@src/CONST';
import type {
  DrinkKey,
  DrinkingSession,
  DrinkingSessionId,
  DrinkingSessionList,
  DrinkingSessionType,
  DrinksList,
} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getTimestampAge, numberToVerboseString} from './TimeUtils';

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
  if (!session) {return false;}
  const expirationBoundary = Date.now() - CONST.SESSION_EXPIRY;
  return session.start_time < expirationBoundary;
}

/** Calculate a length of a sesison either as a number, or as a string */
function calculateSessionLength(
  session: DrinkingSession | undefined,
  returnString?: boolean,
): number | string {
  if (!session) {return returnString ? '0s' : 0;}
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
  if (isEmptyObject(drinkingSessionData)) {return getEmptySession();}
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
  if (!session) {return null;}
  const drinks = session.drinks;
  if (!drinks) {return null;}
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

export {
  PlaceholderDrinks,
  determineSessionMostCommonDrink,
  calculateSessionLength,
  extractSessionOrEmpty,
  sessionIsExpired,
  getEmptySession,
  isEmptySession,
};
