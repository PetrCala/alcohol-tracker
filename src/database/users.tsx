import {Database, update, ref, get} from 'firebase/database';
import {
  PreferencesData,
  UserData,
  ProfileData,
  NicknameToIdData,
  FriendsData,
  FriendRequestData,
} from '../types/database';
import {
  EmailAuthProvider,
  User,
  UserCredential,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {Alert} from 'react-native';
import {cleanStringForFirebaseKey} from '../utils/strings';
import CONST from '@src/CONST';

export const getDefaultPreferences = (): PreferencesData => {
  return {
    first_day_of_week: 'Monday',
    units_to_colors: {
      orange: 10,
      yellow: 5,
    },
    units_to_points: {
      beer: 1,
      cocktail: 1.5,
      other: 1,
      strong_shot: 1,
      weak_shot: 0.5,
      wine: 1,
    },
  };
};

export const getDefaultUserData = (
  profileData: ProfileData,
  betaKeyId: number, // Beta feature
): UserData => {
  let userRole = CONST.APP_IN_BETA ? 'beta_user' : 'user'; // Beta feature
  return {
    profile: profileData,
    role: userRole,
    beta_key_id: betaKeyId, // Beta feature
  };
};

export const getDefaultUserStatus = (): {last_online: number} => {
  return {
    last_online: new Date().getTime(),
  };
};

/**
 * Check if a user exists in the realtime database.
 *
 * @param db - The database object against which to validate this conditio
 * @param userId - User ID of the user to check.
 * @returns {Promise<boolean>} - Returns true if the user exists, false otherwise.
 */
export async function userExistsInDatabase(
  db: Database,
  userId: string,
): Promise<boolean> {
  const dbRef = ref(db, `/users/${userId}/profile`);
  const snapshot = await get(dbRef);
  return snapshot.exists();
}

/** In the database, create base info for a user. This will
 * be stored under the "users" object in the database.
 *
 * @param db The firebase realtime database object
 * @param userId The user ID
 * @param profileData Profile data of the user to create
 * @param betaKeyId Beta key // Beta feature
 * @returns {Promise<void>}
 */
export async function pushNewUserInfo(
  db: Database,
  userId: string,
  profileData: ProfileData,
  betaKeyId: number, // Beta feature
): Promise<void> {
  const userNickname = profileData.display_name;
  const nicknameKey = cleanStringForFirebaseKey(userNickname);
  // Allowed types
  let updates: {
    [key: string]: UserData | PreferencesData | NicknameToIdData | any;
  } = {};
  // Nickname to ID
  updates[`nickname_to_id/${nicknameKey}/${userId}`] = userNickname;
  // User Status
  updates[`user_status/${userId}`] = getDefaultUserStatus();
  // User preferences
  updates[`user_preferences/${userId}`] = getDefaultPreferences();
  // Users
  updates[`users/${userId}`] = getDefaultUserData(profileData, betaKeyId);
  // Beta feature
  updates[`beta_keys/${betaKeyId}/in_usage`] = true;
  updates[`beta_keys/${betaKeyId}/user_id`] = userId;
  await update(ref(db), updates);
}

/** Delete all user info from the realtime database, including their
 * user information, drinking sessions, etc.
 *
 *
 * @param db The firebase database object;
 * @param userId The user ID
 * @param userNickname The user nickname
 * @param betaKeyId Beta key // Beta feature
 * @returns {Promise<void>}
 */
export async function deleteUserData(
  db: Database,
  userId: string,
  userNickname: string,
  betaKeyId: number | undefined, // Beta feature
  friends: FriendsData | undefined,
  friendRequests: FriendRequestData | undefined,
): Promise<void> {
  const nicknameKey = cleanStringForFirebaseKey(userNickname);
  let updates: {[key: string]: null | false} = {};
  // Clean up friend requests
  updates[`nickname_to_id/${nicknameKey}/${userId}`] = null;
  updates[`users/${userId}`] = null;
  updates[`user_status/${userId}`] = null;
  updates[`user_preferences/${userId}`] = null;
  updates[`user_drinking_sessions/${userId}`] = null;
  updates[`user_unconfirmed_days/${userId}`] = null;
  // Data stored in other users' nodes
  if (friends) {
    Object.keys(friends).forEach(friendId => {
      updates[`users/${friendId}/friends/${userId}`] = null;
    });
  }
  if (friendRequests) {
    Object.keys(friendRequests).forEach(friendRequestId => {
      updates[`users/${friendRequestId}/friend_requests/${userId}`] = null;
    });
  }
  // Beta feature
  if (betaKeyId) {
    // Reset the beta key to a usable form
    updates[`beta_keys/${betaKeyId}/in_usage`] = false;
    updates[`beta_keys/${betaKeyId}/user_id`] = null;
  }
  await update(ref(db), updates);
}

/**
 * Update the timestamp denoting when a user has lsat
 * been seen online
 *
 * @param db Firebase database object.
 * @param userId ID of the user to update the data for
 * @return
 */
export async function updateUserLastOnline(
  db: Database,
  userId: string,
): Promise<void> {
  let lastOnline: number = new Date().getTime();
  let updates: {[key: string]: number} = {};
  updates[`user_status/${userId}/last_online`] = lastOnline;
  await update(ref(db), updates);
}

/** Reauthentificate a user using the User object and a password
 * Necessary before important operations such as deleting a user
 * or changing a password.
 *
 * Return a promise with the credentials if the reauthentification succeeds,
 * or with null if it does not.
 *
 * @param user User object from firebase
 * @param password Password to reauthentificate with
 * @returns {Promise<void|UserCredential>} Null if the user does not exist, otherwise the result of the authentification.
 */
export async function reauthentificateUser(
  user: User,
  password: string,
): Promise<void | UserCredential> {
  let email: string;
  if (user.email) {
    email = user.email;
  } else {
    Alert.alert('User email not found', 'This user has no email');
    return;
  }
  const credential = EmailAuthProvider.credential(email, password);
  var result = await reauthenticateWithCredential(user, credential);
  return result;
}
