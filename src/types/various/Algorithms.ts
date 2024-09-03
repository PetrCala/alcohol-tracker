import type {UserID} from '../onyx/OnyxCommon';

type UserPriority = number;

type UserPriorityList = Record<UserID, UserPriority>;

export type {UserPriority, UserPriorityList};
