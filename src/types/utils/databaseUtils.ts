import type {DrinkingSession, DrinkingSessionId} from '@src/types/onyx';

type DrinkingSessionKeyValue = {
  sessionId: DrinkingSessionId;
  session: DrinkingSession;
};

export default DrinkingSessionKeyValue;
