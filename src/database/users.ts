import type {Database} from 'firebase/database';
import {update, ref, get} from 'firebase/database';
import type {
  DrinkingSessionList,
  FriendRequestList,
  Preferences,
  Profile,
  ReasonForLeaving,
  ReasonForLeavingId,
  UserPrivateData,
  UserProps,
  UserStatus,
} from '@src/types/onyx';
import type {UserList} from '@src/types/onyx/OnyxCommon';
import type {Auth, User, UserCredential} from 'firebase/auth';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
  updateEmail as fbUpdateEmail,
  verifyBeforeUpdateEmail,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import StringUtils from '@libs/StringUtils';
import {getUniqueId} from 'react-native-device-info';
import {Alert} from 'react-native';
import {cleanStringForFirebaseKey} from '../libs/StringUtilsKiroku';
import DBPATHS from './DBPATHS';
import {readDataOnce} from './baseFunctions';
import {getLastStartedSessionId} from '@libs/DataHandling';
import _ from 'lodash';
import * as Session from '@userActions/Session';
import {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import {validateAppVersion, ValidationResult} from '@libs/Validation';
import {checkAccountCreationLimit} from './protection';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import CONST from '@src/CONST';
import {getReasonForLeavingID} from '@libs/ReasonForLeaving';

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
  const userRole = 'open_beta_user';
  const timezone: Timezone = {
    selected: Intl.DateTimeFormat().resolvedOptions()
      .timeZone as SelectedTimezone,
    automatic: true,
  };
  const defaultPrivateData: UserPrivateData = {
    timezone: timezone,
  };
  return {
    profile: profileData,
    role: userRole,
    private_data: defaultPrivateData,
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
 * @param userID - User ID of the user to check.
 * @returns {Promise<boolean>} - Returns true if the user exists, false otherwise.
 */
async function userExistsInDatabase(
  db: Database,
  userID: string,
): Promise<boolean> {
  const profilePath = DBPATHS.USERS_USER_ID_PROFILE.getRoute(userID);
  const dbRef = ref(db, profilePath);
  const snapshot = await get(dbRef);
  return snapshot.exists();
}

/** In the database, create base info for a user. This will
 * be stored under the "users" object in the database.
 *
 * @param db The firebase realtime database object
 * @param userID The user ID
 * @param profileData Profile data of the user to create
 * @returns {Promise<void>}
 */
async function pushNewUserInfo(
  db: Database,
  userID: string,
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

  const updates: Record<
    string,
    UserProps | Preferences | string | number | any
  > = {};
  updates[accountCreationsRef.getRoute(deviceId, userID)] = Date.now();
  updates[nicknameRef.getRoute(nicknameKey, userID)] = userNickname;
  updates[userStatusRef.getRoute(userID)] = getDefaultUserStatus();
  updates[userPreferencesRef.getRoute(userID)] = getDefaultPreferences();
  updates[userRef.getRoute(userID)] = getDefaultUserData(profileData);

  await update(ref(db), updates);
}

/** Delete all user info from the realtime database, including their
 * user information, drinking sessions, etc.
 *
 *
 * @param db The firebase database object;
 * @param userID The user ID
 * @param userNickname The user nickname
 * @param friends The user's friends
 * @param friendRequests The user's friend requests
 * @param reasonForLeaving The reason for leaving
 * @returns {Promise<void>}
 */
async function deleteUserData(
  db: Database,
  userID: string,
  userNickname: string,
  friends: UserList | undefined,
  friendRequests: FriendRequestList | undefined,
  reasonForLeaving?: ReasonForLeaving,
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
  const reasonForLeavingRef = DBPATHS.REASONS_FOR_LEAVING_REASON_ID;

  const updates: Record<string, null | false | ReasonForLeaving> = {};
  updates[nicknameRef.getRoute(nicknameKey, userID)] = null;
  updates[userStatusRef.getRoute(userID)] = null;
  updates[userPreferencesRef.getRoute(userID)] = null;
  updates[userRef.getRoute(userID)] = null;
  updates[drinkingSessionsRef.getRoute(userID)] = null;
  updates[unconfirmedDaysRef.getRoute(userID)] = null;

  if (reasonForLeaving) {
    const reasonID: ReasonForLeavingId = getReasonForLeavingID(userID);
    updates[reasonForLeavingRef.getRoute(reasonID)] = reasonForLeaving;
  }

  // Data stored in other users' nodes
  if (friends) {
    Object.keys(friends).forEach(friendId => {
      updates[friendsRef.getRoute(friendId, userID)] = null;
    });
  }
  if (friendRequests) {
    Object.keys(friendRequests).forEach(friendRequestId => {
      updates[friendRequestsRef.getRoute(friendRequestId, userID)] = null;
    });
  }
  await update(ref(db), updates);
}

async function synchronizeUserStatus(
  db: Database,
  userID: string,
  currentUserStatus: UserStatus | undefined,
  drinkingSessions: DrinkingSessionList | undefined,
): Promise<void> {
  if (!currentUserStatus) {
    return;
  }
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
  const updates: Record<string, UserStatus> = {};
  updates[userStatusRef.getRoute(userID)] = newUserStatus;
  await update(ref(db), updates);
}

/**
 * Send an email to the user with a link to update their email.
 *
 * @param user The user to send the email to
 * @param newEmail The new email
 */
async function sendUpdateEmailLink(
  user: User | null,
  newEmail: string,
): Promise<void> {
  if (!user) {
    throw new Error('User is null');
  }
  await verifyBeforeUpdateEmail(user, newEmail);
}

/**
 * Update the email for a user.
 *
 * @param user The user to update the email for
 * @param newEmail The new email
 */
async function updateEmail(user: User | null, newEmail: string): Promise<void> {
  if (!user) {
    throw new Error('User is null');
  }
  await fbUpdateEmail(user, newEmail);
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
  const result = await reauthenticateWithCredential(user, credential);
  return result;
}

/**
 * Change a display name for a user both in the realtime database,
 *  and in the authentication system.
 *
 * @param db Database to change the display name in
 * @param user User to change the display name for
 * @param oldDisplayName The old display name
 * @param newDisplayName The new display name
 * @returns An empty promise
 */
async function changeDisplayName(
  db: Database,
  user: User | null,
  oldDisplayName: string | undefined,
  newDisplayName: string,
): Promise<void> {
  if (!user) {
    throw new Error('User is null');
  }
  if (!oldDisplayName) {
    throw new Error(
      'Could not identify the old display name. Try reloading the app.',
    );
  }
  const userID = user.uid;
  const oldNicknameKey = cleanStringForFirebaseKey(oldDisplayName);
  const nicknameKey = cleanStringForFirebaseKey(newDisplayName);
  const nicknameRef = DBPATHS.NICKNAME_TO_ID_NICKNAME_KEY_USER_ID;
  const displayNameRef = DBPATHS.USERS_USER_ID_PROFILE_DISPLAY_NAME;

  const currentDisplayName = await readDataOnce(
    db,
    displayNameRef.getRoute(userID),
  );
  if (currentDisplayName === newDisplayName) {
    return;
  }

  const updates: Record<string, string | null> = {};
  updates[nicknameRef.getRoute(oldNicknameKey, userID)] = null;
  updates[nicknameRef.getRoute(nicknameKey, userID)] = newDisplayName;
  updates[displayNameRef.getRoute(userID)] = newDisplayName;

  // TODO possibly rewrite these into a transaction
  await update(ref(db), updates);
  await updateProfile(user, {displayName: newDisplayName});
}

/**
 * Change a user name for a user.
 *
 * @param db Database to change the display name in
 * @param user User to change the display name for
 * @param firstName The new first name
 * @param lastName The new last name
 * @returns An empty promise
 */
async function changeUserName(
  db: Database,
  user: User | null,
  firstName: string,
  lastName: string,
): Promise<void> {
  if (!user) {
    throw new Error('User is null');
  }

  const userID = user.uid;
  const firstNameRef = DBPATHS.USERS_USER_ID_PROFILE_FIRST_NAME;
  const lastNameRef = DBPATHS.USERS_USER_ID_PROFILE_LAST_NAME;

  const updates: Record<string, string> = {};
  updates[firstNameRef.getRoute(userID)] = firstName;
  updates[lastNameRef.getRoute(userID)] = lastName;

  await update(ref(db), updates);
}

/**
 * Change a user's automatic timezone setting.
 *
 * @param db Database to change the display name in
 * @param user User to change the display name for
 * @param isAutomatic Whether the timezone is automatic
 * @param newTimezone A new timezone
 * @returns An empty promise
 */
async function updateAutomaticTimezone(
  db: Database,
  user: User | null,
  isAutomatic: boolean,
  selectedTimezone: SelectedTimezone,
): Promise<void> {
  if (!user) {
    throw new Error('User is null');
  }

  const userID = user.uid;
  const timezoneRef = DBPATHS.USERS_USER_ID_PRIVATE_DATA_TIMEZONE;

  const newData: Timezone = {
    selected: selectedTimezone,
    automatic: isAutomatic,
  };

  const updates: Record<string, Timezone> = {};
  updates[timezoneRef.getRoute(userID)] = newData;

  await update(ref(db), updates);
}

/**
 * Change a user's selected timezone
 *
 * @param db Database to change the display name in
 * @param user User to change the display name for
 * @param selectedTimezone The selected timezone
 * @returns An empty promise
 */
async function saveSelectedTimezone(
  db: Database,
  user: User | null,
  selectedTimezone: SelectedTimezone,
): Promise<void> {
  if (!user) {
    throw new Error('User is null');
  }

  const userID = user.uid;
  const timezoneRef = DBPATHS.USERS_USER_ID_PRIVATE_DATA_TIMEZONE_SELECTED;

  const updates: Record<string, SelectedTimezone> = {};
  updates[timezoneRef.getRoute(userID)] = selectedTimezone;

  await update(ref(db), updates);
}

/** Attempt to log in to the Firebase authentication service with a user's credentials
 *
 * @param auth The Firebase authentication object
 * @param email The user's email
 * @param password The user's password
 */
async function logIn(
  auth: Auth,
  email: string,
  password: string,
): Promise<void> {
  // Stash the credentials in case the log in fails
  Onyx.merge(ONYXKEYS.LOGIN, {
    email: email,
    password: password,
  });
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign up a user to the authentication service using an email and a password
 *
 * @param db The Firebase database object
 * @param auth The Firebase authentication object
 * @param email The new user's email
 * @param username The new user's username
 * @param password The new user's password
 */
async function signUp(
  db: Database,
  auth: Auth,
  email: string,
  username: string,
  password: string,
): Promise<void> {
  // Stash the login credentials in case the request fails
  Onyx.merge(ONYXKEYS.LOGIN, {
    email: email,
    username: username,
    password: password,
    passwordConfirm: password,
  });

  let newUserID: string | undefined;
  let minSupportedVersion: string | null;
  const minUserCreationPath =
    DBPATHS.CONFIG_APP_SETTINGS_MIN_USER_CREATION_POSSIBLE_VERSION;

  minSupportedVersion = await readDataOnce(db, minUserCreationPath);

  if (!minSupportedVersion) {
    throw new Error('database/data-fetch-failed');
  }

  if (!validateAppVersion(minSupportedVersion).success) {
    throw new Error('database/outdated-app-version');
  }

  // Validate that the user is not spamming account creation
  const isWithinCreationLimit = await checkAccountCreationLimit(db);
  if (!isWithinCreationLimit) {
    throw new Error('database/account-creation-limit-exceeded');
  }

  // Pushing initial user data to Realtime Database
  const newProfileData: Profile = {
    display_name: username,
    photo_url: '',
  };

  // Create the user in the Firebase authentication
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const newUser = userCredential.user;
  newUserID = newUser.uid;

  try {
    // Realtime Database updates
    await pushNewUserInfo(db, newUserID, newProfileData);

    // Update Firebase authentication
    await updateProfile(newUser, {displayName: username});

    Session.clearSignInData();

    Navigation.navigate(ROUTES.HOME);
  } catch (error: any) {
    // Attempt to rollback the changes if the 'transaction' fails
    await deleteUserData(
      db,
      newUserID,
      newProfileData.display_name,
      undefined,
      undefined,
    );

    // Delete the user from Firebase authentication
    await newUser.delete();
    throw new Error('User creation failed', error.message);
  }
}

export {
  changeDisplayName,
  changeUserName,
  deleteUserData,
  getDefaultPreferences,
  getDefaultUserData,
  getDefaultUserStatus,
  pushNewUserInfo,
  reauthentificateUser,
  saveSelectedTimezone,
  sendUpdateEmailLink,
  synchronizeUserStatus,
  updateAutomaticTimezone,
  updateEmail,
  userExistsInDatabase,
  logIn,
  signUp,
};
