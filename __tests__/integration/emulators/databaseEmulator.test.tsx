import firebase from 'firebase/app';
import 'firebase/database';
import { app } from '../../../firebaseConfig';



// const firebase = require('@firebase/testing');

const firebaseConfig = {
  // Your firebase project config
  // ...
};

describe('Firebase Realtime Database Emulator Tests', () => {
  it('should write and read data from the database', async () => {
    const ref = app.database().ref('test/path');

    await ref.set({ key: 'value' });

    const snapshot = await ref.once('value');
    const data = snapshot.val();

    expect(data).toEqual({ key: 'value' });
  });

  afterAll(async () => {
    // Clean up app instances
    await Promise.all(firebase.apps().map((app: firebase.app.App) => app.delete()));
  });
  
});
