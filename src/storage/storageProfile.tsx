import {FirebaseStorage, getDownloadURL, ref} from 'firebase/storage';

/**
 * Using the Firebase Storage object, the user UID, and the full name of the
 * profile picture path, fetch the download URL for the picture, which
 * can be directly loaded into the Image URI prop.
 *
 * @param {FirebaseStorage} storage The Firebase Storage object.
 * @param {string} userId User UID.
 * @param {string} downloadPath Full path to where the image can be downloaded on the storage.
 * @returns Promise<string>} Full path to the image
 *
 * @example
 * const url = await setProfilePictureURL(db, 'test-user-id', 'profile_picture.jpg');
 * console.log(url);
 */
export async function getProfilePictureURL(
  storage: FirebaseStorage,
  userId: string,
  downloadPath: string,
): Promise<string | null> {
  if (!storage || !userId  || !downloadPath) return null;
  const httpsRef = ref(storage, downloadPath);
  const downloadURL = await getDownloadURL(httpsRef);
  return downloadURL;
}
