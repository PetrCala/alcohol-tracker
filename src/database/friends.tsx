import { Database, ref, get, push, child, set, update } from "firebase/database";
import { FriendRequestData } from "../types/database";
import { Alert } from "react-native";
import { userExistsInDatabase } from "./users";

/**
 * Check if userB is in userA's friend list.
 * 
 * @param {Database} db - The database object against which to validate this conditio
 * @param {string} userA - User ID of the authenticated user.
 * @param {string} userB - User ID of the friend being checked.
 * @returns {Promise<boolean>} - Returns true if userB is a friend of userA, otherwise false.
 */
export async function isFriend(db:Database, userA:string, userB:string):Promise<boolean> {
  const dbRef = ref(db, `/users/${userA}/friends/${userB}`)
  const snapshot = await get(dbRef);
  return snapshot.exists();
};

/**
 * Send a friend request from one user to another using
 * their database IDs.
 * 
 * @param {Database} db Firebase Database object.
 * @param {string} userFrom ID of the user that sends
 *  the request.
 * @param {string} userTo ID of the user to whom the
 *  request is being sent to. Also serves as the request ID.
 * @returns {Promise<void|null>} Returns null in case
 *  the database save fails.
 * @throws {Alert} In case the database fails to
 *  save the data.
 */
export async function sendFriendRequest(
  db:Database,
  userFrom: string,
  userTo: string,
):Promise<void|null> {
  try {
    // Assume the userFrom always exists
    const userToExists = await userExistsInDatabase(db, userTo);
    if (!userToExists) {
      Alert.alert("User does not exist", "The user " + userTo + "does not exist in the database.")
      return;
    };
    var updates: { [requestId: string]: string } = {};
    updates[`users/${userFrom}/friend_requests/${userTo}`] = "sent";
    updates[`users/${userTo}/friend_requests/${userFrom}`] = "received";
    await update(ref(db), updates);
  } catch (error:any) {
    Alert.alert("Friend request failed", "Failed to send a friend request to user " + userTo + ": " + error.message);
    return;
  };
};

export async function acceptFriendRequest(
  db:Database,
  userFrom: string,
  userTo: string,
) {
  var updates: { [requestId: string]: string|boolean|null } = {};
  try {
    const userToExists = await userExistsInDatabase(db, userTo);
    if (!userToExists) {
      // Case user does not exist
      updates[`users/${userFrom}/friend_requests/${userTo}`] = null; // Delete the request
      try {
        await update(ref(db), updates);
      } catch (error:any) {
        Alert.alert("User does not", "The user " + userTo + "does not exist in the database. This friend request has been deleted")
      } finally {return};
    };
    // Case user exists 
    updates[`users/${userFrom}/friend_requests/${userTo}`] = "accepted";
    updates[`users/${userTo}/friend_requests/${userFrom}`] = "accepted";
    updates[`users/${userFrom}/friends/${userTo}`] = true;
    updates[`users/${userTo}/friends/${userFrom}`] = true;
    await update(ref(db), updates);
  } catch (error:any) {
    Alert.alert("Failed to accept the request", "Could not accept the friend request from user " + userTo + ": " + error.message);
    return;
  };
};