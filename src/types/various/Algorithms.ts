import {UserId} from '../database';

type UserPriority = number;

type UserPriorityList = Record<UserId, UserPriority>;

export type {UserPriority, UserPriorityList};
