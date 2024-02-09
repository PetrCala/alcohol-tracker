import {readDataOnce} from '@database/baseFunctions';
import {
  FriendRequestData,
  FriendRequestDisplayData,
  FriendRequestStatus,
  FriendsData,
} from '@src/types/database';
import {Database} from 'firebase/database';
import {isNonEmptyArray} from '../validation';

export async function fetchUserFriends(
  db: Database,
  userId: string,
): Promise<FriendsData | null> {
  return await readDataOnce(db, `users/${userId}/friends`);
}

/**
 * Returns an array of common friends between two users.
 * @param user1Friends - The friends data of user 1.
 * @param user2Friends - The friends data of user 2.
 * @returns An array of common friends.
 */
export function getCommonFriends(
  user1FriendIds: string[],
  user2FriendIds: string[],
): string[] {
  let commonFriends: string[] = [];
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
  user1FriendIds: string[],
  user2FriendIds: string[],
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
  friendRequests: FriendRequestDisplayData | FriendRequestData | undefined,
  requestStatus: FriendRequestStatus,
): number => {
  if (!friendRequests) return 0;

  return Object.keys(friendRequests).reduce((acc, requestId) => {
    return acc + (friendRequests[requestId] === requestStatus ? 1 : 0);
  }, 0);
};

export const getReceivedRequestsCount = (
  friendRequests: FriendRequestDisplayData | FriendRequestData | undefined,
): number => {
  const status: FriendRequestStatus = 'received';
  return getFriendRequestsCount(friendRequests, status);
};

export const getSentRequestsCount = (
  friendRequests: FriendRequestDisplayData | FriendRequestData | undefined,
): number => {
  const status: FriendRequestStatus = 'sent';
  return getFriendRequestsCount(friendRequests, status);
};
