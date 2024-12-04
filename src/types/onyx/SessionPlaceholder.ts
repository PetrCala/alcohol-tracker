import type {UserID} from './OnyxCommon';
import type DrinkingSession from './DrinkingSession';

/**
 *
 */
type SessionPlaceholder = DrinkingSession;

/**
 *
 */
type SessionPlaceholderList = Record<UserID, SessionPlaceholder>;

export default SessionPlaceholder;
export type {SessionPlaceholderList};
