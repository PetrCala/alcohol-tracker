import type {UserID} from './OnyxCommon';
import type DrinkingSession from './DrinkingSession';

/** A placeholder for a drinking session */
type SessionPlaceholder = DrinkingSession;

/** A collection of sessionp laceholders */
type SessionPlaceholderList = Record<UserID, SessionPlaceholder>;

export default SessionPlaceholder;
export type {SessionPlaceholderList};
