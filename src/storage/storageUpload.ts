import {toPercentageVerbose} from '@libs/DataHandling';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {FirebaseStorage, UploadTaskSnapshot} from 'firebase/storage';
import {ref, uploadBytesResumable} from 'firebase/storage';

/* eslint-disable @lwc/lwc/no-async-await */

/**
 * Uploads an image to Firebase storage.
 *
 * @param storage - The Firebase storage instance.
 * @param uri - The URI of the image to upload.
 * @param pathToUpload - The path in Firebase storage where the image should be uploaded.
 * @param setUploadProgress - Function to update upload progress.
 * @param setSuccess - Function to update success message.
 * @returns A promise that resolves when the upload is complete.
 */
async function uploadImageToFirebase(
  storage: FirebaseStorage,
  uri: string,
  pathToUpload: string,
  setUploadProgress: React.Dispatch<string | null>,
  setSuccess: React.Dispatch<string>,
): Promise<void> {
  if (!uri) {
    throw new Error('No URI provided');
  }

  try {
    const storageRef = ref(storage, pathToUpload);
    const response = await fetch(uri);
    const blob = await response.blob();
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Track the progress
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progressFraction =
          snapshot.bytesTransferred / snapshot.totalBytes;
        const progressVerbose = toPercentageVerbose(progressFraction);
        setUploadProgress(progressVerbose);

        switch (snapshot.state) {
          case 'paused':
            break;
          case 'running':
            break;
          default:
            break;
        }
      },
      (error: unknown) => {
        ErrorUtils.raiseAlert(error, 'Error uploading image');
      },
    );

    await uploadTask;
    setUploadProgress('0');
    setSuccess('Image uploaded successfully');
  } catch (error: unknown) {
    ErrorUtils.raiseAlert(error, 'Error uploading image');
    throw error; // Re-throw the error after handling
  }
}

export default uploadImageToFirebase;
