import {Alert} from 'react-native';

export const handleErrors = (
  error: any,
  alertHeading: string,
  alertMessage: string,
  dispatch: React.Dispatch<any>,
): null => {
  const err = error.message;
  switch (true) {
    case err.includes('storage/object-not-found'):
      dispatch({type: 'SET_WARNING', payload: 'Object not found'});
      break;
    case err.includes('storage/unauthorized'):
      dispatch({type: 'SET_WARNING', payload: 'Unauthorized access'});
      break;
    // TODO: Add more cases
    case err.includes('auth/missing-email'):
      dispatch({type: 'SET_WARNING', payload: 'Missing email'});
      break;
    case err.includes('auth/invalid-email'):
      dispatch({type: 'SET_WARNING', payload: 'Invalid email'});
      break;
    case err.includes('auth/missing-password'):
      dispatch({type: 'SET_WARNING', payload: 'Missing password'});
      break;
    case err.includes('auth/invalid-credential'):
      dispatch({type: 'SET_WARNING', payload: 'Invalid credentials'});
      break;
    case err.includes('auth/weak-password'):
      dispatch({
        type: 'SET_WARNING',
        payload:
          'Your password is too weak - password should be at least 6 characters',
      });
      break;
    case err.includes('auth/email-already-in-use'):
      dispatch({type: 'SET_WARNING', payload: 'This email is already in use'});
      break;
    case err.includes('auth/user-not-found'):
      dispatch({type: 'SET_WARNING', payload: 'User not found'});
      break;
    case err.includes('auth/wrong-password'):
      dispatch({type: 'SET_WARNING', payload: 'Incorrect password'});
      break;
    case err.includes('auth/network-request-failed'):
      dispatch({type: 'SET_WARNING', payload: 'You are offline'});
      break;
    case err.includes('auth/api-key-not-valid'):
      dispatch({
        type: 'SET_WARNING',
        payload:
          'The app is not configured correctly. Please contact the developer.',
      });
      break;
    case err.includes('auth/too-many-requests'):
      dispatch({
        type: 'SET_WARNING',
        payload: 'Too many requests. Please wait a moment and try again later.',
      });
      break;
    case err.includes('PERMISSION_DENIED: Permission denied'):
      dispatch({
        type: 'SET_WARNING',
        payload:
          'Permission denied. Please contact the administrator for assistance.',
      });
      break;
    default:
      // Uncaught error
      Alert.alert(alertHeading, alertMessage + error.message);
      break;
  }
  return null;
};
