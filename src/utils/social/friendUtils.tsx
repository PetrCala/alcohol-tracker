import {readDataOnce} from '@database/baseFunctions';
import {FriendsData} from '@src/types/database';
import {Database} from 'firebase/database';

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
  user1Friends: FriendsData | null,
  user2Friends: FriendsData | null,
): string[] {
  let commonFriends: string[] = [];
  if (!user1Friends || !user2Friends) {
    return commonFriends;
  }
  const user1FriendIds: string[] = Object.keys(user1Friends);
  commonFriends = Object.keys(user2Friends).filter(friendId =>
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
  user1Friends: FriendsData | null,
  user2Friends: FriendsData | null,
): number {
  return getCommonFriends(user1Friends, user2Friends).length;
}
