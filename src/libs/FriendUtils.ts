import {readDataOnce} from '@database/baseFunctions';
import type {
  FriendRequestList,
  FriendRequestStatus,
  UserArray,
  UserList,
} from '@src/types/onyx';
import type {Database} from 'firebase/database';
import {isNonEmptyArray} from './Validation';
import CONST from '@src/CONST';
import DBPATHS from '@database/DBPATHS';

export async function fetchUserFriends(
  db: Database,
  userId: string,
): Promise<UserList | undefined> {
  return readDataOnce(db, DBPATHS.USERS_USER_ID_FRIENDS.getRoute(userId));
}

/**
 * Returns an array of common friends between two users.
 * @param user1Friends - The friends data of user 1.
 * @param user2Friends - The friends data of user 2.
 * @returns An array of common friends.
 */
export function getCommonFriends(
  user1FriendIds: UserArray,
  user2FriendIds: UserArray,
): UserArray {
  let commonFriends: UserArray = [];
  if (!isNonEmptyArray(user1FriendIds) && !isNonEmptyArray(user2FriendIds)) {
    return commonFriends;
  }
  commonFriends = user2FriendIds.filter(friendId =>
    user1FriendIds.includes(friendId),
  );
  return commonFriends;
}

/**
 * Calculates the number of common friends between two users.
 * @param user1Friends - The friends of user 1.
 * @param user2Friends - The friends of user 2.
 * @returns The number of common friends.
 */
export function getCommonFriendsCount(
  user1FriendIds: UserArray,
  user2FriendIds: UserArray,
): number {
  return getCommonFriends(user1FriendIds, user2FriendIds).length;
}

/**
 * Calculates the count of friend requests with a specific status.
 *
 * @param friendRequests - The friend requests object.
 * @param requestStatus - The status of the friend requests to count.
 * @returns The count of friend requests with the specified status.
 */
const getFriendRequestsCount = (
  friendRequests: FriendRequestList   | undefined,
  requestStatus: FriendRequestStatus,
): number => {
  if (!friendRequests) {return 0;}

  return Object.keys(friendRequests).reduce((acc, requestId) => {
    return acc + (friendRequests[requestId] === requestStatus ? 1 : 0);
  }, 0);
};

export const getReceivedRequestsCount = (
  friendRequests: FriendRequestList   | undefined,
): number => {
  const status: FriendRequestStatus = CONST.FRIEND_REQUEST_STATUS.RECEIVED;
  return getFriendRequestsCount(friendRequests, status);
};

export const getSentRequestsCount = (
  friendRequests: FriendRequestList   | undefined,
): number => {
  const status: FriendRequestStatus = CONST.FRIEND_REQUEST_STATUS.SENT;
  return getFriendRequestsCount(friendRequests, status);
};
