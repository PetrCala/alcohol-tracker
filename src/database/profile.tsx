import {Database, ref, update} from 'firebase/database';
import {
  FirebaseStorage,
  ref as StorageRef,
  getDownloadURL,
} from 'firebase/storage';
import {Auth, User, updateProfile} from 'firebase/auth';
import {fetchDisplayDataForUsers} from './baseFunctions';
import {ProfileList, UserStatusList} from '@src/types/database';
import DBPATHS from './DBPATHS';

export async function fetchUserProfiles(
  db: Database,
  userIds: string[],
): Promise<ProfileList> {
  const profileRef = 'users/{userId}/profile';
  return (await fetchDisplayDataForUsers(
    db,
    userIds,
    profileRef,
  )) as ProfileList;
}

export async function fetchUserStatuses(
  db: Database,
  userIds: string[],
): Promise<UserStatusList> {
  const profileRef = 'user_status/{userId}';
  return (await fetchDisplayDataForUsers(
    db,
    userIds,
    profileRef,
  )) as UserStatusList;
}

/**
 * Using the Firebase realtime database instance, the user UID, and the full name of the
 * profile picture path, set the name of the file to a new path.
 *
 * @description
 * Should be called together with uploading of the picture to the storage.
 *
 * @param {Database} db The Firebase realtime database instance.
 * @param {string} userId User UID.
 * @param {string} photoURL Name of the new file, including the suffix (e.g., profile_picture.jpg)
 * @returns {Promise<string>} Full path to the image
 *
 * @example
 * await setProfilePictureURL(db, 'test-user-id', 'profile_picture.jpg');
 */
export async function setProfilePictureURL(
  db: Database,
  userId: string,
  photoURL: string,
): Promise<void> {
  var updates: {[key: string]: string} = {};
  const photoUrlPath = DBPATHS.USERS_USER_ID_PROFILE_PHOTO_URL.getRoute(userId);
  updates[photoUrlPath] = photoURL;
  await update(ref(db), updates);
}

/**
 * Updates the profile information of a user.
 *
 * @param pathToUpload - The path to the file to upload.
 * @param user - The user object.
 * @param auth - The authentication object.
 * @param db - The database object.
 * @param storage - The Firebase storage object.
 * @returns A promise that resolves when the profile information is updated.
 */
export async function updateProfileInfo(
  pathToUpload: string,
  user: User | null,
  auth: Auth,
  db: Database,
  storage: FirebaseStorage,
): Promise<void> {
  if (!user || !auth.currentUser) return;
  const downloadURL = await getDownloadURL(StorageRef(storage, pathToUpload));
  await setProfilePictureURL(db, user.uid, downloadURL);
  await updateProfile(auth.currentUser, {photoURL: downloadURL});
  return;
}
