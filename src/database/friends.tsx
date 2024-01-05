import {Database, ref, get, push, child, set, update} from 'firebase/database';
import {Alert} from 'react-native';
import {userExistsInDatabase} from './users';

/**
 * Check if userB is in userA's friend list.
 *
 * @param {Database} db - The database object against which to validate this conditio
 * @param {string} userA - User ID of the authenticated user.
 * @param {string} userB - User ID of the friend being checked.
 * @returns {Promise<boolean>} - Returns true if userB is a friend of userA, otherwise false.
 */
export async function isFriend(
  db: Database,
  userA: string,
  userB: string,
): Promise<boolean> {
  const dbRef = ref(db, `/users/${userA}/friends/${userB}`);
  const snapshot = await get(dbRef);
  return snapshot.exists();
}

/**
 * Send a friend request from one user to another using
 * their database IDs.
 *
 * @param {Database} db Firebase Database object.
 * @param {string} userFrom ID of the user that sends
 *  the request.
 * @param {string} userTo ID of the user to whom the
 *  request is being sent to. Also serves as the request ID.
 * @returns {Promise<void>}
 * @throws {Alert} In case the database fails to
 *  save the data.
 */
export async function sendFriendRequest(
  db: Database,
  userFrom: string,
  userTo: string,
): Promise<void> {
  // Assume the userFrom always exists
  const userToExists = await userExistsInDatabase(db, userTo);
  if (!userToExists) {
    Alert.alert(
      'User does not exist',
      'The user ' + userTo + 'does not exist in the database.',
    );
    return;
  }
  var updates: {[requestId: string]: string} = {};
  updates[`users/${userFrom}/friend_requests/${userTo}`] = 'sent';
  updates[`users/${userTo}/friend_requests/${userFrom}`] = 'received';
  await update(ref(db), updates);
}

/**
 * Remove from the database friend request data that existed between two users.
 *
 * @param {Database} db Firebase Database object.
 * @param {string} userFrom ID of user 1.
 * @param {string} userTo ID of user 2.
 * @returns {Promise<void>}
 * @throws {Alert} In case the database fails to
 *  save the data.
 */
export async function deleteFriendRequest(
  db: Database,
  userFrom: string,
  userTo: string,
): Promise<void> {
  var updates: {[requestId: string]: null} = {};
  updates[`users/${userFrom}/friend_requests/${userTo}`] = null;
  const userToExists = await userExistsInDatabase(db, userTo);
  if (userToExists) {
    updates[`users/${userTo}/friend_requests/${userFrom}`] = null;
  }
  await update(ref(db), updates);
}

/**
 * Accept a friend request sent from another user.
 *
 * @param {Database} db Firebase Database object.
 * @param {string} userFrom ID of the user that is accepting the request
 * @param {string} userTo ID of the user that sent the request.
 * @returns {Promise<void>}
 * @throws {Alert} In case the database fails to
 *  save the data.
 */
export async function acceptFriendRequest(
  db: Database,
  userFrom: string,
  userTo: string,
): Promise<void> {
  var updates: {[requestId: string]: string | boolean | null} = {};
  updates[`users/${userFrom}/friends/${userTo}`] = true;
  const userToExists = await userExistsInDatabase(db, userTo);
  if (!userToExists) {
    updates[`users/${userTo}/friends/${userFrom}`] = true;
  }
  await update(ref(db), updates);
  await deleteFriendRequest(db, userFrom, userTo); // Clean up the friend request data
}

/**
 * Remove from the database friend status data that existed between two users.
 *
 * @param {Database} db Firebase Database object.
 * @param {string} userFrom ID of user 1.
 * @param {string} userTo ID of user 2.
 * @returns {Promise<void>}
 * @throws {Alert} In case the database fails to save the data.
 */
export async function unfriend(
  db: Database,
  userFrom: string,
  userTo: string,
): Promise<void> {
  var updates: {[userId: string]: null} = {};
  updates[`users/${userFrom}/friends/${userTo}`] = null;
  const userToExists = await userExistsInDatabase(db, userTo);
  if (userToExists) {
    updates[`users/${userTo}/friends/${userFrom}`] = null;
  }
  await update(ref(db), updates);
}
