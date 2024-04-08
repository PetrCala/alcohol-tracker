import {DrinkingSession, DrinkingSessionId} from '@src/types/onyx';

type DrinkingSessionKeyValue = {
  sessionId: DrinkingSessionId;
  session: DrinkingSession;
};

export type {DrinkingSessionKeyValue};
