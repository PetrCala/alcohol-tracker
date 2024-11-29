import {DrinkingSessionId, DrinkingSessionType} from './DrinkingSession';

/** Model of user start session action */
type StartSession = {
  /** The type of session to create */
  sessionType?: DrinkingSessionType;

  /** ID of the session to create */
  sessionId?: DrinkingSessionId;

  /** True if it is the first session we store for this user **/
  isFirstSession?: boolean;
};

export default StartSession;
