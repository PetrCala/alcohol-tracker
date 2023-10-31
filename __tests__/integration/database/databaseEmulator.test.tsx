// import firebase from 'firebase/app';
// import 'firebase/database';

// // const firebase = require('@firebase/testing');

// const firebaseConfig = {
//   // Your firebase project config
//   // ...
// };

// const myApp = firebase.initializeTestApp({
//   projectId: 'your-project-id', // Replace with your Firebase project id
//   databaseName: 'your-database-name', // Replace with your database name
// });

// // Point to the running emulator
// myApp.database().useEmulator('localhost', 9000); // Make sure the port matches the one used by your emulator

// describe('Firebase Realtime Database Emulator Tests', () => {
//   it('should write and read data from the database', async () => {
//     const ref = myApp.database().ref('test/path');

//     await ref.set({ key: 'value' });

//     const snapshot = await ref.once('value');
//     const data = snapshot.val();

//     expect(data).toEqual({ key: 'value' });
//   });

//   afterAll(async () => {
//     // Clean up app instances
//     await Promise.all(firebase.apps().map((app: firebase.app.App) => app.delete()));
//   });
  
// });
