// import 'dotenv/config'
// import { initializeApp } from "firebase/app";
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

// const firebaseConfig = {
//     apiKey: process.env.API_KEY,
//     authDomain: process.env.AUTH_DOMAIN,
//     databaseURL: process.env.DATABASE_URL,
//     projectId: process.env.PROJECT_ID,
//     storageBucket: process.env.STORAGE_BUCKET,
//     messagingSenderId: process.env.MESSAGING_SENDER_ID,
//     appId: process.env.APP_ID,
//     measurementId: process.env.MEASUREMENT_ID
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Auth with React Native persistence
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage)
// });

// // Connect to auth emulator if in development environment
// if (process.env.NODE_ENV === 'test' || process.env.USE_EMULATORS === 'true') {
//     const [authHost, authPort] = FIREBASE_AUTH_EMULATOR_HOST.split(':');

//     connectAuthEmulator(auth, authHost, parseInt(authPort));
// }

// export { app, auth };