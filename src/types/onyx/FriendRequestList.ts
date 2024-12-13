import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {UserID} from './OnyxCommon';

/** A friend request status value */
type FriendRequestStatus = DeepValueOf<typeof CONST.FRIEND_REQUEST_STATUS>;

/** A mapping of user IDs to friend request statuses */
type FriendRequestList = Record<UserID, FriendRequestStatus>;

/** An array of friend request statuses */
type FriendRequestArray = FriendRequestStatus[];

export default FriendRequestList;
export type {FriendRequestStatus, FriendRequestArray};
