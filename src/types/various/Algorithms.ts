import type {UserID} from '@src/types/onyx/OnyxCommon';

type UserPriority = number;

type UserPriorityList = Record<UserID, UserPriority>;

export type {UserPriority, UserPriorityList};
