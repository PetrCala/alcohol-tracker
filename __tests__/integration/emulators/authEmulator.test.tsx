import Config from 'react-native-config';
import { app, auth } from '../../../src/services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Never run these tests outside of the emulator environment
const shouldRunTests = Config.USE_EMULATORS === 'true';

const describeWithEmulator = shouldRunTests ? describe : describe.skip;

describeWithEmulator('Firebase Auth Emulator', () => {
  
  it('should initialize', () => {
    // TODO
    expect(1).toEqual(1);
  });
  // it('should create a new user', async () => {
  //   const newUserEmail = 'newuser@example.com';
  //   const newUserPassword = 'password';

  //   const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
  //   expect(userCredential.user).toBeTruthy();
  //   expect(userCredential.user.email).toBe(newUserEmail);
  // });
});