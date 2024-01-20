import {FirebaseStorage, getDownloadURL, ref} from 'firebase/storage';

/**
 * Using the Firebase Storage object, the user UID, and the full name of the
 * profile picture path, fetch the download URL for the picture, which
 * can be directly loaded into the Image URI prop.
 *
 * @param {FirebaseStorage} storage The Firebase Storage object.
 * @param {string} userId User UID.
 * @param {string} photoURL Name of the new file, including the suffix (e.g., profile_picture.jpg)
 * @returns {Promise<string>} Full path to the image
 *
 * @example
 * const url = await setProfilePictureURL(db, 'test-user-id', 'profile_picture.jpg');
 * console.log(url);
 */
export async function getProfilePictureURL(
  storage: FirebaseStorage,
  userId: string,
  photoURL: string,
): Promise<string> {
  if (!storage || !userId || !photoURL) return '';
  const imageRef = ref(storage, `users/${userId}/profile/${photoURL}`);
  const url = await getDownloadURL(imageRef);
  return url;
}
