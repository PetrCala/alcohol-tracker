import {DrinkingSession, DrinkingSessionId} from '@src/types/database';

type DrinkingSessionKeyValue = {
  sessionId: DrinkingSessionId;
  session: DrinkingSession;
};

export type {DrinkingSessionKeyValue};
