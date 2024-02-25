import {
  DrinkingSession,
  DrinkingSessionId,
  DrinkingSessionList,
} from '@src/types/database';

/**
 * @returns An empty drinking session object.
 */
function getEmptySession(): DrinkingSession {
  return {
    start_time: 0,
    end_time: 0,
    units: {},
    blackout: false,
    note: '',
  };
}

/**
 * Check whether a drinking session is empty.
 */
function isEmptySession(session: DrinkingSession): boolean {
  return (
    session.start_time === 0 &&
    session.end_time === 0 &&
    Object.keys(session.units).length === 0 &&
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
  drinkingSessionData: DrinkingSessionList | null,
): DrinkingSession {
  if (
    drinkingSessionData &&
    Object.keys(drinkingSessionData).includes(sessionId)
  ) {
    return drinkingSessionData[sessionId];
  }
  return getEmptySession();
}

export {extractSessionOrEmpty, getEmptySession, isEmptySession};
