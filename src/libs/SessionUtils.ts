import {
  DrinkingSession,
  DrinkingSessionId,
  DrinkingSessionList,
} from '@src/types/database';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

/**
 * @returns An empty drinking session object.
 */
function getEmptySession(usePlaceholderUnits?: boolean): DrinkingSession {
  // const currentUnits = usePlaceholderUnits
  //   ? {
  //       now: {other: 1},
  //     }
  //   : {};
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
    isEmptyObject(session?.units) &&
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

export {extractSessionOrEmpty, getEmptySession, isEmptySession};
