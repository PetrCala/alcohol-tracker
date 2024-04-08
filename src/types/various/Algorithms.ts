import {UserId} from '../onyx';

type UserPriority = number;

type UserPriorityList = Record<UserId, UserPriority>;

export type {UserPriority, UserPriorityList};
