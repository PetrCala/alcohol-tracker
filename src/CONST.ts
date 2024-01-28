// Taken and modified form the Expensify GitHub
// Source: https://github.com/Expensify/App/blob/main/src/CONST.ts

// import Config from 'react-native-config';

// Creating a default array and object this way because objects ({}) and arrays ([]) are not stable types.
// Freezing the array ensures that it cannot be unintentionally modified.
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

const CONST = {
  APP_IN_BETA: true,
  AVAILABLE_PLATFORMS: ['ios', 'android'],
  ENVIRONMENT: {
    DEV: 'development',
    STAGING: 'staging',
    PROD: 'production',
    TEST: 'test',
  },
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  INVALID_CHARS: ['.', '#', '$', '[', ']'],
  MAX_ALLOWED_UNITS: 99,
  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  MONTHS_ABBREVIATED: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  NO_IMAGE: 'NO_IMAGE', // Used for the profile avatar when there is no image
  STORE_LINKS: {
    ANDROID:
      'https://play.google.com/store/apps/details?id=com.alcohol_tracker',
    IOS: 'https://testflight.apple.com/join/DgY9IieL',
  },
  FIREBASE_STORAGE_URL: 'https://firebasestorage.googleapis.com',
} as const;

export default CONST;
