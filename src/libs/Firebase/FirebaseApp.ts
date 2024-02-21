import {initializeApp, FirebaseApp as FirebaseAppProps} from 'firebase/app';
import FirebaseConfig from './FirebaseConfig';

// Initialize Firebase
const FirebaseApp: FirebaseAppProps = initializeApp(FirebaseConfig);

export {FirebaseApp};
