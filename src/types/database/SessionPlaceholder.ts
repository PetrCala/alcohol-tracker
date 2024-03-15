import {UserId} from './DatabaseCommon';
import DrinkingSession from './DrinkingSession';

type SessionPlaceholder = DrinkingSession;

type SessionPlaceholderList = Record<UserId, SessionPlaceholder>;

export default SessionPlaceholder;
export type {SessionPlaceholderList};
