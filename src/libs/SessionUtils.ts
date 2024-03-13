import {
  DrinkingSession,
  DrinkingSessionId,
  DrinkingSessionList,
  UnitsList,
} from '@src/types/database';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

const PlaceholderUnits: UnitsList = {[Date.now()]: {other: 0}};

/**
 * @returns An empty drinking session object.
 */
function getEmptySession(
  usePlaceholderUnits?: boolean,
  ongoing?: boolean,
): DrinkingSession {
  let emptySession: DrinkingSession = {
    start_time: 0,
    end_time: 0,
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

/**
 * Executes a task only after a condition is met or the maximum number of retries is reached.
 * @param task A function to execute that returns a promise.
 * @param condition A function that returns a boolean indicating whether the task should be retried.
 * @param maxRetries The maximum number of times to check for the condition.
 * @param delay The delay between retries in milliseconds.
 * @returns A promise that resolves when the task is completed or if the condition does not become true after the maximum number of retries.
 */
async function executeAfterCondition(
  task: () => Promise<void>,
  condition: boolean,
  maxRetries: number = 5,
  delay: number = 100,
): Promise<void> {
  let attempt = 0;
  while (!condition && attempt < maxRetries) {
    console.log('waiting...');
    await new Promise(resolve => setTimeout(resolve, delay));
    attempt++;
  }
  if (attempt === maxRetries) {
    console.log(`Maximum attempts reached (${maxRetries}).`);
    return;
  }
  console.log('condition met, executing task...');
  await task();
}


export {
  PlaceholderUnits,
  extractSessionOrEmpty,
  getEmptySession,
  isEmptySession,
  executeAfterCondition,
};
