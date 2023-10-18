import { FirebaseStorage, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

/** TODO Add docstring */
export async function uploadImageToFirebase (
    storage:FirebaseStorage, 
    pathToUpload: string, // e.g. `path/to/uploaded/${Date.now()}.jpg`
    uri: string
)  {
    if (!uri) return;

    // const pathToUpload = `path/to/uploaded/${Date.now()}.jpg`

    const storageRef = ref(storage, pathToUpload);

    // Fetch the image from the local file system using its URI:
    const response = await fetch(uri);

    // Convert the response to a blob:
    const blob = await response.blob();

    // Use Firebase's uploadBytesResumable to upload the blob:
    const uploadTask = uploadBytesResumable(storageRef, blob);

    // Optional: Monitor the upload progress:
    uploadTask.on('state_changed', 
        (snapshot:any) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        }, 
        (error:any) => {
        // Handle any errors here, such as by showing a message to the user.
        console.error('Error uploading image:', error);
        }, 
        async () => {
        // Upload completed successfully. Now we can get the download URL:
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('Image available at', downloadURL);
        }
    );
};