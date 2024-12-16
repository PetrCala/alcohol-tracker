import type {DrinkingSession, DrinkingSessionId} from '@src/types/onyx';

type DrinkingSessionOverviewProps = {
  sessionId: DrinkingSessionId;
  session: DrinkingSession;
  isEditModeOn: boolean;
};

export type {DrinkingSessionOverviewProps};
