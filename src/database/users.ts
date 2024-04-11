import {Database, update, ref, get} from 'firebase/database';
import {
  DrinkingSessionList,
  FriendRequestList,
  Preferences,
  Profile,
  UserList,
  UserProps,
  UserStatus,
} from '@src/types/onyx';
import {
  EmailAuthProvider,
  User,
  UserCredential,
  reauthenticateWithCredential,
  updateProfile,
} from 'firebase/auth';
import {getUniqueId} from 'react-native-device-info';
import {Alert} from 'react-native';
import {cleanStringForFirebaseKey} from '../libs/StringUtilsKiroku';
import DBPATHS from './DBPATHS';
import {readDataOnce} from './baseFunctions';
import {
  getLastStartedSession,
  getLastStartedSessionId,
} from '@libs/DataHandling';
import _ from 'lodash';

const getDefaultPreferences = (): Preferences => {
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

const getDefaultUserData = (profileData: Profile): UserProps => {
  let userRole = 'open_beta_user';
  return {
    profile: profileData,
    role: userRole,
  };
};

const getDefaultUserStatus = (): {last_online: number} => {
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
async function userExistsInDatabase(
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
async function pushNewUserInfo(
  db: Database,
  userId: string,
  profileData: Profile,
): Promise<void> {
  const userNickname = profileData.display_name;
  const nicknameKey = cleanStringForFirebaseKey(userNickname);
  // Allowed types
  const deviceId = await getUniqueId(); // Use a device identifier

  const accountCreationsRef = DBPATHS.ACCOUNT_CREATIONS_DEVICE_ID_USER_ID;
  const nicknameRef = DBPATHS.NICKNAME_TO_ID_NICKNAME_KEY_USER_ID;
  const userStatusRef = DBPATHS.USER_STATUS_USER_ID;
  const userPreferencesRef = DBPATHS.USER_PREFERENCES_USER_ID;
  const userRef = DBPATHS.USERS_USER_ID;

  let updates: {
    [key: string]: UserProps | Preferences | string | number | any;
  } = {};
  updates[accountCreationsRef.getRoute(deviceId, userId)] = Date.now();
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
async function deleteUserData(
  db: Database,
  userId: string,
  userNickname: string,
  friends: UserList | undefined,
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

async function synchronizeUserStatus(
  db: Database,
  userId: string,
  currentUserStatus: UserStatus | undefined,
  drinkingSessions: DrinkingSessionList | undefined,
): Promise<void> {
  if (!currentUserStatus) return;
  const newUserStatus: UserStatus = currentUserStatus;
  newUserStatus.last_online = new Date().getTime();
  const latestSessionId = getLastStartedSessionId(drinkingSessions);
  if (newUserStatus.latest_session_id !== latestSessionId) {
    newUserStatus.latest_session = latestSessionId
      ? _.get(drinkingSessions, latestSessionId, undefined)
      : undefined;
    newUserStatus.latest_session_id = latestSessionId;
  }
  const userStatusRef = DBPATHS.USER_STATUS_USER_ID;
  let updates: {[key: string]: UserStatus} = {};
  updates[userStatusRef.getRoute(userId)] = newUserStatus;
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
async function reauthentificateUser(
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

/**
 * Change a display name for a user both in the realtime database,
 *  and in the authentication system.
 *
 * @param db Database to change the display name in
 * @param user User to change the display name for
 * @param newDisplayName The new display name
 * @returns An empty promise
 */
async function changeDisplayName(
  db: Database,
  user: User | null,
  newDisplayName: string,
): Promise<void> {
  if (!user) {
    throw new Error('User is null');
  }
  const userId = user.uid;
  const nicknameKey = cleanStringForFirebaseKey(newDisplayName);
  const nicknameRef = DBPATHS.NICKNAME_TO_ID_NICKNAME_KEY_USER_ID;
  const displayNameRef = DBPATHS.USERS_USER_ID_PROFILE_DISPLAY_NAME;

  const currentDisplayName = await readDataOnce(
    db,
    displayNameRef.getRoute(userId),
  );
  if (currentDisplayName === newDisplayName) {
    return;
  }

  let updates: {[key: string]: string} = {};
  updates[nicknameRef.getRoute(nicknameKey, userId)] = newDisplayName;
  updates[displayNameRef.getRoute(userId)] = newDisplayName;
  // TODO possibly rewrite these into a transaction
  await update(ref(db), updates);
  await updateProfile(user, {displayName: newDisplayName});
  return;
}

export {
  getDefaultPreferences,
  getDefaultUserData,
  getDefaultUserStatus,
  userExistsInDatabase,
  pushNewUserInfo,
  deleteUserData,
  synchronizeUserStatus,
  reauthentificateUser,
  changeDisplayName,
};
