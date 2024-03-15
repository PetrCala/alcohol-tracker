import {
  DrinkingSession,
  DrinkingSessionId,
  DrinkingSessionList,
  DrinksList,
} from '@src/types/database';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const PlaceholderUnits: DrinksList = {[Date.now()]: {other: 0}};

/**
 * @returns An empty drinking session object.
 */
function getEmptySession(
  usePlaceholderUnits?: boolean,
  ongoing?: boolean,
): DrinkingSession {
  let emptySession: DrinkingSession = {
    start_time: Date.now(),
    end_time: Date.now(),
    units: usePlaceholderUnits ? PlaceholderUnits : {},
    blackout: false,
    note: '',
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
 * From a list of drinking sessions, extract a single session object.
 * If the list does not contain the session, return an empty session.
 */
function extractSessionOrEmpty(
  sessionId: DrinkingSessionId,
  drinkingSessionData: DrinkingSessionList | undefined,
): DrinkingSession {
  if (isEmptyObject(drinkingSessionData)) return getEmptySession();
  if (
    drinkingSessionData &&
    Object.keys(drinkingSessionData).includes(sessionId)
  ) {
    return drinkingSessionData[sessionId];
  }
  return getEmptySession();
}

export {
  PlaceholderDrinks,
  extractSessionOrEmpty,
  getEmptySession,
  isEmptySession,
};
