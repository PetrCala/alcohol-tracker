import {FirebaseStorage, getDownloadURL, ref} from 'firebase/storage';

/**
 * Using the Firebase Storage object, the user UID, and the full name of the
 * profile picture path, fetch the download URL for the picture, which
 * can be directly loaded into the Image URI prop.
 *
 * @param {FirebaseStorage} storage The Firebase Storage object.
 * @param {string} userId User UID.
 * @param {string} downloadURL Full path to where the image can be downloaded on the storage.
 * @returns {Promise<string>} Full path to the image
 *
 * @example
 * const url = await setProfilePictureURL(db, 'test-user-id', 'profile_picture.jpg');
 * console.log(url);
 */
export async function getProfilePictureURL(
  storage: FirebaseStorage,
  userId: string,
  downloadURL: string,
): Promise<string> {
  if (!storage || !userId  || !downloadURL) return '';
  const httpsRef = ref(storage, downloadURL);
  const url = await getDownloadURL(httpsRef);
  return url;
}
