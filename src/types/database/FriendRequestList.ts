import CONST from '@src/CONST';
import {ValueOf} from 'type-fest';

type FriendRequestStatus = ValueOf<(typeof CONST)['FRIEND_REQUEST_STATUS']>;

type FriendRequestId = string;

type FriendRequestList = Record<FriendRequestId, FriendRequestStatus>;

type FriendRequestArray = Array<FriendRequestStatus>;

export default FriendRequestList;
export type {FriendRequestStatus, FriendRequestId, FriendRequestArray};
