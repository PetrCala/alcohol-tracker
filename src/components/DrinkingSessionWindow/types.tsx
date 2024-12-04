import type {OnyxKey} from '@src/ONYXKEYS';
import type {
  DrinkingSession,
  DrinkingSessionId,
  DrinkingSessionType,
} from '@src/types/onyx';

type DrinkingSessionWindowProps = {
  /** The session id */
  sessionId: DrinkingSessionId;

  /** The session data object to show */
  session: DrinkingSession;

  /** The onyx key under which the session data is stored */
  onyxKey: OnyxKey;

  /** Type of the drinking session */
  type: DrinkingSessionType;
};

export type {DrinkingSessionWindowProps};
