import type CONST from '@src/CONST';
import type {ValueOf} from 'type-fest';
import type {UserID} from './OnyxCommon';

type FriendRequestStatus = ValueOf<(typeof CONST)['FRIEND_REQUEST_STATUS']>;

type FriendRequestList = Record<UserID, FriendRequestStatus>;

type FriendRequestArray = FriendRequestStatus[];

export default FriendRequestList;
export type {FriendRequestStatus, FriendRequestArray};
