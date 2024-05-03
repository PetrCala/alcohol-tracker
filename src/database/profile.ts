import type {Database} from 'firebase/database';
import {ref, update} from 'firebase/database';
import type {FirebaseStorage} from 'firebase/storage';
import {ref as StorageRef, getDownloadURL} from 'firebase/storage';
import type {Auth, User} from 'firebase/auth';
import {updateProfile} from 'firebase/auth';
import {fetchDisplayDataForUsers} from './baseFunctions';
import type {ProfileList, UserID, UserStatusList} from '@src/types/onyx';
import DBPATHS from './DBPATHS';

/**
 * Fetches user profiles from the database.
 *
 * @param db The database instance.
 * @param userIDs An array of user IDs.
 * @returns A promise that resolves to a list of user profiles.
 */
export async function fetchUserProfiles(
  db: Database,
  userIDs: UserID[],
): Promise<ProfileList> {
  const profileRef = 'users/{userID}/profile'; // TODO clear this up
  return (await fetchDisplayDataForUsers(
    db,
    userIDs,
    profileRef,
  )) as ProfileList;
}

/**
 * Fetches the statuses of multiple users from the database.
 *
 * @param db The database instance.
 * @param userIDs An array of user IDs.
 * @returns A promise that resolves to a UserStatusList object.
 */
export async function fetchUserStatuses(
  db: Database,
  userIDs: UserID[],
): Promise<UserStatusList> {
  const profileRef = 'user_status/{userID}';
  return (await fetchDisplayDataForUsers(
    db,
    userIDs,
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
 * @param db The Firebase realtime database instance.
 * @param userID User UID.
 * @param photoURL Name of the new file, including the suffix (e.g., profile_picture.jpg)
 * @returns Promise with the full path to the image
 *
 * @example
 * await setProfilePictureURL(db, 'test-user-id', 'profile_picture.jpg');
 */
export async function setProfilePictureURL(
  db: Database,
  userID: string,
  photoURL: string,
): Promise<void> {
  const updates: Record<string, string> = {};
  const photoUrlPath = DBPATHS.USERS_USER_ID_PROFILE_PHOTO_URL.getRoute(userID);
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
  if (!user || !auth.currentUser) {
    return;
  }
  const downloadURL = await getDownloadURL(StorageRef(storage, pathToUpload));
  await setProfilePictureURL(db, user.uid, downloadURL);
  await updateProfile(auth.currentUser, {photoURL: downloadURL});
  return;
}
