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
  switch (true) {
    case err.includes('auth/missing-email'):
      setWarning('Missing email');
      break;
    case err.includes('auth/invalid-email'):
      setWarning('Invalid email');
      break;
    case err.includes('auth/missing-password'):
      setWarning('Missing password');
      break;
    case err.includes('auth/invalid-credential'):
      setWarning('Invalid credentials');
      break;
    case err.includes('auth/weak-password'):
      setWarning(
        'Your password is too weak - password should be at least 6 characters',
      );
      break;
    case err.includes('auth/email-already-in-use'):
      setWarning('This email is already in use');
      break;
    case err.includes('auth/user-not-found'):
      setWarning('User not found');
      break;
    case err.includes('auth/wrong-password'):
      setWarning('Incorrect password');
      break;
    case err.includes('auth/network-request-failed'):
      setWarning('You are offline');
      break;
    case err.includes('auth/api-key-not-valid'):
      setWarning(
        'The app is not configured correctly. Please contact the developer.',
      );
      break;
    case err.includes('auth/too-many-requests'):
      setWarning(
        'Too many requests. Please wait a moment and try again later.',
      );
      break;
    case err.includes('PERMISSION_DENIED: Permission denied'):
      setWarning(
        'Permission denied. Please contact the administrator for assistance.',
      );
      break;
    default:
      // Uncaught error
      Alert.alert(alertHeading, alertMessage + error.message);
      break;
  }
  return null;
};

export const handleStorageErrors = (
  error: any,
  alertHeading: string,
  alertMessage: string,
  setWarning: React.Dispatch<React.SetStateAction<string>>,
): void => {
  // A full list of error codes is available at
  // https://firebase.google.com/docs/storage/web/handle-errors
  // const err = error.message;
  // switch (true) {
  //   case err.includes('auth/missing-email'):
  switch (error.code) {
    case 'storage/object-not-found':
      // File doesn't exist
      break;
    case 'storage/unauthorized':
      setWarning('Authorization error');
      break;
    case 'storage/canceled':
      // User canceled the upload
      break;

    case 'storage/invalid-url':
      // Invalid image url
      break;
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
