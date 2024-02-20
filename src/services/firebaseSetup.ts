import {initializeApp, FirebaseApp} from 'firebase/app';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

export {app};
