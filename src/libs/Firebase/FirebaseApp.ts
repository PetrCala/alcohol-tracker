import {initializeApp, FirebaseApp} from 'firebase/app';
import FirebaseConfig from './FirebaseConfig';

// Initialize Firebase
const FirebaseApp: FirebaseApp = initializeApp(FirebaseConfig);

export {FirebaseApp};
