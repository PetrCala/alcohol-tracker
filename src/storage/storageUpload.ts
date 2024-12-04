import {toPercentageVerbose} from '@libs/DataHandling';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {FirebaseStorage} from 'firebase/storage';
import {ref, uploadBytesResumable} from 'firebase/storage';

/**
 * Uploads an image to Firebase storage.
 *
 * @param storage - The Firebase storage instance.
 * @param uri - The URI of the image to upload.
 * @param pathToUpload - The path in Firebase storage where the image should be uploaded.
 * @param dispatch - The dispatch function to update the state.
 * @returns A promise that resolves when the upload is complete.
 */
async function uploadImageToFirebase(
  storage: FirebaseStorage,
  uri: string,
  pathToUpload: string,
  setUploadProgress: React.Dispatch<string | null>,
  setSuccess: React.Dispatch<string>,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Wrap the logic in a new Promise
    if (!uri) {
      reject('No URI provided');
      return;
    }
    try {
      const storageRef = ref(storage, pathToUpload);
      const response = await fetch(uri);
      const blob = await response.blob();
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          const progressFraction =
            snapshot.bytesTransferred / snapshot.totalBytes;
          const progressVerbose = toPercentageVerbose(progressFraction);
          setUploadProgress(progressVerbose);
          switch (snapshot.state) {
            case 'paused':
              // console.log('Upload is paused');
              break;
            case 'running':
              // console.log('Upload is running');
              break;
          }
        },
        (error: any) => {
          ErrorUtils.raiseAlert(error, 'Error uploading image');
        },
        () => {
          setUploadProgress('0');
          setSuccess('Image uploaded successfully');
          resolve();
        },
      );
    } catch (error: unknown) {
      reject(error);
    }
  });
}

export default uploadImageToFirebase;
