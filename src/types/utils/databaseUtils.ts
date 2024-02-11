import {DrinkingSession, DrinkingSessionId} from '@src/types/database';

type DrinkingSessionKeyValue = {
  sessionKey: DrinkingSessionId;
  session: DrinkingSession;
};

export type {DrinkingSessionKeyValue};
