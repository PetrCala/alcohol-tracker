import type {FirebaseStorage} from 'firebase/storage';
import {getDownloadURL, ref} from 'firebase/storage';

/* eslint-disable @lwc/lwc/no-async-await */

/**
 * Using the Firebase Storage object, the user UID, and the full name of the
 * profile picture path, fetch the download URL for the picture, which
 * can be directly loaded into the Image URI prop.
 *
 * @param storage The Firebase Storage object.
 * @param userID User UID.
 * @param downloadPath Full path to where the image can be downloaded on the storage.
 * @returns Promise<string>} Full path to the image
 *
 * @example
 * const url = await setProfilePictureURL(db, 'test-user-id', 'profile_picture.jpg');
 * console.log(url);
 */
async function getProfilePictureURL(
  storage: FirebaseStorage,
  userID: string,
  downloadPath: string,
): Promise<string | null> {
  if (!storage || !userID || !downloadPath) {
    throw new Error('Missing parameters');
  }

  const httpsRef = ref(storage, downloadPath);
  const downloadURL = await getDownloadURL(httpsRef);

  return downloadURL;
}

export default getProfilePictureURL;
