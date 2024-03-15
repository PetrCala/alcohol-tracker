import {Database, update, ref, get} from 'firebase/database';
import {
  FriendList,
  FriendRequestList,
  Preferences,
  Profile,
  UserProps,
} from '@src/types/database';
import {
  EmailAuthProvider,
  User,
  UserCredential,
  reauthenticateWithCredential,
} from 'firebase/auth';
import {Alert} from 'react-native';
import {cleanStringForFirebaseKey} from '../libs/StringUtils';
import CONST from '@src/CONST';
import DBPATHS from './DBPATHS';

export const getDefaultPreferences = (): Preferences => {
  return {
    first_day_of_week: 'Monday',
    units_to_colors: {
      orange: 10,
      yellow: 5,
    },
    drinks_to_units: {
      small_beer: 0.5,
      beer: 1,
      cocktail: 1.5,
      other: 1,
      strong_shot: 1,
      weak_shot: 0.5,
      wine: 1,
    },
  };
};

export const getDefaultUserData = (profileData: Profile): UserProps => {
  let userRole = 'user';
  return {
    profile: profileData,
    role: userRole,
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
  const profilePath = DBPATHS.USERS_USER_ID_PROFILE.getRoute(userId);
  const dbRef = ref(db, profilePath);
  const snapshot = await get(dbRef);
  return snapshot.exists();
}

/** In the database, create base info for a user. This will
 * be stored under the "users" object in the database.
 *
 * @param db The firebase realtime database object
 * @param userId The user ID
 * @param profileData Profile data of the user to create
 * @returns {Promise<void>}
 */
export async function pushNewUserInfo(
  db: Database,
  userId: string,
  profileData: Profile,
): Promise<void> {
  const userNickname = profileData.display_name;
  const nicknameKey = cleanStringForFirebaseKey(userNickname);
  // Allowed types

  const nicknameRef = DBPATHS.NICKNAME_TO_ID_NICKNAME_KEY_USER_ID;
  const userStatusRef = DBPATHS.USER_STATUS_USER_ID;
  const userPreferencesRef = DBPATHS.USER_PREFERENCES_USER_ID;
  const userRef = DBPATHS.USERS_USER_ID;

  let updates: {
    [key: string]: UserProps | Preferences | string | any;
  } = {};
  updates[nicknameRef.getRoute(nicknameKey, userId)] = userNickname;
  updates[userStatusRef.getRoute(userId)] = getDefaultUserStatus();
  updates[userPreferencesRef.getRoute(userId)] = getDefaultPreferences();
  updates[userRef.getRoute(userId)] = getDefaultUserData(profileData);

  await update(ref(db), updates);
}

/** Delete all user info from the realtime database, including their
 * user information, drinking sessions, etc.
 *
 *
 * @param db The firebase database object;
 * @param userId The user ID
 * @param userNickname The user nickname
 * @returns {Promise<void>}
 */
export async function deleteUserData(
  db: Database,
  userId: string,
  userNickname: string,
  friends: FriendList | undefined,
  friendRequests: FriendRequestList | undefined,
): Promise<void> {
  const nicknameKey = cleanStringForFirebaseKey(userNickname);

  const nicknameRef = DBPATHS.NICKNAME_TO_ID_NICKNAME_KEY_USER_ID;
  const userStatusRef = DBPATHS.USER_STATUS_USER_ID;
  const userPreferencesRef = DBPATHS.USER_PREFERENCES_USER_ID;
  const userRef = DBPATHS.USERS_USER_ID;
  const drinkingSessionsRef = DBPATHS.USER_DRINKING_SESSIONS_USER_ID;
  const unconfirmedDaysRef = DBPATHS.USER_UNCONFIRMED_DAYS_USER_ID;
  const friendsRef = DBPATHS.USERS_USER_ID_FRIENDS_FRIEND_ID;
  const friendRequestsRef = DBPATHS.USERS_USER_ID_FRIEND_REQUESTS_REQUEST_ID;

  let updates: {[key: string]: null | false} = {};
  updates[nicknameRef.getRoute(nicknameKey, userId)] = null;
  updates[userStatusRef.getRoute(userId)] = null;
  updates[userPreferencesRef.getRoute(userId)] = null;
  updates[userRef.getRoute(userId)] = null;
  updates[drinkingSessionsRef.getRoute(userId)] = null;
  updates[unconfirmedDaysRef.getRoute(userId)] = null;
  // Data stored in other users' nodes
  if (friends) {
    Object.keys(friends).forEach(friendId => {
      updates[friendsRef.getRoute(friendId, userId)] = null;
    });
  }
  if (friendRequests) {
    Object.keys(friendRequests).forEach(friendRequestId => {
      updates[friendRequestsRef.getRoute(friendRequestId, userId)] = null;
    });
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
  const lastOnlineRef = DBPATHS.USER_STATUS_USER_ID_LAST_ONLINE;
  let updates: {[key: string]: number} = {};
  updates[lastOnlineRef.getRoute(userId)] = lastOnline;
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
