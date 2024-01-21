import {
  FirebaseStorage,
  StorageReference,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import {Alert} from 'react-native';

/**
 * Uploads a file to the storage.
 *
 * @param file - The file to be uploaded.
 * @returns A promise that resolves when the file is successfully uploaded.
 */
export async function uploadImageToFirebase(
  storage: FirebaseStorage,
  uri: string,
  pathToUpload: string,
  setUploadProgress: React.Dispatch<React.SetStateAction<number | null>>,
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
      // console.log('Upload is ' + progress + '% done');
    },
    (error: any) => {
      // Add a more clever way to handle errors
      Alert.alert('Error uploading image', error.message);
      return;
    },
  );
  return uploadTask.snapshot.ref; // Reference to the storage location
}
