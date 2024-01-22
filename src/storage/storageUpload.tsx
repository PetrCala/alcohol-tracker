import {handleErrors} from '@src/utils/errorHandling';
import {
  FirebaseStorage,
  StorageReference,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

export async function uploadImageToFirebase(
  storage: FirebaseStorage,
  uri: string,
  pathToUpload: string,
  dispatch: React.Dispatch<any>,
): Promise<StorageReference | void> {
  if (!uri) return;
  const storageRef = ref(storage, pathToUpload);
  const response = await fetch(uri); // Fetch the image from the local file system using its URI:
  const blob = await response.blob(); // Convert the response to a blob:
  const uploadTask = uploadBytesResumable(storageRef, blob); // Use Firebase's uploadBytesResumable to upload the blob:
  // Monitor the upload progress:
  uploadTask.on(
    'state_changed',
    (snapshot: any) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      dispatch({type: 'SET_UPLOAD_PROGRESS', payload: progress});
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
      handleErrors(error, 'Error uploading image', error.message, dispatch);
      return;
    },
    () => {
      // On success
      dispatch({type: 'SET_UPLOAD_PROGRESS', payload: 0});
      dispatch({type: 'SET_SUCESS', payload: 'Image uploaded successfully'});
    },
  );
  return uploadTask.snapshot.ref; // Reference to the storage location
}
