import {Alert} from 'react-native';

function getErrorMessage(error: any): string {
  const err = error.message;
  switch (true) {
    case err.includes('storage/object-not-found'):
      return 'Object not found';
    case err.includes('storage/unauthorized'):
      return 'Unauthorized access';
    case err.includes('auth/missing-email'):
      return 'Missing email';
    case err.includes('auth/invalid-email'):
      return 'Invalid email';
    case err.includes('auth/missing-password'):
      return 'Missing password';
    case err.includes('auth/invalid-credential'):
      return 'Invalid credentials';
    case err.includes('auth/weak-password'):
      return 'Your password is too weak - password should be at least 6 characters';
    case err.includes('auth/email-already-in-use'):
      return 'This email is already in use';
    case err.includes('auth/user-not-found'):
      return 'User not found';
    case err.includes('auth/wrong-password'):
      return 'Incorrect password';
    case err.includes('auth/network-request-failed'):
      return 'You are offline';
    case err.includes('auth/api-key-not-valid'):
      return 'The app is not configured correctly. Please contact the developer.';
    case err.includes('auth/too-many-requests'):
      return 'Too many requests. Please wait a moment and try again later.';
    case err.includes('PERMISSION_DENIED: Permission denied'):
      return 'Permission denied. Please contact the administrator for assistance.';
    default:
      return err;
  }
}

function raiseAlert(
  error: any,
  heading: string = '',
  message: string = '',
): void {
  const payload = getErrorMessage(error);
  console.log('payload', payload);
  Alert.alert(heading ?? 'Unknown error', `${message || ''}` + payload);
}

export {getErrorMessage, raiseAlert};
