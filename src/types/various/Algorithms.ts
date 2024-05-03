import type {UserID} from '../onyx';

type UserPriority = number;

type UserPriorityList = Record<UserID, UserPriority>;

export type {UserPriority, UserPriorityList};
