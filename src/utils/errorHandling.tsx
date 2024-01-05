import {Alert} from 'react-native';

/** Set the warning hook to include a warning text informing
 * the user of an unsuccessful firebase request. Return an alert
 * in case of an uncaught warning, otherwise return null.
 *
 * @param {any} error Error thrown by the signInWithUserEmailAndPassword method
 * @param {string} alertHeading Error heading message
 * @param {string} alertMessage Error explanation message
 * @param {React.Dispatch} setWarning Function to update the hook with the warning string
 */
export const handleInvalidInput = (
  error: any,
  alertHeading: string,
  alertMessage: string,
  setWarning: React.Dispatch<React.SetStateAction<string>>,
): null => {
  const err = error.message;
  if (err.includes('auth/missing-email')) {
    setWarning('Missing email');
  } else if (err.includes('auth/invalid-email')) {
    setWarning('Invalid email');
  } else if (err.includes('auth/missing-password')) {
    setWarning('Missing password');
  } else if (err.includes('auth/weak-password')) {
    setWarning(
      'Your password is too weak - password should be at least 6 characters',
    );
  } else if (err.includes('auth/email-already-in-use')) {
    setWarning('This email is already in use');
  } else if (err.includes('auth/user-not-found')) {
    setWarning('User not found');
  } else if (err.includes('auth/wrong-password')) {
    setWarning('Incorrect password');
  } else if (err.includes('auth/network-request-failed')) {
    setWarning('You are offline');
  } else if (err.includes('auth/api-key-not-valid')) {
    setWarning(
      'The app is not configured correctly. Please contact the developer.',
    );
  } else {
    // Uncaught error
    Alert.alert(alertHeading, alertMessage + error.message);
  }
  return null;
};

export const handleStorageErrors = (error: any): void => {
  // TODO
  // A full list of error codes is available at
  // https://firebase.google.com/docs/storage/web/handle-errors
  switch (error.code) {
    case 'storage/object-not-found':
      // File doesn't exist
      break;
    case 'storage/unauthorized':
      // User doesn't have permission to access the object
      break;
    case 'storage/canceled':
      // User canceled the upload
      break;

    // ...

    case 'storage/unknown':
      // Unknown error occurred, inspect the server response
      break;
    default:
      Alert.alert(
        'Storage error',
        'Could not fetch data from the storage: ' + error.message,
      );
  }
};
