import type {UserId} from './DatabaseCommon';
import type DrinkingSession from './DrinkingSession';

type SessionPlaceholder = DrinkingSession;

type SessionPlaceholderList = Record<UserId, SessionPlaceholder>;

export default SessionPlaceholder;
export type {SessionPlaceholderList};
