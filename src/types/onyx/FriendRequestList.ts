import CONST from '@src/CONST';
import {ValueOf} from 'type-fest';
import {UserId} from './DatabaseCommon';

type FriendRequestStatus = ValueOf<(typeof CONST)['FRIEND_REQUEST_STATUS']>;

type FriendRequestList = Record<UserId, FriendRequestStatus>;

type FriendRequestArray = Array<FriendRequestStatus>;

export default FriendRequestList;
export type {FriendRequestStatus, FriendRequestArray};
