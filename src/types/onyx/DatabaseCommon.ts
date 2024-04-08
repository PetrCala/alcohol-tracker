import {MaybePhraseKey} from '@libs/Localize';

type UserId = string;

type UserList = Record<UserId, boolean>;

type UserArray = Array<UserId>;

type MeasureType = 'drinks' | 'units';

type ErrorFields<TKey extends string = string> = Record<
  TKey,
  Errors | null | undefined
>;

type Errors = Record<string, MaybePhraseKey | null>;

export type {UserId, UserList, UserArray, MeasureType, ErrorFields, Errors};

// FriendArray, FriendId, FriendRequestId
