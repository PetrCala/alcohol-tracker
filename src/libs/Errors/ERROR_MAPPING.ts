import ERRORS from '@src/ERRORS';
import {ErrorMapping} from './types';

/**
 * A list of known error keys with short titles and descriptive messages.
 * Update or extend this array as needed.
 */
const ERROR_MAPPING: ErrorMapping[] = [
  {
    key: ERRORS.STORAGE.OBJECT_NOT_FOUND,
    title: 'Object Not Found',
    message:
      'The requested object could not be found. Please check the details and try again.',
  },
  {
    key: ERRORS.STORAGE.UNAUTHORIZED,
    title: 'Unauthorized Access',
    message:
      'You do not have the necessary permissions to perform this action.',
  },
  {
    key: ERRORS.AUTH.MISSING_EMAIL,
    title: 'Missing Email',
    message: 'Please provide a valid email address to continue.',
  },
  {
    key: ERRORS.AUTH.INVALID_EMAIL,
    title: 'Invalid Email',
    message:
      'The email address provided is not valid. Please check and try again.',
  },
  {
    key: ERRORS.AUTH.VERIFY_EMAIL,
    title: 'Email Verification Required',
    message: 'Please verify your email address before making changes to it.',
  },
  {
    key: ERRORS.AUTH.MISSING_PASSWORD,
    title: 'Missing Password',
    message: 'A password is required to proceed. Please enter your password.',
  },
  {
    key: ERRORS.AUTH.INVALID_CREDENTIAL,
    title: 'Invalid Credentials',
    message:
      'The credentials provided are incorrect. Please check and try again.',
  },
  {
    key: ERRORS.AUTH.WEAK_PASSWORD,
    title: 'Weak Password',
    message:
      'Your password must be at least 6 characters long. Please choose a stronger password.',
  },
  {
    key: ERRORS.AUTH.EMAIL_ALREADY_IN_USE,
    title: 'Email Already in Use',
    message: 'The email address is already associated with another account.',
  },
  {
    key: ERRORS.AUTH.USER_NOT_FOUND,
    title: 'User Not Found',
    message:
      'No user account matches the provided details. Please sign up or try again.',
  },
  {
    key: ERRORS.AUTH.WRONG_PASSWORD,
    title: 'Incorrect Password',
    message: 'The password entered is incorrect. Please try again.',
  },
  {
    key: ERRORS.AUTH.NETWORK_REQUEST_FAILED,
    title: 'Offline',
    message:
      'You appear to be offline. Please check your internet connection and try again.',
  },
  {
    key: ERRORS.AUTH.REQUIRES_RECENT_LOGIN,
    title: 'Session Expired',
    message: 'For security reasons, please log in again to proceed.',
  },
  {
    key: ERRORS.AUTH.API_KEY_NOT_VALID,
    title: 'Configuration Error',
    message:
      'The app is not configured correctly. Please contact the developer for assistance.',
  },
  {
    key: ERRORS.AUTH.TOO_MANY_REQUESTS,
    title: 'Too Many Requests',
    message:
      'You have made too many requests. Please wait a while before trying again.',
  },
  {
    key: ERRORS.PERMISSION_DENIED,
    title: 'Permission Denied',
    message:
      'You do not have the necessary permissions. Contact the administrator for help.',
  },
  {
    key: ERRORS.DATABASE.DATA_FETCH_FAILED,
    title: 'Data Fetch Failed',
    message: 'An error occurred while fetching data. Please try again later.',
  },
  {
    key: ERRORS.DATABASE.OUTDATED_APP_VERSION,
    title: 'Outdated App Version',
    message:
      'Your app version is outdated. Please update to the latest version.',
  },
  {
    key: ERRORS.DATABASE.ACCOUNT_CREATION_LIMIT_EXCEEDED,
    title: 'Rate Limit Exceeded',
    message:
      'You have exceeded the rate limit for account creation. Please try again later.',
  },
  {
    key: ERRORS.DATABASE.USER_CREATION_FAILED,
    title: 'User Creation Failed',
    message: 'There was an issue creating the user account. Please try again.',
  },
  {
    key: ERRORS.UNKNOWN,
    title: 'Unknown error',
    message: 'An unknown error occurred',
  },
];

export default ERROR_MAPPING;
