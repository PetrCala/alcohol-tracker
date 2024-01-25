import {Database, ref, get, update} from 'firebase/database';
import {ProfileData} from '../types/database';
import {
  FirebaseStorage,
  ref as StorageRef,
  getDownloadURL,
} from 'firebase/storage';
import {Auth, User, updateProfile} from 'firebase/auth';

/**
 * Fetch the profile details of a given user.
 *
 * @param {Database} db - The database object against which to validate this conditio
 * @param {string} userId - User ID whose profile details need to be fetched.
 * @returns {Promise<ProfileData>} - Returns the user profile data if they exist, otherwise undefined.
 */
export async function fetchUserProfile(
  db: Database,
  userId: string,
): Promise<ProfileData> {
  const dbRef = ref(db, `/users/${userId}/profile`);
  const snapshot = await get(dbRef);
  return snapshot.val();
}

/**
 * Using a firebase database object and a list of userIds, fetch the profiles of all these users and return them as an array.
 *
 * @param {Database} db Firebase database object
 * @param {string[]} userIds An array of user IDs to fetch
 * @returns {Promise<ProfileData[]>} An array of profile data objects
 */
export function fetchUserProfiles(
  db: Database,
  userIds: string[],
): Promise<ProfileData[]> {
  return Promise.all(userIds.map(id => fetchUserProfile(db, id)));
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
  updates[`users/${userId}/profile/photo_url`] = photoURL;
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
